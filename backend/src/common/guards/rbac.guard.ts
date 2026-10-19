import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service.js';
import { ROLES_KEY } from '../decorators/roles.decorator.js';

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // 1. Extract and verify JWT Token
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token autentikasi tidak ditemukan');
    }

    const token = authHeader.split(' ')[1];
    let payload: any;
    try {
      payload = this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException('Token autentikasi tidak valid atau telah kedaluwarsa');
    }

    const userId = payload.sub;
    if (!userId) {
      throw new UnauthorizedException('Token payload tidak valid');
    }

    // 2. Identify requested active role from X-Active-Role header
    const rawHeader = request.headers['x-active-role'];
    const requestedRole = Array.isArray(rawHeader)
      ? rawHeader[0]?.toUpperCase()
      : (rawHeader as string)?.toUpperCase() || payload.activeRole || 'REGULAR_USER';

    // 3. Verify user has this role active in user_roles table
    const userRole = await this.prisma.userRole.findFirst({
      where: {
        userId: userId,
        roleId: requestedRole,
        status: 'ACTIVE',
      },
    });

    if (!userRole) {
      throw new ForbiddenException('INSUFFICIENT_ROLE_PERMISSIONS');
    }

    // 4. Check if endpoint requires specific roles
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (requiredRoles && requiredRoles.length > 0) {
      const hasPermission = requiredRoles.includes(requestedRole);
      if (!hasPermission) {
        throw new ForbiddenException('INSUFFICIENT_ROLE_PERMISSIONS');
      }
    }

    // 5. Inject user and activeRole context into request
    request.user = {
      id: userId,
      username: payload.username,
      roles: payload.roles,
    };
    request.activeRole = requestedRole;
    request.userRoleMetadata = userRole.metadata;

    // If MERCHANT, attach shop info
    if (requestedRole === 'MERCHANT') {
      const shop = await this.prisma.shop.findUnique({
        where: { ownerId: userId },
        select: { id: true, shopName: true, slug: true },
      });
      request.store = shop;
      request.storeId = shop?.id;
    }

    return true;
  }
}

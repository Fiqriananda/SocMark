import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RbacGuard } from './rbac.guard.js';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service.js';

describe('RbacGuard', () => {
  let guard: RbacGuard;
  let reflector: Reflector;
  let jwtService: JwtService;
  let prisma: PrismaService;

  beforeEach(() => {
    reflector = new Reflector();
    jwtService = {
      verify: vi.fn(),
    } as unknown as JwtService;
    prisma = {
      userRole: {
        findFirst: vi.fn(),
      },
      shop: {
        findUnique: vi.fn(),
      },
    } as unknown as PrismaService;

    guard = new RbacGuard(reflector, jwtService, prisma);
  });

  function mockContext(authHeader?: string, activeRoleHeader?: string) {
    const request = {
      headers: {
        authorization: authHeader,
        'x-active-role': activeRoleHeader,
      },
      user: null as any,
      activeRole: null as any,
    };

    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as any;
  }

  it('throws UnauthorizedException if no Authorization header', async () => {
    const ctx = mockContext(undefined);
    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });

  it('throws UnauthorizedException if JWT is invalid', async () => {
    const ctx = mockContext('Bearer invalid.jwt.token');
    vi.spyOn(jwtService, 'verify').mockImplementation(() => {
      throw new Error('Invalid');
    });

    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });

  it('throws ForbiddenException if user does not have active role in user_roles', async () => {
    const ctx = mockContext('Bearer valid.jwt.token', 'MERCHANT');
    vi.spyOn(jwtService, 'verify').mockReturnValue({ sub: 'user-123', username: 'testuser' });
    vi.spyOn(prisma.userRole, 'findFirst').mockResolvedValue(null);

    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
  });

  it('throws ForbiddenException if route requires MERCHANT but user active role is REGULAR_USER', async () => {
    const ctx = mockContext('Bearer valid.jwt.token', 'REGULAR_USER');
    vi.spyOn(jwtService, 'verify').mockReturnValue({ sub: 'user-123', username: 'testuser' });
    vi.spyOn(prisma.userRole, 'findFirst').mockResolvedValue({
      id: 'ur-1',
      userId: 'user-123',
      roleId: 'REGULAR_USER',
      status: 'ACTIVE',
      metadata: {},
    } as any);
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['MERCHANT']);

    await expect(guard.canActivate(ctx)).rejects.toThrow(new ForbiddenException('INSUFFICIENT_ROLE_PERMISSIONS'));
  });

  it('grants access if user has required role active', async () => {
    const ctx = mockContext('Bearer valid.jwt.token', 'MERCHANT');
    vi.spyOn(jwtService, 'verify').mockReturnValue({ sub: 'user-123', username: 'testuser' });
    vi.spyOn(prisma.userRole, 'findFirst').mockResolvedValue({
      id: 'ur-1',
      userId: 'user-123',
      roleId: 'MERCHANT',
      status: 'ACTIVE',
      metadata: {},
    } as any);
    vi.spyOn(prisma.shop, 'findUnique').mockResolvedValue({
      id: 'shop-1',
      shopName: 'Test Shop',
      slug: 'test-shop',
    } as any);
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['MERCHANT']);

    const canActivate = await guard.canActivate(ctx);
    expect(canActivate).toBe(true);

    const req = ctx.switchToHttp().getRequest();
    expect(req.activeRole).toBe('MERCHANT');
    expect(req.storeId).toBe('shop-1');
  });
});

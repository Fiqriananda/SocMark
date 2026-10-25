import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { RbacService } from './rbac.service.js';
import { RbacGuard } from '../common/guards/rbac.guard.js';
import { ActiveRole, CurrentUser } from '../common/decorators/active-role.decorator.js';
import { SwitchRoleDTO } from './dto/switch-role.dto.js';

@Controller('api/v1/me')
@UseGuards(RbacGuard)
export class MeController {
  constructor(private rbacService: RbacService) {}

  @Get('roles')
  async getRoles(@CurrentUser() user: any, @ActiveRole() activeRole: string) {
    return this.rbacService.getUserRoles(user.id, activeRole);
  }

  @Post('switch-role')
  @HttpCode(HttpStatus.OK)
  async switchRole(@CurrentUser() user: any, @Body() dto: SwitchRoleDTO) {
    return this.rbacService.switchRole(user.id, dto.role);
  }
}

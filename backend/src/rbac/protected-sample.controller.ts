import { Controller, Get, UseGuards } from '@nestjs/common';
import { RbacGuard } from '../common/guards/rbac.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { ActiveRole, CurrentUser } from '../common/decorators/active-role.decorator.js';

@Controller('api/v1')
@UseGuards(RbacGuard)
export class ProtectedSampleController {
  /**
   * Only MERCHANT can access merchant dashboard and fulfillment
   */
  @Get('merchant/dashboard')
  @Roles('MERCHANT')
  getMerchantDashboard(@CurrentUser() user: any, @ActiveRole() role: string) {
    return {
      message: 'Welcome to merchant dashboard',
      merchantId: user.id,
      role,
    };
  }
}

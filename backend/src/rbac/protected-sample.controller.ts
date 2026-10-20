import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { RbacGuard } from '../common/guards/rbac.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { ActiveRole, CurrentUser } from '../common/decorators/active-role.decorator.js';

@Controller('api/v1')
@UseGuards(RbacGuard)
export class ProtectedSampleController {
  /**
   * Only CONTENT_CREATOR and MERCHANT can create posts
   */
  @Post('posts')
  @Roles('CONTENT_CREATOR', 'MERCHANT')
  createPost(@CurrentUser() user: any, @ActiveRole() role: string) {
    return {
      message: 'Post created successfully',
      authorId: user.id,
      publishedAsRole: role,
    };
  }

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

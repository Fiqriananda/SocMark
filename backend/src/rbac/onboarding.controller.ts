import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { RbacService } from './rbac.service.js';
import { RbacGuard } from '../common/guards/rbac.guard.js';
import { CurrentUser } from '../common/decorators/active-role.decorator.js';
import { CreatorOnboardingDTO } from './dto/creator-onboarding.dto.js';
import { MerchantKycDTO } from './dto/merchant-kyc.dto.js';

@Controller('api/v1/onboarding')
@UseGuards(RbacGuard)
export class OnboardingController {
  constructor(private rbacService: RbacService) {}

  @Post('creator')
  @HttpCode(HttpStatus.CREATED)
  async onboardCreator(
    @CurrentUser() user: any,
    @Body() dto: CreatorOnboardingDTO,
  ) {
    return this.rbacService.onboardCreator(user.id, dto);
  }

  @Post('merchant/kyc')
  @HttpCode(HttpStatus.CREATED)
  async submitMerchantKyc(
    @CurrentUser() user: any,
    @Body() dto: MerchantKycDTO,
  ) {
    return this.rbacService.submitMerchantKyc(user.id, dto);
  }
}

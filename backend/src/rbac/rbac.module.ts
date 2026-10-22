import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../prisma/prisma.module.js';
import { EncryptionService } from '../common/crypto/encryption.service.js';
import { RbacService } from './rbac.service.js';
import { RbacGuard } from '../common/guards/rbac.guard.js';
import { MeController } from './me.controller.js';
import { OnboardingController } from './onboarding.controller.js';
import { ProtectedSampleController } from './protected-sample.controller.js';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretKey',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [MeController, OnboardingController, ProtectedSampleController],
  providers: [RbacService, EncryptionService, RbacGuard],
  exports: [RbacService, EncryptionService, RbacGuard],
})
export class RbacModule {}

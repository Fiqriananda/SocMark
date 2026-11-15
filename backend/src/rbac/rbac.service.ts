import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service.js';
import { EncryptionService } from '../common/crypto/encryption.service.js';
import { CreatorOnboardingDTO } from './dto/creator-onboarding.dto.js';
import { MerchantKycDTO } from './dto/merchant-kyc.dto.js';

@Injectable()
export class RbacService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private encryptionService: EncryptionService,
  ) {}

  /**
   * Get all assigned roles for user and identify active role
   */
  async getUserRoles(userId: string, currentActiveRole?: string) {
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId },
      include: {
        role: true,
      },
      orderBy: { grantedAt: 'asc' },
    });

    const activeRoles = userRoles.filter((ur) => ur.status === 'ACTIVE');
    const roleIds = activeRoles.map((ur) => ur.roleId);

    // Determine active role
    let activeRole = currentActiveRole;
    if (!activeRole || !roleIds.includes(activeRole)) {
      activeRole = roleIds.includes('REGULAR_USER') ? 'REGULAR_USER' : roleIds[0] || 'REGULAR_USER';
    }

    // If MERCHANT, check if shop exists
    let storeInfo: any = null;
    if (roleIds.includes('MERCHANT')) {
      storeInfo = await this.prisma.shop.findUnique({
        where: { ownerId: userId },
        select: { id: true, shopName: true, slug: true },
      });
    }

    return {
      activeRole,
      roles: userRoles.map((ur) => ({
        roleId: ur.roleId,
        name: ur.role?.name || ur.roleId,
        description: ur.role?.description || '',
        status: ur.status,
        metadata: ur.metadata,
      })),
      context: {
        store: storeInfo,
      },
    };
  }

  /**
   * Switch the active role context
   */
  async switchRole(userId: string, targetRole: string) {
    const roleUpper = targetRole.toUpperCase();

    // Verify user has this role with ACTIVE status
    const userRole = await this.prisma.userRole.findFirst({
      where: {
        userId,
        roleId: roleUpper,
        status: 'ACTIVE',
      },
    });

    if (!userRole) {
      throw new ForbiddenException('INSUFFICIENT_ROLE_PERMISSIONS');
    }

    // Fetch user basic info
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          where: { status: 'ACTIVE' },
          select: { roleId: true },
        },
      },
    });

    if (!user) throw new NotFoundException('User tidak ditemukan');

    const activeRoles = user.userRoles.map((ur) => ur.roleId);

    // Generate refreshed token with updated activeRole
    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
      roles: activeRoles,
      activeRole: roleUpper,
    };

    const newAccessToken = this.jwtService.sign(payload);

    let context: any = {};
    if (roleUpper === 'MERCHANT') {
      const shop = await this.prisma.shop.findUnique({
        where: { ownerId: userId },
        select: { id: true, shopName: true, slug: true },
      });
      context = { storeId: shop?.id, storeName: shop?.shopName };
    }

    return {
      message: 'Role berhasil diganti',
      activeRole: roleUpper,
      accessToken: newAccessToken,
      context,
    };
  }

  /**
   * Submit Creator onboarding application
   */
  async onboardCreator(userId: string, dto: CreatorOnboardingDTO) {
    // 1. Create or update creator profile
    const profile = await this.prisma.creatorProfile.upsert({
      where: { userId },
      update: {
        contentNiche: dto.contentNiche,
        socialLinks: dto.socialLinks || {},
        portfolioUrl: dto.portfolioUrl || null,
        status: 'APPROVED',
      },
      create: {
        userId,
        contentNiche: dto.contentNiche,
        socialLinks: dto.socialLinks || {},
        portfolioUrl: dto.portfolioUrl || null,
        status: 'APPROVED',
      },
    });

    // 2. Grant or activate CONTENT_CREATOR role
    await this.prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId,
          roleId: 'CONTENT_CREATOR',
        },
      },
      update: {
        status: 'ACTIVE',
      },
      create: {
        userId,
        roleId: 'CONTENT_CREATOR',
        status: 'ACTIVE',
        metadata: {
          creatorProfileId: profile.id,
        },
      },
    });

    return {
      message: 'Onboarding Creator berhasil',
      profile,
      role: 'CONTENT_CREATOR',
      status: 'ACTIVE',
    };
  }

  /**
   * Submit Merchant KYC application
   */
  async submitMerchantKyc(userId: string, dto: MerchantKycDTO) {
    // Check if storeSlug is already taken in shops or merchant_kyc
    const existingKyc = await this.prisma.merchantKyc.findUnique({
      where: { storeSlug: dto.storeSlug },
    });
    if (existingKyc && existingKyc.userId !== userId) {
      throw new ConflictException('Slug toko sudah digunakan oleh toko lain');
    }

    const existingShop = await this.prisma.shop.findUnique({
      where: { slug: dto.storeSlug },
    });
    if (existingShop && existingShop.ownerId !== userId) {
      throw new ConflictException('Slug toko sudah digunakan');
    }

    // Encrypt sensitive PII
    const encryptedKtp = this.encryptionService.encrypt(dto.idCardNumber);
    const encryptedTaxId = dto.taxIdNumber ? this.encryptionService.encrypt(dto.taxIdNumber) : null;
    const encryptedBankAccount = {
      bankName: dto.bankAccount.bankName,
      accountNumber: this.encryptionService.encrypt(dto.bankAccount.accountNumber),
      holderName: dto.bankAccount.holderName,
    };

    // Save or update merchant_kyc application
    const kyc = await this.prisma.merchantKyc.create({
      data: {
        userId,
        storeName: dto.storeName,
        storeSlug: dto.storeSlug,
        idCardNumber: encryptedKtp,
        taxIdNumber: encryptedTaxId,
        bankAccount: encryptedBankAccount,
        warehouseAddress: dto.warehouseAddress as any,
        documents: dto.documents as any,
        status: 'PENDING',
      },
    });

    // Record PENDING_VERIFICATION user_role
    await this.prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId,
          roleId: 'MERCHANT',
        },
      },
      update: {
        status: 'PENDING_VERIFICATION',
        metadata: { kycId: kyc.id, storeName: dto.storeName },
      },
      create: {
        userId,
        roleId: 'MERCHANT',
        status: 'PENDING_VERIFICATION',
        metadata: { kycId: kyc.id, storeName: dto.storeName },
      },
    });

    return {
      message: 'Dokumen toko Anda berhasil dikirim dan sedang dalam peninjauan admin 1x24 jam.',
      kycId: kyc.id,
      status: 'PENDING',
    };
  }
}

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RbacService } from './rbac.service.js';
import { ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { JwtService } from '@nestjs/jwt';
import { EncryptionService } from '../common/crypto/encryption.service.js';

describe('RbacService', () => {
  let service: RbacService;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let encryptionService: EncryptionService;

  beforeEach(() => {
    prisma = {
      userRole: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        upsert: vi.fn(),
      },
      user: {
        findUnique: vi.fn(),
      },
      shop: {
        findUnique: vi.fn(),
      },
      creatorProfile: {
        upsert: vi.fn(),
      },
      merchantKyc: {
        findUnique: vi.fn(),
        create: vi.fn(),
      },
    } as unknown as PrismaService;

    jwtService = {
      sign: vi.fn().mockReturnValue('mock.jwt.token'),
    } as unknown as JwtService;

    encryptionService = new EncryptionService();

    service = new RbacService(prisma, jwtService, encryptionService);
  });

  describe('getUserRoles', () => {
    it('returns assigned roles and determines activeRole', async () => {
      vi.spyOn(prisma.userRole, 'findMany').mockResolvedValue([
        {
          id: '1',
          userId: 'u1',
          roleId: 'REGULAR_USER',
          status: 'ACTIVE',
          metadata: {},
          role: { id: 'REGULAR_USER', name: 'Buyer', description: 'Desc' },
        },
        {
          id: '2',
          userId: 'u1',
          roleId: 'CONTENT_CREATOR',
          status: 'ACTIVE',
          metadata: {},
          role: { id: 'CONTENT_CREATOR', name: 'Creator', description: 'Desc' },
        },
      ] as any);

      const result = await service.getUserRoles('u1', 'CONTENT_CREATOR');
      expect(result.activeRole).toBe('CONTENT_CREATOR');
      expect(result.roles).toHaveLength(2);
      expect(result.roles[0].roleId).toBe('REGULAR_USER');
    });
  });

  describe('switchRole', () => {
    it('throws ForbiddenException if user lacks active target role', async () => {
      vi.spyOn(prisma.userRole, 'findFirst').mockResolvedValue(null);

      await expect(service.switchRole('u1', 'MERCHANT')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('returns new accessToken and context upon successful role switch', async () => {
      vi.spyOn(prisma.userRole, 'findFirst').mockResolvedValue({
        id: 'ur-1',
        userId: 'u1',
        roleId: 'MERCHANT',
        status: 'ACTIVE',
      } as any);

      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue({
        id: 'u1',
        username: 'seller1',
        role: 'user',
        userRoles: [{ roleId: 'REGULAR_USER' }, { roleId: 'MERCHANT' }],
      } as any);

      vi.spyOn(prisma.shop, 'findUnique').mockResolvedValue({
        id: 'shop-123',
        shopName: 'Mega Store',
        slug: 'mega-store',
      } as any);

      const result = await service.switchRole('u1', 'MERCHANT');
      expect(result.activeRole).toBe('MERCHANT');
      expect(result.accessToken).toBe('mock.jwt.token');
      expect(result.context.storeId).toBe('shop-123');
    });
  });

  describe('onboardCreator', () => {
    it('upserts creator profile and grants active CONTENT_CREATOR role', async () => {
      vi.spyOn(prisma.creatorProfile, 'upsert').mockResolvedValue({
        id: 'cp-1',
        userId: 'u1',
        contentNiche: ['Tech'],
        status: 'APPROVED',
      } as any);
      vi.spyOn(prisma.userRole, 'upsert').mockResolvedValue({} as any);

      const result = await service.onboardCreator('u1', {
        contentNiche: ['Tech'],
        socialLinks: { instagram: '@techguy' },
      });

      expect(result.role).toBe('CONTENT_CREATOR');
      expect(result.status).toBe('ACTIVE');
    });
  });

  describe('submitMerchantKyc', () => {
    it('encrypts sensitive PII and creates pending KYC application', async () => {
      vi.spyOn(prisma.merchantKyc, 'findUnique').mockResolvedValue(null);
      vi.spyOn(prisma.shop, 'findUnique').mockResolvedValue(null);
      vi.spyOn(prisma.merchantKyc, 'create').mockResolvedValue({
        id: 'kyc-123',
        status: 'PENDING',
      } as any);
      vi.spyOn(prisma.userRole, 'upsert').mockResolvedValue({} as any);

      const result = await service.submitMerchantKyc('u1', {
        storeName: 'Gadget Store',
        storeSlug: 'gadget-store',
        idCardNumber: '3201234567890001',
        taxIdNumber: '09.123.456.7-123.000',
        bankAccount: {
          bankName: 'BCA',
          accountNumber: '1234567890',
          holderName: 'John Doe',
        },
        warehouseAddress: {
          subDistrictId: 'sub-1',
          postalCode: '12345',
          address: 'Jl. Sudirman No 1',
        },
        documents: {
          ktpUrl: 'https://s3.example.com/ktp.jpg',
        },
      });

      expect(result.kycId).toBe('kyc-123');
      expect(result.status).toBe('PENDING');
      expect(prisma.merchantKyc.create).toHaveBeenCalled();
    });
  });
});

import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service.js';
import { CartService } from './cart.service.js';

describe('CartService', () => {
  let service: CartService;
  let prisma: {
    product: { findUnique: any };
    cartItem: { findFirst: any; update: any; create: any; aggregate: any; findMany: any };
    feedAttributionEvent: { create: any };
  };

  beforeEach(async () => {
    prisma = {
      product: {
        findUnique: vi.fn(),
      },
      cartItem: {
        findFirst: vi.fn(),
        update: vi.fn(),
        create: vi.fn(),
        aggregate: vi.fn(),
        findMany: vi.fn(),
      },
      feedAttributionEvent: {
        create: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
  });

  describe('addItem', () => {
    it('should throw NotFoundException if product is not found', async () => {
      prisma.product.findUnique.mockResolvedValue(null);

      await expect(
        service.addItem('user-1', {
          productId: 'non-existent',
          quantity: 1,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if product is not active', async () => {
      prisma.product.findUnique.mockResolvedValue({
        id: 'prod-1',
        status: 'draft',
        variants: [],
      });

      await expect(
        service.addItem('user-1', {
          productId: 'prod-1',
          quantity: 1,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should add item, record attribution telemetry, and return updated badge count', async () => {
      prisma.product.findUnique.mockResolvedValue({
        id: 'prod-1',
        title: 'Kemeja Flanel',
        status: 'active',
        shop: { id: 'shop-1', shopName: 'Flannel Store' },
        variants: [{ id: 'var-1', variantName: 'Size M' }],
      });

      prisma.cartItem.findFirst.mockResolvedValue(null);
      prisma.cartItem.create.mockResolvedValue({
        id: 'cart-item-1',
        userId: 'user-1',
        productId: 'prod-1',
        variantId: 'var-1',
        quantity: 2,
        sourcePostId: 'post-99',
      });
      prisma.cartItem.aggregate.mockResolvedValue({
        _sum: { quantity: 2 },
      });

      const result = await service.addItem('user-1', {
        productId: 'prod-1',
        variantId: 'var-1',
        quantity: 2,
        sourcePostId: 'post-99',
      });

      expect(result.success).toBe(true);
      expect(result.cartItemCount).toBe(2);
      expect(result.item.productName).toBe('Kemeja Flanel');
      expect(prisma.feedAttributionEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'user-1',
            postId: 'post-99',
            productId: 'prod-1',
            eventType: 'QUICK_CART_ADD',
          }),
        }),
      );
    });
  });
});

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AddToCartDto } from './dto/add-to-cart.dto.js';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Add an item to cart directly from video tag (Zero-Click Cart)
   * with creator attribution tracking.
   */
  async addItem(userId: string, dto: AddToCartDto) {
    let product = null;
    try {
      product = await this.prisma.product.findUnique({
        where: { id: dto.productId },
        include: {
          shop: {
            select: {
              id: true,
              shopName: true,
            },
          },
          variants: true,
        },
      });
    } catch {
      throw new NotFoundException('Produk tidak ditemukan');
    }

    if (!product) {
      throw new NotFoundException('Produk tidak ditemukan');
    }


    if (product.status !== 'active') {
      throw new BadRequestException('Produk tidak aktif dan tidak dapat dibeli');
    }

    let selectedVariant = null;
    if (dto.variantId && dto.variantId !== 'default') {
      selectedVariant = product.variants.find((v) => v.id === dto.variantId);
      if (!selectedVariant) {
        throw new BadRequestException('Varian yang dipilih tidak valid');
      }
    }

    const quantity = dto.quantity && dto.quantity > 0 ? dto.quantity : 1;
    const variantIdToSave = selectedVariant ? selectedVariant.id : null;

    // Check if item already exists in cart for this user
    const existingItem = await this.prisma.cartItem.findFirst({
      where: {
        userId,
        productId: dto.productId,
        variantId: variantIdToSave,
      },
    });

    let savedItem;
    if (existingItem) {
      savedItem = await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + quantity,
          sourcePostId: dto.sourcePostId || existingItem.sourcePostId,
        },
      });
    } else {
      savedItem = await this.prisma.cartItem.create({
        data: {
          userId,
          productId: dto.productId,
          variantId: variantIdToSave,
          quantity,
          sourcePostId: dto.sourcePostId || null,
        },
      });
    }

    // Record telemetry event: QUICK_CART_ADD
    if (dto.sourcePostId) {
      try {
        await this.prisma.feedAttributionEvent.create({
          data: {
            userId,
            postId: dto.sourcePostId,
            productId: dto.productId,
            eventType: 'QUICK_CART_ADD',
            metadata: {
              quantity,
              variantId: variantIdToSave,
              timestamp: new Date().toISOString(),
            },
          },
        });
      } catch {
        // Telemetry errors should not block user cart operation
      }
    }

    // Calculate total count across cart for badge counter
    const aggregation = await this.prisma.cartItem.aggregate({
      where: { userId },
      _sum: { quantity: true },
    });

    const cartItemCount = aggregation._sum.quantity || 0;

    return {
      success: true,
      cartItemCount,
      item: {
        id: savedItem.id,
        productId: savedItem.productId,
        productName: product.title,
        storeName: product.shop?.shopName || 'SocMark Store',
        variantId: savedItem.variantId,
        variantName: selectedVariant?.variantName || 'Standar',
        quantity: savedItem.quantity,
        sourcePostId: savedItem.sourcePostId,
      },
    };
  }

  /**
   * Get all cart items for the logged-in user.
   */
  async getCart(userId: string) {
    const items = await this.prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            shop: {
              select: {
                id: true,
                shopName: true,
              },
            },
            images: {
              take: 1,
              orderBy: { sortOrder: 'asc' },
              select: { imageUrl: true },
            },
          },
        },
        variant: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalQuantity = items.reduce((acc, curr) => acc + curr.quantity, 0);

    return {
      cartItemCount: totalQuantity,
      items: items.map((item) => ({
        id: item.id,
        productId: item.productId,
        name: item.product.title,
        storeName: item.product.shop?.shopName || 'SocMark Store',
        thumbnail: item.product.images[0]?.imageUrl || '',
        price:
          Number(item.product.basePrice) +
          Number(item.variant?.priceAdjustment || 0),
        variantId: item.variantId,
        variantName: item.variant?.variantName || null,
        quantity: item.quantity,
        sourcePostId: item.sourcePostId,
      })),
    };
  }
}

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreatePostDto } from './dto/create-post.dto.js';
import { QueryFeedDto } from './dto/query-feed.dto.js';

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new shoppable video post with product pins.
   * Only CONTENT_CREATOR or MERCHANT can execute this.
   */
  async create(userId: string, dto: CreatePostDto) {
    if (dto.productTags && dto.productTags.length > 0) {
      for (const tag of dto.productTags) {
        let product = null;
        try {
          product = await this.prisma.product.findUnique({
            where: { id: tag.productId },
            include: { variants: true },
          });
        } catch {
          throw new NotFoundException(`Produk dengan ID ${tag.productId} tidak ditemukan`);
        }

        if (!product) {
          throw new NotFoundException(`Produk dengan ID ${tag.productId} tidak ditemukan`);
        }


        if (product.status !== 'active') {
          throw new BadRequestException(
            `Produk "${product.title}" tidak dalam status aktif dan tidak dapat di-tag`,
          );
        }

        if (tag.variantId) {
          const variantExists = product.variants.some((v) => v.id === tag.variantId);
          if (!variantExists) {
            throw new BadRequestException(
              `Varian ID ${tag.variantId} tidak valid untuk produk "${product.title}"`,
            );
          }
        }
      }
    }

    // 2. Create the post in database
    const post = await this.prisma.post.create({
      data: {
        userId,
        caption: dto.caption || '',
        mediaType: dto.mediaType || 'VIDEO',
        mediaUrl: dto.mediaUrl,
        thumbnailUrl: dto.thumbnailUrl,
        playbackMetadata: {
          duration: dto.duration || 0,
          aspect_ratio: '9:16',
          hls_resolutions: ['720p', '1080p'],
        },
        status: 'READY',
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            userRoles: {
              where: { status: 'ACTIVE' },
              select: { roleId: true },
            },
          },
        },
      },
    });

    // 3. Attach product tags with creatorId
    if (dto.productTags && dto.productTags.length > 0) {
      await this.prisma.postProductTag.createMany({
        data: dto.productTags.map((tag) => ({
          postId: post.id,
          productId: tag.productId,
          variantId: tag.variantId || null,
          creatorId: userId,
          coordinateX: tag.coordinateX,
          coordinateY: tag.coordinateY,
          timeStartSec: tag.timeStartSec ?? 0.0,
          timeEndSec: tag.timeEndSec ?? null,
          isActive: true,
        })),
        skipDuplicates: true,
      });
    }

    const createdTags = await this.prisma.postProductTag.findMany({
      where: { postId: post.id },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            basePrice: true,
            status: true,
          },
        },
      },
    });

    return {
      id: post.id,
      caption: post.caption,
      mediaType: post.mediaType,
      mediaUrl: post.mediaUrl,
      thumbnailUrl: post.thumbnailUrl,
      playbackMetadata: post.playbackMetadata,
      status: post.status,
      author: {
        userId: post.user.id,
        username: post.user.username,
        displayName: post.user.displayName,
        avatarUrl: post.user.avatarUrl,
        roles: post.user.userRoles.map((r) => r.roleId),
      },
      productTags: createdTags.map((t) => ({
        tagId: t.id,
        productId: t.productId,
        variantId: t.variantId,
        coordinate: {
          x: Number(t.coordinateX),
          y: Number(t.coordinateY),
        },
        displayTime: {
          start: Number(t.timeStartSec || 0),
          end: t.timeEndSec ? Number(t.timeEndSec) : null,
        },
      })),
    };
  }

  /**
   * Fetch paginated Reels video feed (For You or Following).
   */
  async getFeed(currentUserId: string | undefined, query: QueryFeedDto) {
    const limit = query.limit || 10;
    const feedType = query.feedType || 'for_you';

    let followedUserIds: string[] = [];
    if (currentUserId) {
      const following = await this.prisma.userFollows.findMany({
        where: { followerId: currentUserId },
        select: { followingId: true },
      });
      followedUserIds = following.map((f) => f.followingId);
    }

    // Build where clause
    const where: any = {
      status: 'READY',
    };

    if (feedType === 'following') {
      if (!currentUserId || followedUserIds.length === 0) {
        return {
          data: [],
          nextCursor: null,
          hasMore: false,
        };
      }
      where.userId = { in: followedUserIds };
    }

    // Cursor pagination
    const posts = await this.prisma.post.findMany({
      where,
      take: limit + 1,
      skip: query.cursor ? 1 : 0,
      cursor: query.cursor ? { id: query.cursor } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            userRoles: {
              where: { status: 'ACTIVE' },
              select: { roleId: true },
            },
          },
        },
        productTags: {
          where: {
            isActive: true,
            product: { status: 'active' }, // Handler soft-delete / status check
          },
          include: {
            product: {
              include: {
                shop: {
                  select: {
                    id: true,
                    shopName: true,
                    ownerId: true,
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
        },
      },
    });

    const hasMore = posts.length > limit;
    const resultPosts = hasMore ? posts.slice(0, limit) : posts;
    const nextCursor = hasMore && resultPosts.length > 0 ? resultPosts[resultPosts.length - 1].id : null;

    // Bulk query user context if logged in
    let likedPostIds = new Set<string>();
    if (currentUserId && resultPosts.length > 0) {
      const postIds = resultPosts.map((p) => p.id);
      const likes = await this.prisma.postLike.findMany({
        where: {
          userId: currentUserId,
          postId: { in: postIds },
        },
        select: { postId: true },
      });
      likedPostIds = new Set(likes.map((l) => l.postId));
    }

    const followedSet = new Set(followedUserIds);

    const data = resultPosts.map((post) => {
      const isLiked = likedPostIds.has(post.id);
      const isFollowing = currentUserId ? followedSet.has(post.userId) : false;

      return {
        id: post.id,
        caption: post.caption,
        mediaType: post.mediaType,
        mediaUrl: post.mediaUrl,
        thumbnailUrl: post.thumbnailUrl,
        playbackMetadata: post.playbackMetadata,
        author: {
          userId: post.user.id,
          username: post.user.username,
          displayName: post.user.displayName,
          avatarUrl: post.user.avatarUrl,
          roles: post.user.userRoles.map((r) => r.roleId),
        },
        metrics: {
          likesCount: post.likesCount ?? 0,
          commentsCount: post.commentsCount ?? 0,
          sharesCount: post.sharesCount ?? 0,
        },
        userContext: {
          isLiked,
          isFollowing,
        },
        taggedProducts: post.productTags.map((tag) => ({
          tagId: tag.id,
          coordinate: {
            x: Number(tag.coordinateX),
            y: Number(tag.coordinateY),
          },
          displayTime: {
            start: Number(tag.timeStartSec ?? 0),
            end: tag.timeEndSec ? Number(tag.timeEndSec) : null,
          },
          product: {
            id: tag.product.id,
            name: tag.product.title,
            basePrice: Number(tag.product.basePrice),
            status: tag.product.status,
            storeName: tag.product.shop?.shopName || 'SocMark Store',
            thumbnail: tag.product.images?.[0]?.imageUrl || '',
            variant: tag.variant
              ? {
                  id: tag.variant.id,
                  name: tag.variant.variantName,
                  price: Number(tag.product.basePrice) + Number(tag.variant.priceAdjustment || 0),
                }
              : null,
          },
        })),
      };
    });

    return {
      data,
      nextCursor,
      hasMore,
    };
  }

  /**
   * Quick-View details for bottom sheet when a user taps a product pin.
   * Records TAG_CLICK attribution telemetry.
   */
  async getQuickView(postId: string, productId: string, userId?: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        shop: {
          select: {
            id: true,
            shopName: true,
            ownerId: true,
          },
        },
        variants: {
          where: { isActive: true },
          select: {
            id: true,
            sku: true,
            variantName: true,
            priceAdjustment: true,
            inventoryQuantity: true,
          },
        },
        images: {
          orderBy: { sortOrder: 'asc' },
          take: 3,
          select: { imageUrl: true },
        },
      },
    });

    if (!product || product.status !== 'active') {
      throw new NotFoundException('Produk tidak ditemukan atau saat ini tidak aktif');
    }

    // Record attribution event: TAG_CLICK
    try {
      await this.prisma.feedAttributionEvent.create({
        data: {
          userId: userId || null,
          postId,
          productId,
          eventType: 'TAG_CLICK',
          metadata: {
            timestamp: new Date().toISOString(),
          },
        },
      });
    } catch {
      // Telemetry failure should not break quick view
    }

    const variants =
      product.variants.length > 0
        ? product.variants.map((v) => ({
            id: v.id,
            sku: v.sku,
            name: v.variantName,
            price: Number(product.basePrice) + Number(v.priceAdjustment || 0),
            stock: v.inventoryQuantity,
          }))
        : [
            {
              id: 'default',
              sku: null,
              name: 'Standar',
              price: Number(product.basePrice),
              stock: 99,
            },
          ];

    return {
      product: {
        id: product.id,
        name: product.title,
        basePrice: Number(product.basePrice),
        thumbnail: product.images[0]?.imageUrl || '',
        images: product.images.map((img) => img.imageUrl),
        store: {
          id: product.shop?.id || product.shopId,
          name: product.shop?.shopName || 'SocMark Store',
          originSubdistrictId: 3215,
        },
        variants,
      },
    };
  }

  /**
   * Toggle Like on a Post.
   */
  async toggleLike(userId: string, postId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, likesCount: true },
    });

    if (!post) {
      throw new NotFoundException('Postingan tidak ditemukan');
    }

    const existingLike = await this.prisma.postLike.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (existingLike) {
      await this.prisma.postLike.delete({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      });

      const updated = await this.prisma.post.update({
        where: { id: postId },
        data: {
          likesCount: { decrement: 1 },
        },
        select: { likesCount: true },
      });

      return {
        isLiked: false,
        likesCount: Math.max(0, updated.likesCount ?? 0),
      };
    } else {
      await this.prisma.postLike.create({
        data: {
          userId,
          postId,
        },
      });

      const updated = await this.prisma.post.update({
        where: { id: postId },
        data: {
          likesCount: { increment: 1 },
        },
        select: { likesCount: true },
      });

      return {
        isLiked: true,
        likesCount: updated.likesCount ?? 1,
      };
    }
  }
}

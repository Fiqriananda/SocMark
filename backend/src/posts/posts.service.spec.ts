import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service.js';
import { PostsService } from './posts.service.js';

describe('PostsService', () => {
  let service: PostsService;
  let prisma: {
    product: { findUnique: any };
    post: { create: any; findMany: any; findUnique: any; update: any };
    postProductTag: { createMany: any; findMany: any };
    userFollows: { findMany: any };
    postLike: { findMany: any; findUnique: any; create: any; delete: any };
    feedAttributionEvent: { create: any };
  };

  beforeEach(async () => {
    prisma = {
      product: {
        findUnique: vi.fn(),
      },
      post: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      postProductTag: {
        createMany: vi.fn(),
        findMany: vi.fn(),
      },
      userFollows: {
        findMany: vi.fn(),
      },
      postLike: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        delete: vi.fn(),
      },
      feedAttributionEvent: {
        create: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
  });

  describe('create', () => {
    it('should throw NotFoundException if tagged product does not exist', async () => {
      prisma.product.findUnique.mockResolvedValue(null);

      await expect(
        service.create('user-1', {
          mediaUrl: 'https://video.mp4',
          thumbnailUrl: 'https://thumb.jpg',
          productTags: [
            {
              productId: 'invalid-prod',
              coordinateX: 50,
              coordinateY: 50,
            },
          ],
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if tagged product is not active', async () => {
      prisma.product.findUnique.mockResolvedValue({
        id: 'prod-1',
        title: 'Draft Product',
        status: 'draft',
        variants: [],
      });

      await expect(
        service.create('user-1', {
          mediaUrl: 'https://video.mp4',
          thumbnailUrl: 'https://thumb.jpg',
          productTags: [
            {
              productId: 'prod-1',
              coordinateX: 50,
              coordinateY: 50,
            },
          ],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should successfully create post with product tags and author metadata', async () => {
      prisma.product.findUnique.mockResolvedValue({
        id: 'prod-1',
        title: 'Kemeja Flanel',
        status: 'active',
        variants: [{ id: 'var-1' }],
      });

      prisma.post.create.mockResolvedValue({
        id: 'post-1',
        caption: 'Outfit casual weekend',
        mediaType: 'VIDEO',
        mediaUrl: 'https://video.mp4',
        thumbnailUrl: 'https://thumb.jpg',
        playbackMetadata: { duration: 30 },
        status: 'READY',
        user: {
          id: 'user-1',
          username: 'creator1',
          displayName: 'Creator One',
          avatarUrl: 'https://avatar.png',
          userRoles: [{ roleId: 'CONTENT_CREATOR' }],
        },
      });

      prisma.postProductTag.findMany.mockResolvedValue([
        {
          id: 'tag-1',
          productId: 'prod-1',
          variantId: 'var-1',
          coordinateX: 54.2,
          coordinateY: 65.0,
          timeStartSec: 0,
          timeEndSec: 15,
          product: {
            id: 'prod-1',
            title: 'Kemeja Flanel',
            basePrice: 150000,
            status: 'active',
          },
        },
      ]);

      const result = await service.create('user-1', {
        caption: 'Outfit casual weekend',
        mediaUrl: 'https://video.mp4',
        thumbnailUrl: 'https://thumb.jpg',
        duration: 30,
        productTags: [
          {
            productId: 'prod-1',
            variantId: 'var-1',
            coordinateX: 54.2,
            coordinateY: 65.0,
          },
        ],
      });

      expect(result.id).toBe('post-1');
      expect(result.author.username).toBe('creator1');
      expect(result.productTags.length).toBe(1);
      expect(prisma.postProductTag.createMany).toHaveBeenCalled();
    });
  });

  describe('getFeed', () => {
    it('should return paginated feed items with taggedProducts formatted', async () => {
      prisma.userFollows.findMany.mockResolvedValue([]);
      prisma.post.findMany.mockResolvedValue([
        {
          id: 'post-1',
          userId: 'user-creator',
          caption: 'Great look',
          mediaType: 'VIDEO',
          mediaUrl: 'https://video.m3u8',
          thumbnailUrl: 'https://thumb.jpg',
          playbackMetadata: { duration: 15 },
          likesCount: 10,
          commentsCount: 2,
          sharesCount: 1,
          user: {
            id: 'user-creator',
            username: 'creator',
            displayName: 'Creator',
            avatarUrl: 'https://avatar.jpg',
            userRoles: [{ roleId: 'CONTENT_CREATOR' }],
          },
          productTags: [
            {
              id: 'tag-1',
              coordinateX: 50.0,
              coordinateY: 60.0,
              timeStartSec: 0,
              timeEndSec: 15,
              product: {
                id: 'prod-1',
                title: 'Shirt',
                basePrice: 100000,
                status: 'active',
                shop: { id: 'shop-1', shopName: 'Cool Shop', ownerId: 'user-creator' },
                images: [{ imageUrl: 'https://image.jpg' }],
              },
              variant: null,
            },
          ],
        },
      ]);

      const result = await service.getFeed(undefined, { limit: 10 });
      expect(result.data.length).toBe(1);
      expect(result.data[0].taggedProducts[0].product.name).toBe('Shirt');
      expect(result.data[0].userContext.isLiked).toBe(false);
      expect(result.hasMore).toBe(false);
    });
  });

  describe('getQuickView', () => {
    it('should return product variants and store info and record attribution telemetry', async () => {
      prisma.product.findUnique.mockResolvedValue({
        id: 'prod-1',
        title: 'Kemeja Flanel',
        basePrice: 150000,
        status: 'active',
        shop: { id: 'shop-1', shopName: 'Flannel Store', ownerId: 'owner-1' },
        variants: [
          { id: 'v-1', sku: 'SKU-M', variantName: 'Size M', priceAdjustment: 0, inventoryQuantity: 10 },
        ],
        images: [{ imageUrl: 'https://img.jpg' }],
      });

      const result = await service.getQuickView('post-1', 'prod-1', 'user-viewer');
      expect(result.product.id).toBe('prod-1');
      expect(result.product.variants[0].name).toBe('Size M');
      expect(prisma.feedAttributionEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            eventType: 'TAG_CLICK',
            postId: 'post-1',
            productId: 'prod-1',
          }),
        }),
      );
    });
  });
});

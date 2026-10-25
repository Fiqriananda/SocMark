import { randomUUID } from 'node:crypto';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { isUUID } from 'class-validator';
import slugify from 'slugify';
import { ProductStatus } from '../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { ListProductsDto } from './dto/list-products.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';

const productIncludes = {
  category: true,
  images: { orderBy: { sortOrder: 'asc' as const } },
  variants: true,
  shop: {
    select: {
      id: true,
      shopName: true,
      slug: true,
      description: true,
      logoUrl: true,
      ratingAvg: true,
      reviewCount: true,
    },
  },
};

function serializeProduct<T extends { title: string }>(product: T) {
  return { ...product, name: product.title };
}

function createProductSlug(name: string) {
  return `${slugify(name, { lower: true, strict: true }) || 'product'}-${randomUUID().slice(0, 8)}`;
}

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(ownerId: string, dto: CreateProductDto) {
    const shop = await this.prisma.shop.findUnique({ where: { ownerId } });
    if (!shop) {
      throw new ForbiddenException('Merchant belum memiliki toko');
    }
    if (dto.categoryId !== undefined) {
      await this.ensureCategoryExists(dto.categoryId);
    }

    const product = await this.prisma.product.create({
      data: {
        shopId: shop.id,
        categoryId: dto.categoryId ?? null,
        title: dto.name,
        slug: createProductSlug(dto.name),
        description: dto.description,
        basePrice: dto.basePrice ?? 0,
        status: dto.status ?? ProductStatus.active,
        images: dto.images?.length
          ? { create: dto.images.map((imageUrl) => ({ imageUrl })) }
          : undefined,
      },
      include: productIncludes,
    });

    return serializeProduct(product);
  }

  async findAll(query: ListProductsDto) {
    const where = {
      status: ProductStatus.active,
      ...(query.category ? { categoryId: query.category } : {}),
      ...(query.search?.trim()
        ? {
            OR: [
              { title: { contains: query.search.trim(), mode: 'insensitive' as const } },
              {
                description: {
                  contains: query.search.trim(),
                  mode: 'insensitive' as const,
                },
              },
            ],
          }
        : {}),
    };
    const orderBy =
      query.sort === 'price_asc'
        ? [{ basePrice: 'asc' as const }, { id: 'asc' as const }]
        : query.sort === 'price_desc'
          ? [{ basePrice: 'desc' as const }, { id: 'asc' as const }]
          : [{ createdAt: 'desc' as const }, { id: 'asc' as const }];
    const skip = (query.page - 1) * query.limit;

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: query.limit,
        include: productIncludes,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products.map(serializeProduct),
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  async findOne(idOrSlug: string) {
    const product = await this.findProduct(idOrSlug, true);
    return serializeProduct(product);
  }

  async update(ownerId: string, idOrSlug: string, dto: UpdateProductDto) {
    const product = await this.findProduct(idOrSlug, false);
    await this.ensureOwner(ownerId, product.shopId);

    let categoryIdNumber: number | undefined = undefined;

    if (dto.categoryId !== undefined && dto.categoryId !== null) {
      categoryIdNumber = Number(dto.categoryId);
      await this.ensureCategoryExists(dto.categoryId);
    }

    const updated = await this.prisma.product.update({
      where: { id: product.id },
      data: {
        ...(dto.name !== undefined
          ? {
              title: dto.name,
              slug: createProductSlug(dto.name),
            }
          : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.categoryId !== undefined ? { categoryId: categoryIdNumber } : {}),
        ...(dto.basePrice !== undefined ? { basePrice: dto.basePrice } : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
        ...(dto.images !== undefined
          ? {
              images: {
                deleteMany: {},
                create: dto.images.map((imageUrl) => ({ imageUrl })),
              },
            }
          : {}),
      },
      include: productIncludes,
    });

    return serializeProduct(updated);
  }

  async remove(ownerId: string, idOrSlug: string) {
    const product = await this.findProduct(idOrSlug, false);
    await this.ensureOwner(ownerId, product.shopId);

    const archived = await this.prisma.product.update({
      where: { id: product.id },
      data: { status: ProductStatus.archived },
      include: productIncludes,
    });

    return serializeProduct(archived);
  }

  private async findProduct(idOrSlug: string, activeOnly: boolean) {
    const product = await this.prisma.product.findFirst({
      where: {
        ...(isUUID(idOrSlug)
          ? { OR: [{ id: idOrSlug }, { slug: idOrSlug }] }
          : { slug: idOrSlug }),
        ...(activeOnly ? { status: ProductStatus.active } : {}),
      },
      include: productIncludes,
    });

    if (!product) {
      throw new NotFoundException('Produk tidak ditemukan');
    }
    return product;
  }

  private async ensureOwner(ownerId: string, shopId: string) {
    const shop = await this.prisma.shop.findUnique({ where: { id: shopId } });
    if (!shop || shop.ownerId !== ownerId) {
      throw new ForbiddenException('Anda bukan pemilik produk ini');
    }
  }

  private async ensureCategoryExists(categoryId?: number) {
    if (categoryId === undefined) {
      return;
    }
    const category = await this.prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      throw new NotFoundException('Kategori tidak ditemukan');
    }
  }
}

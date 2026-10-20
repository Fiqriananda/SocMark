import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ProductStatus } from '../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { ListProductsDto } from './dto/list-products.dto.js';
import { ProductsService } from './products.service.js';

describe('ProductsService', () => {
  let service: ProductsService;
  let prisma: PrismaService;
  let shopFindUnique: ReturnType<typeof vi.fn>;
  let categoryFindUnique: ReturnType<typeof vi.fn>;
  let productCreate: ReturnType<typeof vi.fn>;
  let productFindMany: ReturnType<typeof vi.fn>;
  let productCount: ReturnType<typeof vi.fn>;
  let productFindFirst: ReturnType<typeof vi.fn>;
  let productUpdate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    shopFindUnique = vi.fn();
    categoryFindUnique = vi.fn();
    productCreate = vi.fn();
    productFindMany = vi.fn();
    productCount = vi.fn();
    productFindFirst = vi.fn();
    productUpdate = vi.fn();
    prisma = {
      shop: { findUnique: shopFindUnique },
      category: { findUnique: categoryFindUnique },
      product: {
        create: productCreate,
        findMany: productFindMany,
        count: productCount,
        findFirst: productFindFirst,
        update: productUpdate,
      },
    } as unknown as PrismaService;
    service = new ProductsService(prisma);
  });

  it('creates a product for the merchant shop and maps name to title', async () => {
    shopFindUnique.mockResolvedValue({ id: 'shop-1' });
    const product = { id: 'product-1', shopId: 'shop-1', title: 'Kemeja Flanel' };
    productCreate.mockResolvedValue(product);

    const result = await service.create('merchant-1', {
      name: 'Kemeja Flanel',
      description: 'Kemeja bahan katun',
      basePrice: 100000,
      images: ['shirt.jpg'],
    });

    expect(productCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          shopId: 'shop-1',
          categoryId: null,
          title: 'Kemeja Flanel',
          status: ProductStatus.active,
          images: { create: [{ imageUrl: 'shirt.jpg' }] },
        }),
      }),
    );
    expect(categoryFindUnique).not.toHaveBeenCalled();
    expect(result).toMatchObject({ id: 'product-1', name: 'Kemeja Flanel' });
  });

  it('returns active products with filters and pagination metadata', async () => {
    productFindMany.mockResolvedValue([{ title: 'Kemeja Flanel' }]);
    productCount.mockResolvedValue(1);
    const query = Object.assign(new ListProductsDto(), {
      page: 2,
      limit: 5,
      category: 3,
      search: 'flanel',
      sort: 'price_asc' as const,
    });

    const result = await service.findAll(query);

    expect(productFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: ProductStatus.active,
          categoryId: 3,
          OR: [
            { title: { contains: 'flanel', mode: 'insensitive' } },
            { description: { contains: 'flanel', mode: 'insensitive' } },
          ],
        }),
        skip: 5,
        take: 5,
        orderBy: [{ basePrice: 'asc' }, { id: 'asc' }],
      }),
    );
    expect(result).toMatchObject({
      data: [{ title: 'Kemeja Flanel', name: 'Kemeja Flanel' }],
      meta: { page: 2, limit: 5, total: 1, totalPages: 1 },
    });
  });

  it('blocks updates by merchants who do not own the product', async () => {
    productFindFirst.mockResolvedValue({
      id: 'product-1',
      shopId: 'shop-1',
    });
    shopFindUnique.mockResolvedValue({
      id: 'shop-1',
      ownerId: 'another-merchant',
    });

    await expect(
      service.update('merchant-1', 'product-1', { name: 'Changed name' }),
    ).rejects.toThrow(ForbiddenException);
    expect(productUpdate).not.toHaveBeenCalled();
  });

  it('soft deletes products by archiving them', async () => {
    productFindFirst.mockResolvedValue({
      id: 'product-1',
      shopId: 'shop-1',
    });
    shopFindUnique.mockResolvedValue({
      id: 'shop-1',
      ownerId: 'merchant-1',
    });
    productUpdate.mockResolvedValue({
      id: 'product-1',
      title: 'Kemeja Flanel',
      status: ProductStatus.archived,
    });

    await service.remove('merchant-1', 'product-1');

    expect(productUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'product-1' },
        data: { status: ProductStatus.archived },
      }),
    );
  });

  it('returns not found for products outside the public active catalog', async () => {
    productFindFirst.mockResolvedValue(null);

    await expect(service.findOne('missing-product')).rejects.toThrow(NotFoundException);
  });
});

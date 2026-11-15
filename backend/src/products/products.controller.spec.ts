import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RbacGuard } from '../common/guards/rbac.guard.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { ListProductsDto } from './dto/list-products.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { ProductsController } from './products.controller.js';
import { ProductsService } from './products.service.js';

describe('ProductsController', () => {
  let controller: ProductsController;
  let productsService: {
    create: ReturnType<typeof vi.fn>;
    findAll: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    productsService = {
      create: vi.fn(),
      findAll: vi.fn(),
      findOne: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [{ provide: ProductsService, useValue: productsService }],
    })
      .overrideGuard(RbacGuard)
      .useValue({ canActivate: vi.fn(() => true) })
      .compile();

    controller = module.get<ProductsController>(ProductsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('creates a product for the current merchant', async () => {
    const user = { id: 'merchant-1' };
    const dto: CreateProductDto = {
      name: 'Kemeja Flanel',
      description: 'Kemeja bahan katun',
      basePrice: 100000,
    };
    const product = { id: 'product-1', name: dto.name };
    productsService.create.mockResolvedValue(product);

    await expect(controller.create(user, dto)).resolves.toEqual(product);
    expect(productsService.create).toHaveBeenCalledWith(user.id, dto);
  });

  it('lists products using the provided query', async () => {
    const query = Object.assign(new ListProductsDto(), {
      page: 2,
      limit: 10,
      search: 'flanel',
    });
    const result = { data: [], meta: { page: 2, limit: 10, total: 0, totalPages: 0 } };
    productsService.findAll.mockResolvedValue(result);

    await expect(controller.findAll(query)).resolves.toEqual(result);
    expect(productsService.findAll).toHaveBeenCalledWith(query);
  });

  it('gets a product by ID or slug', async () => {
    const product = { id: 'product-1', name: 'Kemeja Flanel' };
    productsService.findOne.mockResolvedValue(product);

    await expect(controller.findOne('product-1')).resolves.toEqual(product);
    expect(productsService.findOne).toHaveBeenCalledWith('product-1');
  });

  it('updates a product for the current merchant', async () => {
    const user = { id: 'merchant-1' };
    const dto: UpdateProductDto = { name: 'Kemeja Baru' };
    const product = { id: 'product-1', name: dto.name };
    productsService.update.mockResolvedValue(product);

    await expect(controller.update(user, 'product-1', dto)).resolves.toEqual(product);
    expect(productsService.update).toHaveBeenCalledWith(user.id, 'product-1', dto);
  });

  it('removes a product for the current merchant', async () => {
    const user = { id: 'merchant-1' };
    const product = { id: 'product-1', status: 'archived' };
    productsService.remove.mockResolvedValue(product);

    await expect(controller.remove(user, 'product-1')).resolves.toEqual(product);
    expect(productsService.remove).toHaveBeenCalledWith(user.id, 'product-1');
  });
});

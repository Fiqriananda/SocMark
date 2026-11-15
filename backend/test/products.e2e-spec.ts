import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from '../src/app.module.js';

describe('ProductsController (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/v1/products (Public)', () => {
    it('should return 200 and list of active products with pagination metadata', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/products')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.meta.page).toBe(1);
      expect(response.body.meta.limit).toBe(12);
    });

    it('should return 400 Bad Request on invalid pagination query', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/products?limit=0&page=0')
        .expect(400);
    });

    it('should return 400 Bad Request on invalid sort query parameter', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/products?sort=unknown')
        .expect(400);
    });
  });

  describe('GET /api/v1/products/:id (Public)', () => {
    it('should return 404 when product is not found', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/products/00000000-0000-0000-0000-000000000000')
        .expect(404);

      expect(response.body.message).toBe('Produk tidak ditemukan');
    });
  });

  describe('POST /api/v1/products (RBAC Protected)', () => {
    it('should return 401 Unauthorized without auth token', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/products')
        .send({ name: 'Test Product', description: 'Test Description' })
        .expect(401);

      expect(response.body.message).toContain('Token autentikasi tidak ditemukan');
    });
  });

  describe('PUT /api/v1/products/:id (RBAC Protected)', () => {
    it('should return 401 Unauthorized without auth token', async () => {
      await request(app.getHttpServer())
        .put('/api/v1/products/00000000-0000-0000-0000-000000000000')
        .send({ name: 'Updated Product' })
        .expect(401);
    });
  });

  describe('DELETE /api/v1/products/:id (RBAC Protected)', () => {
    it('should return 401 Unauthorized without auth token', async () => {
      await request(app.getHttpServer())
        .delete('/api/v1/products/00000000-0000-0000-0000-000000000000')
        .expect(401);
    });
  });
});

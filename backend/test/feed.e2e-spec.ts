import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from '../src/app.module.js';

describe('Shoppable Feed & Posts (e2e)', () => {
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

  describe('GET /api/v1/feed (Public)', () => {
    it('should return 200 with feed array and pagination metadata', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/feed?limit=5')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('hasMore');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return 400 Bad Request on invalid limit parameter', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/feed?limit=100')
        .expect(400);
    });
  });

  describe('POST /api/v1/posts (Role Protected: CONTENT_CREATOR / MERCHANT)', () => {
    it('should return 401 Unauthorized when request lacks authorization token', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/posts')
        .send({
          mediaUrl: 'https://storage.socmark.id/videos/sample.m3u8',
          thumbnailUrl: 'https://storage.socmark.id/videos/sample.jpg',
        })
        .expect(401);
    });
  });

  describe('POST /api/v1/cart/items (Protected)', () => {
    it('should return 401 Unauthorized when unauthenticated buyer attempts to add cart item', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/cart/items')
        .send({
          productId: '00000000-0000-0000-0000-000000000000',
          quantity: 1,
        })
        .expect(401);
    });
  });

  describe('GET /api/v1/posts/:postId/products/:productId/quick-view (Public)', () => {
    it('should return 404 for unknown product id', async () => {
      await request(app.getHttpServer())
        .get(
          '/api/v1/posts/00000000-0000-0000-0000-000000000000/products/00000000-0000-0000-0000-000000000000/quick-view',
        )
        .expect(404);
    });
  });
});

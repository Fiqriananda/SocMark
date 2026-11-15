import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from '../src/app.module.js';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

describe('Swagger Documentation (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    const config = new DocumentBuilder()
      .setTitle('SocMark API')
      .setDescription('The SocMark REST API documentation and interactive playground')
      .setVersion('1.0')
      .addTag('Authentication')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    await app.init();
  });

  it('/api-json (GET) should return OpenAPI spec with registered routes', async () => {
    const response = await request(app.getHttpServer())
      .get('/api-json')
      .expect(200);

    expect(response.body.openapi).toBeDefined();
    expect(response.body.info.title).toBe('SocMark API');
    expect(response.body.paths['/auth/login']).toBeDefined();
    expect(response.body.paths['/auth/register']).toBeDefined();
    expect(response.body.paths['/auth/forgot-password']).toBeDefined();
    expect(response.body.paths['/auth/reset-password']).toBeDefined();
  });

  it('/api/ (GET) should return Swagger UI HTML', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/')
      .expect(200);

    expect(response.text).toContain('swagger-ui');
  });

  afterEach(async () => {
    await app.close();
  });
});

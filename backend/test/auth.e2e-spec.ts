import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import bcrypt from 'bcrypt';
import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

describe('AuthController (e2e) with Supertest', () => {
  let app: INestApplication<App>;

  const mockPrismaService = {
    user: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    $connect: vi.fn(),
    $disconnect: vi.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile();

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

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully and return 201', async () => {
      const registerDto = {
        username: 'testuser',
        displayName: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      // Mock user not existing
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      // Mock created user
      mockPrismaService.user.create.mockResolvedValue({
        id: 'user-uuid-1',
        username: registerDto.username,
        email: registerDto.email,
        displayName: registerDto.displayName,
        role: 'user',
        createdAt: new Date(),
      });

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Registrasi berhasil');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(registerDto.email);
      expect(mockPrismaService.user.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [{ email: registerDto.email }, { username: registerDto.username }],
        },
      });
      expect(mockPrismaService.user.create).toHaveBeenCalled();
    });

    it('should return 409 Conflict if email or username already exists', async () => {
      const registerDto = {
        username: 'existinguser',
        displayName: 'Existing User',
        email: 'existing@example.com',
        password: 'password123',
      };

      // Mock existing user found
      mockPrismaService.user.findFirst.mockResolvedValue({
        id: 'existing-id',
        email: registerDto.email,
        username: registerDto.username,
      });

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(409);

      expect(response.body.message).toContain('Username atau Email sudah terdaftar');
      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
    });

    it('should return 400 Bad Request on invalid input (validation check)', async () => {
      const invalidDto = {
        username: 'ab', // Min length 3
        displayName: 'T', // Min length 3
        email: 'invalid-email', // Not a valid email
        password: 'short', // Min length 8
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(invalidDto)
        .expect(400);

      expect(response.body.message).toBeInstanceOf(Array);
    });
  });

  describe('POST /auth/login', () => {
    it('should return 200 and an accessToken on valid credentials', async () => {
      const password = 'password123';
      const hashedPassword = await bcrypt.hash(password, 10);

      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        username: 'testuser',
        passwordHash: hashedPassword,
        status: 'active',
        role: 'user',
      });

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: password,
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(typeof response.body.accessToken).toBe('string');
    });

    it('should return 401 Unauthorized if user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'notfound@example.com',
          password: 'password123',
        })
        .expect(401);

      expect(response.body.message).toBe('User tidak ditemukan');
    });

    it('should return 401 Unauthorized if password is incorrect', async () => {
      const correctHashedPassword = await bcrypt.hash('correctPassword', 10);

      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        username: 'testuser',
        passwordHash: correctHashedPassword,
        status: 'active',
        role: 'user',
      });

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongPassword123',
        })
        .expect(401);

      expect(response.body.message).toBe('Password salah');
    });

    it('should return 401 Unauthorized if account is not active', async () => {
      const password = 'password123';
      const hashedPassword = await bcrypt.hash(password, 10);

      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        username: 'testuser',
        passwordHash: hashedPassword,
        status: 'suspended',
        role: 'user',
      });

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: password,
        })
        .expect(401);

      expect(response.body.message).toBe('Akun tidak aktif');
    });
  });
});

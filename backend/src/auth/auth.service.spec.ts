import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service.js';

import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service.js';
import { MailerService } from '@nestjs-modules/mailer';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: vi.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            user: {
              findFirst: vi.fn(),
              findUnique: vi.fn(),
              create: vi.fn(),
            },
          },
        },
        {
          provide: MailerService,
          useValue: {
            sendMail: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

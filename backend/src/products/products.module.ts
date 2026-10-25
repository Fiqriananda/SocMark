import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt'; // <-- Impor JwtModule langsung di sini
import { RbacModule } from '../rbac/rbac.module.js';
import { PrismaModule } from '../prisma/prisma.module.js'; // <-- Jalur sesuaikan dengan folder prisma Anda
import { ProductsController } from './products.controller.js';
import { ProductsService } from './products.service.js';

@Module({
  imports: [
    RbacModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretKey',
      signOptions: { expiresIn: '1d' },
    }),
    PrismaModule, 
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}


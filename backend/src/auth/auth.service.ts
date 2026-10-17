import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service.js';
import { RegisterDTO } from './dto/register.dto.js';
import bcrypt from 'bcrypt';
import { loginDTO } from './dto/login.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async register(register:RegisterDTO) {
    const existingUser = await this.prisma.user.findFirst({
        where:{
            OR: [
                {
                    email: register.email
                },
                {
                    username: register.username
                }
            ]
        }
    })
    if(existingUser) {
        throw new ConflictException('Username atau Email sudah terdaftar');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(register.password, salt);
    const newUser = await this.prisma.user.create({
        data: {
            email: register.email,
            username: register.username,
            displayName: register.displayName,
            passwordHash: hashedPassword
        },
        select: {
            id: true,
            username: true,
            email: true,
            displayName: true,
            role: true,
            createdAt: true,
        }
    })
    return { 
      message: 'Registrasi berhasil', 
      user: newUser 
    };
  }

  async login(login:loginDTO){
    const user = await this.prisma.user.findUnique({
      where: { email: login.email },
    });

    if (!user) throw new UnauthorizedException('User tidak ditemukan');

    const isPasswordValid = await bcrypt.compare(login.password, user.passwordHash);
    if (!isPasswordValid) throw new UnauthorizedException('Password salah');

    if (user.status !== 'active') {
      throw new UnauthorizedException('Akun tidak aktif');
    }

    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };

    return {
      accessToken: this.jwtService.sign(payload),
    };  
  }
}

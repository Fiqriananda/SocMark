import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service.js';
import { RegisterDTO } from './dto/register.dto.js';
import bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { loginDTO } from './dto/login.dto.js';
import { forgotPasswordDTO } from './dto/forgotPassword.dto.js';
import { MailerService } from "@nestjs-modules/mailer"
import { resetPasswordDTO } from './dto/resetPassword.dto.js';
import { getResetPasswordTemplate } from './templates/reset-password.template.js';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
    private mailService: MailerService
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

  async forgotPassword(forgot: forgotPasswordDTO){
    const user = await this.prisma.user.findUnique({
        where: {email: forgot.email}
    });
    
    if(!user){
      throw new UnauthorizedException('User tidak ditemukan');
    }
    
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 1);

    await this.prisma.user.update({
        where: {id: user.id},
        data: {
            resetToken: resetToken,
            resetTokenExpires: tokenExpiry
        }
    });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    await this.mailService.sendMail({
        to: user.email,
        subject: 'Permintaan Reset Kata Sandi - SocMark',
        text: `Halo ${user.displayName || user.username},\n\nAnda meminta reset password. Klik link berikut untuk membuat password baru: ${resetUrl}\n\nLink ini akan kedaluwarsa dalam 1 jam.`,
        html: getResetPasswordTemplate({
          email: user.email,
          name: user.displayName,
          resetUrl: resetUrl
        }),
    });

    
    return { message: 'Jika email terdaftar, instruksi reset akan dikirimkan.' };
  }

  async resetPassword(reset: resetPasswordDTO) {
    const user = await this.prisma.user.findFirst({
        where: {
            resetToken: reset.token
        }
    })

    if(!user) {
        throw new UnauthorizedException('Token tidak valid')
    }

    const salt = await bcrypt.genSalt();
    const hashedNewPassword = await bcrypt.hash(reset.newPassword, salt);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashedNewPassword,
        resetToken: null,
        resetTokenExpires: null,
      },
    });

    return { message: 'Password berhasil diubah. Silakan login kembali.' };
  }
}

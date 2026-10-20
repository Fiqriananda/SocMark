import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service.js';
import { loginDTO } from './dto/login.dto.js';
import { RegisterDTO } from './dto/register.dto.js';
import { forgotPasswordDTO } from './dto/forgotPassword.dto.js';
import { resetPasswordDTO } from './dto/resetPassword.dto.js';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService){}

    @HttpCode(HttpStatus.OK)
    @Post('login')
    @ApiOperation({
        summary: 'Log in user',
        description: 'Authenticates a user with email and password and returns a JWT access token.',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Successfully authenticated.',
        schema: {
            example: {
                accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Invalid credentials or inactive account.',
    })
    signIn(@Body() login:loginDTO){
        return this.authService.login(login)
    }

    @HttpCode(HttpStatus.CREATED)
    @Post('register')
    @ApiOperation({
        summary: 'Register a new user',
        description: 'Registers a new user account with username, email, display name, and password.',
    })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'User registered successfully.',
        schema: {
            example: {
                message: 'Registrasi berhasil',
                user: {
                    id: 'clx0123456789',
                    username: 'johndoe',
                    email: 'johndoe@example.com',
                    displayName: 'John Doe',
                    role: 'USER',
                    createdAt: '2026-10-20T00:00:00.000Z',
                },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.CONFLICT,
        description: 'Username or email already registered.',
    })
    signUp(@Body() register:RegisterDTO){
        return this.authService.register(register)
    }

    @HttpCode(HttpStatus.OK)
    @Post('forgot-password')
    @ApiOperation({
        summary: 'Request password reset',
        description: 'Generates a password reset token and sends an email with the reset link.',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Reset email instructions dispatched.',
        schema: {
            example: {
                message: 'Jika email terdaftar, instruksi reset akan dikirimkan.',
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'User not found with this email.',
    })
    forgotPassword(@Body() forgot:forgotPasswordDTO){
        return this.authService.forgotPassword(forgot);
    }

    @HttpCode(HttpStatus.OK)
    @Post('reset-password')
    @ApiOperation({
        summary: 'Reset password with token',
        description: 'Sets a new password using a valid reset token.',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Password reset successfully.',
        schema: {
            example: {
                message: 'Password berhasil diubah. Silakan login kembali.',
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Invalid or expired token.',
    })
    resetPasswrod(@Body() reset:resetPasswordDTO){
        return this.authService.resetPassword(reset);
    }
}


import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { loginDTO } from './dto/login.dto.js';
import { RegisterDTO } from './dto/register.dto.js';
import { forgotPasswordDTO } from './dto/forgotPassword.dto.js';
import { resetPasswordDTO } from './dto/resetPassword.dto.js';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService){}

    @HttpCode(HttpStatus.OK)
    @Post('login')
    signIn(@Body() login:loginDTO){
        return this.authService.login(login)
    }

    @HttpCode(HttpStatus.CREATED)
    @Post('register')
    signUp(@Body() register:RegisterDTO){
        return this.authService.register(register)
    }

    @HttpCode(HttpStatus.OK)
    @Post('forgot-password')
    forgotPassword(@Body() forgot:forgotPasswordDTO){
        return this.authService.forgotPassword(forgot);
    }
    @HttpCode(HttpStatus.OK)
    @Post('reset-password')
    resetPasswrod(@Body() reset:resetPasswordDTO){
        return this.authService.resetPassword(reset);
    }

}

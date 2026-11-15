import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from "class-validator";

export class loginDTO {
    @ApiProperty({
        example: 'user@example.com',
        description: 'Email address of the user',
    })
    @IsEmail()
    email: string;
    
    @ApiProperty({
        example: 'Password123!',
        description: 'Password (min 8, max 20 characters)',
    })
    @IsString()
    @MinLength(8, { message: "Password Minimum 8 Character" })
    @MaxLength(20, { message: "Password Max 20 Character" })
    password: string;
}
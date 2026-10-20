import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class RegisterDTO {
    @ApiProperty({
        example: 'johndoe',
        description: 'Unique username (minimum 3 characters)',
    })
    @IsString()
    @MinLength(3, { message: "Minimum 3 character" })
    username: string;

    @ApiProperty({
        example: 'John Doe',
        description: 'User display name (minimum 3 characters)',
    })
    @IsString()
    @MinLength(3, { message: "Minimum 3 character" })
    displayName: string;

    @ApiProperty({
        example: 'johndoe@example.com',
        description: 'Valid email address',
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
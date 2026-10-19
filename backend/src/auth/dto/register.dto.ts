import {IsEmail, IsString, MinLength, MaxLength} from 'class-validator';

export class RegisterDTO {
    @IsString()
    @MinLength(3, {message: "Minimum 3 character"})
    username: string;

    @IsString()
    @MinLength(3, {message: "Minimum 3 character"})
    displayName: string;

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(8, {message:"Password Minimum 8 Character"})
    @MaxLength(20, {message:"Password Max 20 Character"})
    password: string
}
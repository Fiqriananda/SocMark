import { IsEmail, IsString, MaxLength, MinLength } from "class-validator";

export class loginDTO{
    @IsEmail()
    email: string;
    
    @IsString()
    @MinLength(8, {message:"Password Minimum 8 Character"})
    @MaxLength(20, {message:"Password Max 20 Character"})
    password: string
}
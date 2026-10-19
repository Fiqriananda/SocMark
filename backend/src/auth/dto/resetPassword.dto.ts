import { IsString, MaxLength, MinLength } from "class-validator";

export class resetPasswordDTO {
    @IsString()
    token: string;

    @IsString()
    @MinLength(8, {message: "Password Minimum 8 Character"})
    @MaxLength(20, {message: "Password Maximum 20 Character"})
    newPassword: string;
}
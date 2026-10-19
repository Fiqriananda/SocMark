import { IsEmail } from "class-validator";

export class forgotPasswordDTO {
    @IsEmail()
    email: string
}
import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from "class-validator";

export class resetPasswordDTO {
    @ApiProperty({
        example: '4a6b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b',
        description: 'Password reset token received in email',
    })
    @IsString()
    token: string;

    @ApiProperty({
        example: 'NewSecret123!',
        description: 'New password (min 8, max 20 characters)',
    })
    @IsString()
    @MinLength(8, { message: "Password Minimum 8 Character" })
    @MaxLength(20, { message: "Password Maximum 20 Character" })
    newPassword: string;
}
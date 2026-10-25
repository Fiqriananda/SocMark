import { IsArray, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class CreatorOnboardingDTO {
  @IsArray()
  @IsNotEmpty()
  contentNiche: string[];

  @IsObject()
  @IsOptional()
  socialLinks?: Record<string, any>;

  @IsString()
  @IsOptional()
  portfolioUrl?: string;
}

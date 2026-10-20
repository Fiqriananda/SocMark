import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class ListProductsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 12;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  category?: number;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  search?: string;

  @IsOptional()
  @IsIn(['price_asc', 'price_desc', 'latest'])
  sort: 'price_asc' | 'price_desc' | 'latest' = 'latest';
}

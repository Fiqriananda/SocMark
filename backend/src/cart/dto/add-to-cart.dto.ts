import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class AddToCartDto {
  @ApiProperty({
    example: '7b39a3f2-8924-4d87-b9fa-9467d532a890',
    description: 'Product UUID to add to cart',
  })
  @IsString()
  productId: string;


  @ApiPropertyOptional({
    example: 'sku-1',
    description: 'Product variant UUID or SKU',
  })
  @IsOptional()
  @IsString()
  variantId?: string;

  @ApiPropertyOptional({
    example: 1,
    default: 1,
    description: 'Quantity of items to add',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity?: number = 1;

  @ApiPropertyOptional({
    example: 'post-uuid-991',
    description: 'Source video post UUID for creator sales attribution',
  })
  @IsOptional()
  @IsString()
  sourcePostId?: string;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateProductTagDto {
  @ApiProperty({
    example: '7b39a3f2-8924-4d87-b9fa-9467d532a890',
    description: 'ID of the product being tagged',
  })
  @IsUUID()
  productId: string;

  @ApiPropertyOptional({
    example: 'sku-112233',
    description: 'Optional SKU/Variant ID of the product',
  })
  @IsOptional()
  @IsString()
  variantId?: string;

  @ApiProperty({
    example: 54.2,
    description: 'Horizontal percentage coordinate on the video player (0.00 - 100.00)',
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  coordinateX: number;

  @ApiProperty({
    example: 65.0,
    description: 'Vertical percentage coordinate on the video player (0.00 - 100.00)',
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  coordinateY: number;

  @ApiPropertyOptional({
    example: 0.0,
    description: 'Timestamp in seconds when the hotspot pin appears',
    default: 0.0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  timeStartSec?: number;

  @ApiPropertyOptional({
    example: 15.0,
    description: 'Timestamp in seconds when the hotspot pin disappears (null = full duration)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  timeEndSec?: number;
}

export class CreatePostDto {
  @ApiPropertyOptional({
    example: 'Outfit casual weekend! Kemeja flanel katun super adem #ootd #socmark',
    description: 'Caption text for the video post',
  })
  @IsOptional()
  @IsString()
  caption?: string;

  @ApiPropertyOptional({
    example: 'VIDEO',
    description: 'Type of media: VIDEO or CAROUSEL_IMAGE',
    default: 'VIDEO',
  })
  @IsOptional()
  @IsString()
  mediaType?: string;

  @ApiProperty({
    example: 'https://storage.socmark.id/videos/v-98432/master.m3u8',
    description: 'URL of the master video / HLS playlist file',
  })
  @IsString()
  mediaUrl: string;

  @ApiProperty({
    example: 'https://storage.socmark.id/videos/v-98432/thumb.jpg',
    description: 'Cover thumbnail image URL',
  })
  @IsString()
  thumbnailUrl: string;

  @ApiPropertyOptional({
    example: 34.5,
    description: 'Video duration in seconds',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  duration?: number;

  @ApiPropertyOptional({
    type: [CreateProductTagDto],
    description: 'Interactive shoppable product pins attached to the post',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductTagDto)
  productTags?: CreateProductTagDto[];
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class QueryFeedDto {
  @ApiPropertyOptional({
    enum: ['for_you', 'following'],
    default: 'for_you',
    description: 'Feed view mode: for_you (algorithm) or following (chronological from followed creators)',
  })
  @IsOptional()
  @IsIn(['for_you', 'following'])
  feedType?: 'for_you' | 'following' = 'for_you';

  @ApiPropertyOptional({
    description: 'Post ID of the last item from previous page for continuous cursor pagination',
    example: 'post-uuid-990',
  })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({
    description: 'Number of posts to fetch (default: 10, max: 50)',
    default: 10,
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;
}

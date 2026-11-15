import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/active-role.decorator.js';
import { OptionalAuthGuard } from '../common/guards/optional-auth.guard.js';
import { QueryFeedDto } from './dto/query-feed.dto.js';
import { PostsService } from './posts.service.js';

interface AuthenticatedUser {
  id: string;
  username: string;
  roles?: string[];
}

@ApiTags('Shoppable Content & Posts')
@Controller('api/v1/feed')
export class FeedController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({
    summary: 'Get paginated shoppable reels video feed',
    description:
      'Returns a paginated list of video posts with interactive product pins and creator attribution. Supports For You (discovery) and Following feeds.',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns feed list with pagination cursor and hasMore indicator.',
  })
  getFeed(
    @Query() query: QueryFeedDto,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.postsService.getFeed(user?.id, query);
  }
}

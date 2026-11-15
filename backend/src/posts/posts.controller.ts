import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/active-role.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { OptionalAuthGuard } from '../common/guards/optional-auth.guard.js';
import { RbacGuard } from '../common/guards/rbac.guard.js';
import { CreatePostDto } from './dto/create-post.dto.js';
import { PostsService } from './posts.service.js';

interface AuthenticatedUser {
  id: string;
  username: string;
  roles?: string[];
}

@ApiTags('Shoppable Content & Posts')
@Controller('api/v1/posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RbacGuard)
  @Roles('CONTENT_CREATOR', 'MERCHANT')
  @ApiBearerAuth('JWT-auth')
  @ApiHeader({
    name: 'X-Active-Role',
    description: 'Active role required (CONTENT_CREATOR or MERCHANT)',
    required: false,
    example: 'CONTENT_CREATOR',
  })
  @ApiOperation({
    summary: 'Publish a new shoppable video post with product pins',
    description:
      'Creates a new video post with optional interactive product hotspot pins. Only accessible by users with CONTENT_CREATOR or MERCHANT roles.',
  })
  @ApiResponse({
    status: 201,
    description: 'Post and product pins successfully published.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or tagged product is not active.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden: Insufficient role permissions.',
  })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreatePostDto,
  ) {
    return this.postsService.create(user.id, dto);
  }

  @Get(':postId/products/:productId/quick-view')
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({
    summary: 'Get product quick-view details from a video tag pin',
    description:
      'Provides SKU variants, real-time stock, and store details for zero-click bottom-sheet purchase. Records TAG_CLICK attribution telemetry.',
  })
  @ApiParam({ name: 'postId', description: 'UUID of the source post' })
  @ApiParam({ name: 'productId', description: 'UUID of the tagged product' })
  @ApiResponse({
    status: 200,
    description: 'Returns product details, variants, and store info.',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found or currently inactive.',
  })
  getQuickView(
    @Param('postId') postId: string,
    @Param('productId') productId: string,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.postsService.getQuickView(postId, productId, user?.id);
  }

  @Post(':id/like')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RbacGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Toggle like on a post',
    description: 'Likes or unlikes a post for the authenticated user and updates like count.',
  })
  @ApiParam({ name: 'id', description: 'UUID of the post' })
  @ApiResponse({
    status: 200,
    description: 'Like status toggled successfully.',
  })
  toggleLike(
    @Param('id') postId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.postsService.toggleLike(user.id, postId);
  }
}

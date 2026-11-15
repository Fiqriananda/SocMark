import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/active-role.decorator.js';
import { RbacGuard } from '../common/guards/rbac.guard.js';
import { CartService } from './cart.service.js';
import { AddToCartDto } from './dto/add-to-cart.dto.js';

interface AuthenticatedUser {
  id: string;
  username: string;
  roles?: string[];
}

@ApiTags('Multi-Merchant Shopping Cart')
@Controller('api/v1/cart/items')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RbacGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Add item to cart directly from video post (Zero-Click Cart)',
    description:
      'Adds product SKU to user shopping cart and tracks sourcePostId for creator sales attribution.',
  })
  @ApiResponse({
    status: 201,
    description: 'Item added to cart with updated badge counter.',
  })
  @ApiResponse({
    status: 400,
    description: 'Product is inactive or variant is invalid.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized: User authentication required.',
  })
  addItem(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: AddToCartDto,
  ) {
    return this.cartService.addItem(user.id, dto);
  }

  @Get()
  @UseGuards(RbacGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get current user cart items',
    description: 'Returns all shopping cart items and current item counter.',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns list of cart items.',
  })
  getCart(@CurrentUser() user: AuthenticatedUser) {
    return this.cartService.getCart(user.id);
  }
}

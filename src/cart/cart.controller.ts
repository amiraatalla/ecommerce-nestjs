import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/role.decorator';
import { JwtAuthGuard, RoleGuard } from 'src/auth/guards';
import { RequestWithUser } from 'src/auth/interfaces/user-request.interface';
import { Pagination } from 'src/core/shared';
import { CreateReleaseTransactionsDto } from 'src/release-transactions/dto/create-release-transactions.dto';
import { RoleGroups, RolesEnum } from 'src/users/enums/roles.enum';
import { CreateCartDto } from './dto/create-cart.dto';
import { CartSearchOptions } from './dto/cart-search-options.dto';
import { toObjectId } from 'src/core/utils';
import { CartService } from './cart.service';
import { UpdateCartDto } from './dto/update-cart.dto';
import { UpdateQtyDto } from './dto/update-qty.dto';
import { AddItemDto } from './dto/add-item.dto';

@Controller('Cart')
@ApiTags('Cart')
export class CartController {
  constructor(private readonly CartService: CartService) {}


  @Get('me/find-my-cart')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(RolesEnum.CUSTOMER)
  @ApiOperation({ summary: 'Get my Cart' })
  async getMyCart(@Req() req: RequestWithUser) {
    return await this.CartService.findMyCart(req);
  }

  @Get('me/findOne/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS_CASHIER_CUSTOMER)
  @ApiOperation({ summary: 'Get Cart' })
  async getCart(@Param('id') id: string, @Req() req: RequestWithUser) {
    return await this.CartService.findCart(req, id);
  }


  @Patch('/me/add-item-to-cart')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(RolesEnum.CUSTOMER)
  @ApiBody({ type: AddItemDto })
  @ApiOperation({ summary: 'Add Item To Cart' })
  async addItemToCart(@Req() req: RequestWithUser, @Body() dto: AddItemDto) {
    return await this.CartService.addItemsToCart(req,dto);
  }

  @Patch('/me/delete-item-from-cart')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(RolesEnum.CUSTOMER)
  @ApiBody({ type: UpdateQtyDto })
  @ApiOperation({ summary: 'Delete Item From Cart' })
  async deleteItemToCart(@Req() req: RequestWithUser,@Body() dto : UpdateQtyDto) {
    return await this.CartService.deleteItemFromCart(req, dto);
  }

  @Patch('/me/increase-item-qty')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(RolesEnum.CUSTOMER)
  @ApiBody({ type: UpdateQtyDto })
  @ApiOperation({ summary: 'Increase Item Qty In Cart' })
  async increaseOrDecraceItemQty(@Req() req: RequestWithUser,@Body() dto: UpdateQtyDto) {
    return await this.CartService.increaseItemQty(req, dto);
  }

  @Patch('/me/decrease-item-qty')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(RolesEnum.CUSTOMER)
  @ApiBody({ type: UpdateQtyDto })
  @ApiOperation({ summary: 'Decrease Item Qty In Cart' })
  async decreaseOrDecraceItemQty(@Req() req: RequestWithUser,@Body() dto: UpdateQtyDto) {
    return await this.CartService.decreaseItemQty(req, dto);
  }

  @Post('me/search')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS_CASHIER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'find all Carts - BO' })
  async search(
    @Body() options: CartSearchOptions,
    @Req() req: RequestWithUser,
  ): Promise<Pagination> {
    return await this.CartService.findAll(req.user.entityId,options,req);
  }


}

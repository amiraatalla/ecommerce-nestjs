import {
  Body,
  Controller,
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
import { CreateOrderDto } from './dto/create-order.dto';
import { ActiveOnHoldOrderDto } from './dto/active-onhold-order.dto';
import { OrderSearchOptions } from './dto/order-search-options.dto';
import { RefundedOrderDto } from './dto/refunded-order.dto';
import { ReturnedOrderDto } from './dto/returned-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { VoidedOrderDto } from './dto/void-order.dto';
import { OrderService } from './order.service';
import { toObjectId } from 'src/core/utils';
import { CheckPinDto } from './dto/check-pin.dto';

@Controller('order')
@ApiTags('order')
export class OrderController {
  constructor(private readonly OrderService: OrderService) {}

  @Post('/me/create')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS_CASHIER_CUSTOMER)
  @ApiBody({ type: CreateOrderDto })
  @ApiOperation({ summary: 'Create Order' })
  async create(
    @Body() dto: CreateOrderDto,
    @Req() req: RequestWithUser,
  ) {
    return await this.OrderService.createOrder(
      req,
      dto,
    );
  }

  @Get('me/findOne/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS_CASHIER_CUSTOMER)
  @ApiOperation({ summary: 'Get Order' })
  async getOrder(@Param('id') id: string, @Req() req: RequestWithUser) {
    return await this.OrderService.findOrder(req, id);
  }

  @Patch('/me/active-order/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS_CASHIER_CUSTOMER)
  @ApiBody({ type: ActiveOnHoldOrderDto })
  @ApiOperation({ summary: 'convert onhold order to active' })
  async activeOnholdOrder(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body()dto: ActiveOnHoldOrderDto
  ) {
    return await this.OrderService.activeOnholdOrder(req, id ,dto);
  }


  @Patch('/me/void-order/:id')  // order cancelled before paid
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS_CASHIER_CUSTOMER)
  @ApiOperation({ summary: 'void order' })
  async voidOrder(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
  ) {
    return await this.OrderService.cancelOnHoldOrder(req, id);
  }


  @Patch('/me/returned-order/:id')  // cancelled part or full order and take another items
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS_CASHIER)
  @ApiBody({ type: ReturnedOrderDto })
  @ApiOperation({ summary: 'returned order' })
  async returnedOrder(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: ReturnedOrderDto,
  ) {
    return await this.OrderService.returnOrder(req, id, dto);
  }

  @Patch('/me/refunded-order/:id') // cancelled part or full order and take money
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS_CASHIER)
  @ApiBody({ type: RefundedOrderDto })
  @ApiOperation({ summary: 'refunded order' })
  async refundedOrder(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: RefundedOrderDto,
  ) {
    return await this.OrderService.refundOrder(req, id, dto);
  }
 

 

  @Post('me/search')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS_CASHIER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'find all Orders' })
  async search(
    @Req() req: RequestWithUser,
    @Body() options: OrderSearchOptions,
  ): Promise<Pagination> {
    return await this.OrderService.findAll(req.user.entityId,options);
  }


  @Post('customer/search/:customerId')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(RolesEnum.CUSTOMER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'find all Orders for a customer - customer' })
  async searchByCustomer(
    @Param('customerId') customerId: string,
    @Req() req: RequestWithUser,
    @Body() options: OrderSearchOptions,
  ): Promise<Pagination> {
    return await this.OrderService.findAllByCustomer(this.OrderService.toObjectId(customerId),options);
  }

  @Post('me/check-pin')
  @ApiOperation({ summary: 'check pin - cashier' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(RolesEnum.CASHIER)
  async checkPin(@Req() req: RequestWithUser, @Body()dto: CheckPinDto) {
    return await this.OrderService.checkPin(req, dto);
  }


  @Get('me/find-one/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS_CASHIER_CUSTOMER)
  @ApiOperation({ summary: 'Get Order' })
  async findData(@Param('id') id: string, @Req() req: RequestWithUser) {
    return await this.OrderService.findData(req, id);
  }
}
 
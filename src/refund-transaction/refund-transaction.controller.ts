import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/role.decorator';
import { JwtAuthGuard, RoleGuard } from 'src/auth/guards';
import { RequestWithUser } from 'src/core/interfaces';
import { SearchOptions, Pagination } from 'src/core/shared';
import { RoleGroups } from 'src/users/enums/roles.enum';
import { CreateRefundTransactionDto } from './dto/create-refund-transaction.dto';
import { RefundTransactionService } from './refund-transaction.service';

@Controller('refund-transaction')
@ApiTags('refund-transaction')
export class RefundTransactionController {
  constructor(private readonly refundTransactionsService: RefundTransactionService) {}

  @Post('me/create')
  @ApiOperation({ summary: 'Create a refund transactions' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  create(@Req() req: RequestWithUser, @Body() dto: CreateRefundTransactionDto) {
    return this.refundTransactionsService.createRefundTransactions(req, dto);
  }

  @Post('me/search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Search refund transactions' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  findAll(@Req() req: RequestWithUser, @Body() options: SearchOptions): Promise<Pagination> {
    return this.refundTransactionsService.findAll(options, req.user.entityId);
  }
  @Post('me/search/:warehouseId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Search refund transaction in a warehouse' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  findAllForMe(
    @Req() req: RequestWithUser,
    @Body() options: SearchOptions,
    @Param('warehouseId') warehouseId: string,
  ): Promise<Pagination> {
    return this.refundTransactionsService.findAll(
      options,
      req.user.entityId,
      this.refundTransactionsService.toObjectId(warehouseId),
    );
  }
  @Get('me/findone/:warehouseId/:id')
  @ApiOperation({ summary: 'Find refund transaction by id' })
  @UseGuards(JwtAuthGuard)
  async me(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Param('warehouseId') warehouseId: string,
  ) {
    return await this.refundTransactionsService.findOneAndErr({
      _id: this.refundTransactionsService.toObjectId(id),
      entityId: req.user.entityId,
      warehouseId: this.refundTransactionsService.toObjectId(warehouseId),
    });
  }
}

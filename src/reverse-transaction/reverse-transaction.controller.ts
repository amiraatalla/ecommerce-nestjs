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
import { CreateReverseTransactionsDto } from './dto/create-reverse-transaction.dto';
import { ReverseTransactionService } from './reverse-transaction.service';

@Controller('reverse-transaction')
@ApiTags('reverse-transactions')
export class ReverseTransactionController {
  constructor(private readonly reverseTransactionsService: ReverseTransactionService) {}
  @Post('me/create')
  @ApiOperation({ summary: 'Create a reverse transaction' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  create(@Req() req: RequestWithUser, @Body() dto: CreateReverseTransactionsDto) {
    return this.reverseTransactionsService.createReverseTransactions(req, dto);
  }

  @Post('me/search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Search reverse transaction' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  findAll(@Req() req: RequestWithUser, @Body() options: SearchOptions): Promise<Pagination> {
    return this.reverseTransactionsService.findAll(options, req.user.entityId);
  }
  @Post('me/search/:warehouseId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Search reverse transaction in warehouse' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  findAllForMe(
    @Req() req: RequestWithUser,
    @Body() options: SearchOptions,
    @Param('warehouseId') warehouseId: string,
  ): Promise<Pagination> {
    return this.reverseTransactionsService.findAll(
      options,
      req.user.entityId,
      this.reverseTransactionsService.toObjectId(warehouseId),
    );
  }
  @Get('me/findone/:warehouseId/:id')
  @ApiOperation({ summary: 'Find reverse transaction by id' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  async me(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Param('warehouseId') warehouseId: string,
  ) {
    return await this.reverseTransactionsService.findOneAndErr({
      _id: this.reverseTransactionsService.toObjectId(id),
      entityId: req.user.entityId,
      warehouseId: this.reverseTransactionsService.toObjectId(warehouseId),
    });
  }
}

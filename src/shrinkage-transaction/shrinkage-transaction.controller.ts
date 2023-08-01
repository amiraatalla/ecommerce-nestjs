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
import { CreateShrinkageTransactionDto } from './dto/create-shrinkage-transaction.dto';
import { ShrinkageTransactionService } from './shrinkage-transaction.service';

@Controller('shrinkage-transaction')
@ApiTags('shrinkage-transaction')
export class ShrinkageTransactionController {
  constructor(private readonly shrinkageTransactionsService: ShrinkageTransactionService) {}

  @Post('me/create')
  @ApiOperation({ summary: 'Create a shrinkage transactions' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  create(@Req() req: RequestWithUser, @Body() dto: CreateShrinkageTransactionDto) {
    return this.shrinkageTransactionsService.createShrinkageTransactions(
      req,
      dto,
    );
  }

  @Post('me/search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Search shrinkage transactions' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  findAll(@Req() req: RequestWithUser, @Body() options: SearchOptions): Promise<Pagination> {
    return this.shrinkageTransactionsService.findAll(options, req.user.entityId);
  }
  @Post('me/search/:warehouseId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Search shrinkage transaction in a warehouse' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  findAllForMe(
    @Req() req: RequestWithUser,
    @Body() options: SearchOptions,
    @Param('warehouseId') warehouseId: string,
  ): Promise<Pagination> {
    return this.shrinkageTransactionsService.findAll(
      options,
      req.user.entityId,
      this.shrinkageTransactionsService.toObjectId(warehouseId),
    );
  }
  @Get('me/findone/:warehouseId/:id')
  @ApiOperation({ summary: 'Find shrinkage transaction by id' })
  @UseGuards(JwtAuthGuard)
  async me(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Param('warehouseId') warehouseId: string,
  ) {
    return await this.shrinkageTransactionsService.findOneAndErr({
      _id: this.shrinkageTransactionsService.toObjectId(id),
      entityId: req.user.entityId,
      warehouseId: this.shrinkageTransactionsService.toObjectId(warehouseId),
    });
  }
}

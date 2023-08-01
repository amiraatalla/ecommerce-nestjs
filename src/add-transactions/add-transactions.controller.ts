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
  Header,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/role.decorator';
import { JwtAuthGuard, RoleGuard } from 'src/auth/guards';
import { RequestWithUser } from 'src/core/interfaces';
import { SearchOptions, Pagination } from 'src/core/shared';
import { RoleGroups } from 'src/users/enums/roles.enum';
import { AddTransactionsService } from './add-transactions.service';
import { CreateAddTransactionsDto } from './dto/create-add-transactions.dto';

@Controller('add-transactions')
@ApiTags('add-transactions')
export class AddTransactionsController {
  constructor(private readonly addTransactionsService: AddTransactionsService) {}

  @Post('me/create')
  @ApiOperation({ summary: 'Create a add transaction' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  create(@Req() req: RequestWithUser, @Body() dto: CreateAddTransactionsDto) {
    return this.addTransactionsService.createAddTransactions(req, dto);
  }

  @Post('me/search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Search add transaction' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  findAll(@Req() req: RequestWithUser, @Body() options: SearchOptions): Promise<Pagination> {
    return this.addTransactionsService.findAll(options, req.user.entityId);
  }
  @Post('me/search/:warehouseId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Search add transaction' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  findAllForMe(
    @Req() req: RequestWithUser,
    @Body() options: SearchOptions,
    @Param('warehouseId') warehouseId: string,
  ): Promise<Pagination> {
    return this.addTransactionsService.findAll(
      options,
      req.user.entityId,
      this.addTransactionsService.toObjectId(warehouseId),
    );
  }
  @Get('me/findone/:warehouseId/:id')
  @ApiOperation({ summary: 'Find add transaction by id' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  async me(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Param('warehouseId') warehouseId: string,
  ) {
    return await this.addTransactionsService.findOneAndErr({
      _id: this.addTransactionsService.toObjectId(id),
      entityId: req.user.entityId,
      warehouseId: this.addTransactionsService.toObjectId(warehouseId),
    });
  }
}

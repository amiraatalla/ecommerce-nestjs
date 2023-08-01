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
import { AuditTransactionsService } from './audit-transactions.service';
import { CreateAuditTransactionsDto } from './dto/audit-transactions.dto';

@Controller('audit-transactions')
@ApiTags('audit-transactions')
export class AuditTransactionsController {
  constructor(private readonly auditTransactionsService: AuditTransactionsService) {}

  @Post('me/create')
  @ApiOperation({ summary: 'Create an audit transactions' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  create(@Req() req: RequestWithUser, @Body() dto: CreateAuditTransactionsDto) {
    return this.auditTransactionsService.createAuditTransactions(req, dto);
  }

  @Post('me/search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Search audit transactions' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  findAll(@Req() req: RequestWithUser, @Body() options: SearchOptions): Promise<Pagination> {
    return this.auditTransactionsService.findAll(options, req.user.entityId);
  }
  @Post('me/search/:warehouseId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Search audit transaction related to a warehouse' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  findAllForMe(
    @Req() req: RequestWithUser,
    @Body() options: SearchOptions,
    @Param('warehouseId') warehouseId: string,
  ): Promise<Pagination> {
    return this.auditTransactionsService.findAll(
      options,
      req.user.entityId,
      this.auditTransactionsService.toObjectId(warehouseId),
    );
  }
  @Get('me/findone/:warehouseId/:id')
  @ApiOperation({ summary: 'Find audit transactions by id' })
  @UseGuards(JwtAuthGuard)
  async me(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Param('warehouseId') warehouseId: string,
  ) {
    return await this.auditTransactionsService.findOneAndErr({
      _id: this.auditTransactionsService.toObjectId(id),
      entityId: req.user.entityId,
      warehouseId: this.auditTransactionsService.toObjectId(warehouseId),
    });
  }
}

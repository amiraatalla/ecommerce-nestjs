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
import { RoleGroups, RolesEnum } from 'src/users/enums/roles.enum';
import { CreateReleaseTransactionsDto } from './dto/create-release-transactions.dto';
import { ReleaseTransactionsService } from './release-transactions.service';

@Controller('release-transactions')
@ApiTags('release-transactions')
export class ReleaseTransactionsController {
  constructor(private readonly releaseTransactionsService: ReleaseTransactionsService) {}

  @Post('me/create')
  @ApiOperation({ summary: 'Create a release transactions' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS, RolesEnum.INVENTORYMAN)
  create(@Req() req: RequestWithUser, @Body() dto: CreateReleaseTransactionsDto) {
    return this.releaseTransactionsService.createReleaseTransactions(req, dto);
  }

  @Post('me/search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Search release transactions' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  findAll(@Req() req: RequestWithUser, @Body() options: SearchOptions): Promise<Pagination> {
    return this.releaseTransactionsService.findAll(options, req.user.entityId);
  }
  @Post('me/search/:warehouseId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Search release transaction' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  findAllForMe(
    @Req() req: RequestWithUser,
    @Body() options: SearchOptions,
    @Param('warehouseId') warehouseId: string,
  ): Promise<Pagination> {
    return this.releaseTransactionsService.findAll(
      options,
      req.user.entityId,
      this.releaseTransactionsService.toObjectId(warehouseId),
    );
  }
  @Get('me/findone/:warehouseId/:id')
  @ApiOperation({ summary: 'Find release transactions by id' })
  @UseGuards(JwtAuthGuard)
  async me(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Param('warehouseId') warehouseId: string,
  ) {
    return await this.releaseTransactionsService.findOneAndErr({
      _id: this.releaseTransactionsService.toObjectId(id),
      entityId: req.user.entityId,
      warehouseId: this.releaseTransactionsService.toObjectId(warehouseId),
    });
  }
}

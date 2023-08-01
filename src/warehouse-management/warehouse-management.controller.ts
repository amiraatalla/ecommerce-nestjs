import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Req,
  UseGuards,
  Res,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/role.decorator';
import { JwtAuthGuard, RoleGuard } from 'src/auth/guards';
import { RequestWithUser } from 'src/core/interfaces';
import { SearchOptions, Pagination } from 'src/core/shared';
import { RoleGroups } from 'src/users/enums/roles.enum';
import { CreateWarehouseDto } from './dto/create-warehouse';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { WarehouseManagementService } from './warehouse-management.service';

@Controller('warehouse-management')
@ApiTags('warehouse-management')
export class WarehouseManagementController {
  constructor(private readonly warehouseService: WarehouseManagementService) {}

  // @Post('me/create')
  // @ApiOperation({ summary: 'Create a warehouse' })
  // @UseGuards(JwtAuthGuard, RoleGuard)
  // @Roles(...RoleGroups.BUSSINESS)
  // create(@Req() req: RequestWithUser, @Body() dto: CreateWarehouseDto) {
  //   return this.warehouseService.createWarehouse(
  //     req,
  //     dto
  //   );
  // }

  @Post('me/search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Search warehouses' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  findAll(
    @Req() req: RequestWithUser,
    @Body() options: SearchOptions,
  ): Promise<Pagination> {
    return this.warehouseService.findAll(options, req.user._id);
  }

  @Get('me/findone/:id')
  @ApiOperation({ summary: 'Find warehouse by id' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  async me(@Req() req: RequestWithUser, @Param('id') id: string) {
    return await this.warehouseService.findOneAndErr({
      _id: this.warehouseService.toObjectId(id),
      owner: req.user._id,
    });
  }

  @Get('me/findone')
  @ApiOperation({ summary: 'Find my warehouse' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  async myWarehouse(@Req() req: RequestWithUser) {
    return await this.warehouseService.findOneAndErr({
      owner: req.user._id,
    });
  }

  @Patch('me/update/:id')
  @ApiOperation({ summary: 'Update warehouse by id' })
  @UseGuards(JwtAuthGuard)
  updateMe(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: UpdateWarehouseDto,
  ) {
    return this.warehouseService.updateOne(
      {
        _id: this.warehouseService.toObjectId(id),
        entityId: req.user.entityId,
      },
      dto,
    );
  }
}

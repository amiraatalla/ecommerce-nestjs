import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/role.decorator';
import { JwtAuthGuard, RoleGuard } from 'src/auth/guards';
import { RequestWithUser } from 'src/auth/interfaces/user-request.interface';
import { Pagination } from 'src/core/shared';
import { RoleGroups, RolesEnum } from 'src/users/enums/roles.enum';
import { CodeDto } from './dto/code.dto';
import { CreateTableDto } from './dto/create-table.dto';
import { TablesSearchOptions } from './dto/table-search-options.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { TableService } from './table.service';

@Controller('table')
@ApiTags('table')
export class TableController {
  constructor(
    private readonly tableService: TableService,
  ) { }
  

  @Post('/me/create')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(RolesEnum.RESTURANT)
  @ApiBody({ type: CreateTableDto })
  @ApiOperation({ summary: 'Create a Table -BO' })
  async create(@Body() dto: CreateTableDto, @Req() req: RequestWithUser) {
    return await this.tableService.createTable(req, dto);
  }

  @Get('me/findOne/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS_CASHIER_WAITER)
  @ApiOperation({ summary: 'Get Table - CASHIER' })
  async getTable(@Param('id') id : string, @Req() req: RequestWithUser) {
    return await this.tableService.findTable(req,id);
  }

  @Post('me/find-table-by-code')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS_CASHIER_WAITER_CUSTOMER)
  @ApiOperation({ summary: 'Get Table by code ' })
  async getTableByCode(@Body() dto : CodeDto, @Req() req: RequestWithUser) {
    return await this.tableService.getTableByCode(req, dto);
  }


  @Patch('/me/update/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(RolesEnum.RESTURANT)
  @ApiBody({ type: UpdateTableDto })
  @ApiOperation({ summary: 'Update a Table -BO' })
  async update(@Req() req: RequestWithUser,@Param('id') id : string, @Body() dto: UpdateTableDto) {
    return await this.tableService.updateTable(req,id, dto);
  }

  @Delete('/me/delete/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(RolesEnum.RESTURANT)
  @ApiOperation({ summary: 'Delete Table -BO' })
  async delete(@Req() req: RequestWithUser,@Param('id') id : string) {
    return await this.tableService.deleteTable(req,id);
  }

  @Post('me/search')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS_CASHIER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'find all Tables - BO - cashier' })
  async search(@Req() req: RequestWithUser,@Body() options: TablesSearchOptions) : Promise<Pagination>{
    return await this.tableService.findAll(req.user.entityId,req,options);
  }


}
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
  UploadedFile,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/role.decorator';
import { JwtAuthGuard, RoleGuard } from 'src/auth/guards';
import { FileUpload, RequestWithUser } from 'src/core/interfaces';
import { SearchOptions, Pagination } from 'src/core/shared';
import { RoleGroups, RolesEnum } from 'src/users/enums/roles.enum';
import { StockItemsWarehousesAssignment } from 'src/stock-item-data/dto/stockitems-warehouses-assignment.dto';
import { CreateStockItemDto } from './dto/create-stockitem.dto';
import { UpdateStockItemDto } from './dto/update-stockitem.dto';
import { StockItem } from './entities/stock-item.entity';
import { StockItemDataService } from './stock-item-data.service';
import { UpdateWarehoseStockItemDto } from './dto/update-warehouse-stockitem-data.dto';
import { Response } from 'express';
import { StockItemSearchOptions } from './dto/stock-item-search-option.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ExportStockItemDto } from './dto/export-stockitem.dto';
import { FindStockItemBySKUDto } from './dto/find-stock-item-by-sku.dto';
import { toObjectId } from 'src/core/utils';
import { ObjectId } from 'mongoose';
import { StockItemDataCustomerService } from './stock-item-data-customer.service';
import { UpdateIsFeaturesDto } from './dto/update-is-features.dto';

@Controller('stock-item-data')
@ApiTags('stock-item-data')
export class StockItemDataController {
  constructor(
    private readonly stockItemDataService: StockItemDataService,
    private readonly stockItemCustomerDataService: StockItemDataCustomerService,
    ) {}
  
  @Post('me/create')
  @ApiOperation({ summary: 'Create a stock item' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  create(@Req() req: RequestWithUser, @Body() dto: CreateStockItemDto) {
    return this.stockItemDataService.createStockItem(req, dto);
  }

  // @Post('me/search')
  // @HttpCode(HttpStatus.OK)
  // @ApiOperation({ summary: 'Search stock item in restaurant' })
  // @UseGuards(JwtAuthGuard, RoleGuard)
  // @Roles(...RoleGroups.BUSSINESS)
  // findAllForMe(
  //   @Req() req: RequestWithUser,
  //   @Body() options: StockItemSearchOptions,
  // ): Promise<Pagination> {
  //   return this.stockItemDataService.findAll(options, req.user.entityId);
  // }
  @Post('me/assign-stockitem')
  @ApiOperation({ summary: 'assign stockitem from one warehouse to anouther ' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  moveStockitemToAnotherWarehouse(
    @Req() req: RequestWithUser,
    @Body() dto: StockItemsWarehousesAssignment,
  ): Promise<StockItem> {
    return this.stockItemDataService.assignStockItemToAnotherWarehouse(req, dto);
  }
 
  @Post('me/export-to-excel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'export Stock items of a warhouse' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  stockItemExcel(@Req() req: RequestWithUser, @Res() res: Response,@Body() dto:ExportStockItemDto) {
    req.user.warehouseId = req.user.warehouseId;
    return this.stockItemDataService.exportStockItems(req.user.entityId,req.user.warehouseId, res);
  }
  @Post('me/export-to-excel-uncoded')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'export uncoded items' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  uncodedStockItemExcel(
    @Req() req: RequestWithUser,
    @Res() res: Response,
    @Body() dto: ExportStockItemDto,
  ) {
    return this.stockItemDataService.exportStockItems(
      req.user.entityId,
      req.user.warehouseId,
      res,
      'uncoded'
    );
  }
 
  @Post('me/search/:warehouseId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Search warehouses' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  findAllInBranch(
    @Req() req: RequestWithUser,
    @Body() options: SearchOptions,
    @Param('warehouseId') warehouseId: string,
  ): Promise<Pagination> {
    return this.stockItemDataService.findAll(
      options,
      req.user.entityId,
      this.stockItemDataService.toObjectId(warehouseId),
    );
  }
  @Post('me/import-csv')
  @ApiOperation({ summary: 'Import stockItems from CSV file' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  @UseInterceptors(FileInterceptor('file'))
  stockItemsCSV(
    @Req() req: RequestWithUser,
    @UploadedFile() file: any,
    @Res() res: Response,
  ) {
    return this.stockItemDataService.parseCsvFile(
      req.user.entityId,
      req.user.warehouseId,
      file,
      res,  
    );
  }
  @Get('me/findone/:warehouseId/:id')
  @ApiOperation({ summary: 'Find one stock item by id in warehouse' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  meInBranch(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Param('warehouseId') warehouseId: string,
  ): Promise<StockItem> {
    return this.stockItemDataService.getOneWarehoseStockItem(
      this.stockItemDataService.toObjectId(id),
      req.user.entityId,
      this.stockItemDataService.toObjectId(warehouseId),
    );
  }
  
  @Get('me/findone/:id')
  @ApiOperation({ summary: 'Find stock item by id' })
  @UseGuards(JwtAuthGuard)
  async me(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.stockItemDataService.getOneStockItem(
      this.stockItemDataService.toObjectId(id),
      req.user.entityId,
    );
  }
  @Patch('me/update/:warehouseId/:id')
  @ApiOperation({ summary: 'Find one stock item by id in warehouse' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  updateMeInBranch(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Param('warehouseId') warehouseId: string,
    @Body() dto: UpdateWarehoseStockItemDto,
  ) {
    return this.stockItemDataService.updateOneWarehoseStockItem(
      this.stockItemDataService.toObjectId(id),
      req.user.entityId,
      this.stockItemDataService.toObjectId(warehouseId),
      dto,
    );
  }
  @Patch('me/update/:id')
  @ApiOperation({ summary: 'Update stock item by id' })
  @UseGuards(JwtAuthGuard)
  updateMe(@Req() req: RequestWithUser, @Param('id') id: string, @Body() dto: UpdateStockItemDto) {
    return this.stockItemDataService.updateStockItem(this.stockItemDataService.toObjectId(id),req.user.entityId, dto);
  }
  @Delete('me/delete/:warehouseId/:id')
  @ApiOperation({ summary: 'Delete one stock item by id from warehouse' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  removeMeFromBranch(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Param('warehouseId') warehouseId: string,
  ) {
    return this.stockItemDataService.removeFromOneWarehouse(
      this.stockItemDataService.toObjectId(id),
      req.user.entityId,
      this.stockItemDataService.toObjectId(warehouseId),
    );
  }

  @Delete('me/delete/:id')
  @ApiOperation({ summary: 'Delete stock item by id' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  removeMe(@Req() req: RequestWithUser, @Param('id') id: string): Promise<boolean> {
    return this.stockItemDataService.removeOne({
      _id: this.stockItemDataService.toObjectId(id),
      entityId: req.user.entityId,
    });
  }
  @Post('search-mw-transactions')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  @ApiOperation({ summary: 'search in middleware transaction table only for test' })
  findAll(@Req() req: RequestWithUser) {
    return this.stockItemDataService.findAllTest(req.user.entityId);
  }
  @Post('search-mw-transactions/:warehouseId/:stockitemId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'search in middleware transaction table only for test' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  findAllForStockItem(
    @Req() req: RequestWithUser,
    @Param('warehouseId') warehouseId: string,
    @Param('stockitemId') stockitemId: string,
  ) {
    return this.stockItemDataService.findAllBatches(
      req.user.entityId,
      this.stockItemDataService.toObjectId(warehouseId),
      this.stockItemDataService.toObjectId(stockitemId),
    );
  }
  @Post('get-one-piece-price/:warehouseId/:stockitemId/:qty')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'get one piece price in a warehouse' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  getOnePiecePrice(
    @Req() req: RequestWithUser,
    @Param('warehouseId') warehouseId: string,
    @Param('stockitemId') stockitemId: string,
    @Param('qty') qty: number,
  ) {
    return this.stockItemDataService.getPrice(
      req.user.entityId,
      this.stockItemDataService.toObjectId(warehouseId),
      this.stockItemDataService.toObjectId(stockitemId),
      qty
    );
  }


  //customer
  @Post('customer/search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Search Stock Items - customer' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(RolesEnum.CUSTOMER)
  findAllStockItems(
    @Req() req: RequestWithUser,
    @Body() options: SearchOptions,
   
  ): Promise<Pagination> {
    return this.stockItemCustomerDataService.findAllByCustomer(
      options
    );
  }

  @Post('customer/search/:entityId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Search Stock Items by categories - customer' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS_CASHIER_CUSTOMER)
  findAllStockItemsUnderCategories(
    @Param('entityId') entityId: string,
    @Req() req: RequestWithUser,
   
  ) {
    return this.stockItemCustomerDataService.findAllCategories(
      this.stockItemDataService.toObjectId(entityId),
      req,
    );
  }
  

  @Post('customer/popular-stock-items/:entityId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Search Popular Stock Items - customer' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(RolesEnum.CUSTOMER)
  findPopularStockItems(
    @Param('entityId') entityId: string,
    @Req() req: RequestWithUser,
  ) {
    return this.stockItemCustomerDataService.findAllPopularStockItems(
      this.stockItemDataService.toObjectId(entityId),
      req,
    );
  }

  @Post('customer/findone-by-sku')
  @ApiOperation({ summary: 'Find stock item by sku - customer' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(RolesEnum.CUSTOMER)
  async getStockItemBySKU(@Req() req: RequestWithUser, @Body()dto: FindStockItemBySKUDto) {
    return await this.stockItemCustomerDataService.getStockItemBySKU(req, dto);
  }

  @Get('customer/findone/:id')
  @ApiOperation({ summary: 'Find stock item by id - customer' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(RolesEnum.CUSTOMER)
  async getStockItemById(@Req() req: RequestWithUser, @Param('id') id: string) {
    return await this.stockItemCustomerDataService.getStockItemById(req,id);
  }

 
  @Patch('me/updateIsFeatures/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.ADMINSTRATION)
  @ApiBody({ type: UpdateIsFeaturesDto })
  @ApiOperation({ summary: 'update is features - SA ' })
  async updateIsFeaturesDto(@Param('id') id : string, @Body() dto: UpdateIsFeaturesDto, @Req() req: RequestWithUser) {
    return await this.stockItemDataService.updateIsFeatures(req, id, dto);
  }

  @Post('me/search-is-features')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'find is features stock item in restaurant' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(RolesEnum.CUSTOMER)
  findAllIsFeatured(
    @Req() req: RequestWithUser,
    @Body() options: StockItemSearchOptions,
  ): Promise<Pagination> {
    return this.stockItemDataService.findAllIsFeatured(options, req.user.entityId);
  }


}

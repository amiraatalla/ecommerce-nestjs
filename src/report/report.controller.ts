import { Body, Controller, Get, Param, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express'
import { Roles } from 'src/auth/decorators/role.decorator';
import { JwtAuthGuard, RoleGuard } from 'src/auth/guards';
import { RequestWithUser } from 'src/core/interfaces';
import { DateToDatePeriodDto } from './dto/date-to-date-period.dto ';
import { DateToDateDto } from './dto/date-to-date.dto';
import { ReportDto } from './dto/report.dto';
import { ReportService } from './report.service';
import { ReportOptions } from './dto/report-search.dto';
import { RoleGroups } from 'src/users/enums/roles.enum';
import { ReportItemSalesOptions } from './dto/report-item-sales.dto';
import { DateFilter } from './dto/date-filter-report.dto';

@ApiTags('report')
@Controller('report')
export class ReportController {
  constructor(
    private readonly reportService: ReportService,
  ) { }
   //
  @Post('me/orders')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  @ApiOperation({ summary: 'item sales report' })
  async itemReport(
    @Body() options: ReportItemSalesOptions,
    @Req() req: RequestWithUser,
    @Res() res:Response
  ) {
    return await this.reportService.itemReport(options, req.user.entityId,res);
  }
  @Post('me/add-transaction')
  @ApiOperation({ summary: 'add transaction report' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  addTransactionReport(
    @Req() req: RequestWithUser,
    @Body() options: DateFilter,
  ): Promise<any[]> {
    return this.reportService.addTransactionReport(options, req.user.entityId );
  }
  @Post('me/audit-transaction')
  @ApiOperation({ summary: 'audit transaction report' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  auditTransactionReport(
    @Req() req: RequestWithUser,
    @Body() options: DateFilter,
  ): Promise<any[]> {
    return this.reportService.auditTransactionReport(options, req.user.entityId );
  }

  @Post('me/release-transaction')
  @ApiOperation({ summary: 'release transaction report' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  releaseTransactionReport(
    @Req() req: RequestWithUser,
    @Body() options: ReportItemSalesOptions,
    @Res() res:Response
  ) {
    return this.reportService.releaseTransactionReport(
      options,
      req.user.entityId,
      res
    );
  }
  @Post('me/reverse-transaction')
  @ApiOperation({ summary: 'reverse transaction report' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  reverseTransactionReport(
    @Req() req: RequestWithUser,
    @Body() options: DateFilter, 
  ): Promise<any[]> {
    return this.reportService.reverseTransactionReport(
      options,
      req.user.entityId,
    );
  }
  @Post('me/shrinkage-transaction')
  @ApiOperation({ summary: 'shrinkage transaction report' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  shrinkageTransactionReport(
    @Req() req: RequestWithUser,
    @Body() options: DateFilter
  ): Promise<any[]> {
    return this.reportService.shrinkageTransactionReport(
      options,
      req.user.entityId,
    );
  }

  @Post('me/waste-transaction')
  @ApiOperation({ summary: 'waste transaction report' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  wasteTransactionReport(
    @Req() req: RequestWithUser,
    @Body() options: DateFilter, 
  ): Promise<any[]> {
    return this.reportService.wasteTransactionReport(options, req.user._id );
  }
 
  @Post('me/deferred-payable')
  @ApiOperation({ summary: 'deferred payable report' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  deferredPayableReport(
    @Req() req: RequestWithUser,
    @Body() options: DateFilter,
  
  ): Promise<any[]> {
    return this.reportService.deferredPayableReport(options, req.user._id);
  }
  @Post('me/deferred-receivable')
  @ApiOperation({ summary: 'deferred receivable report' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  deferredReceivableReport(
    @Req() req: RequestWithUser,
    @Body() options: DateFilter,
  
  ): Promise<any[]> {
    return this.reportService.deferredReceivableReport(options, req.user._id);
  }
  @Post('me/payable')
  @ApiOperation({ summary: 'payable report' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  payableReport(
    @Req() req: RequestWithUser,
    @Body() options: DateFilter,
  
  ): Promise<any[]> {
    return this.reportService.payableReport(options, req.user._id);
  }
  @Post('me/receivable')
  @ApiOperation({ summary: 'receivable report' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  receivableReport(
    @Req() req: RequestWithUser,
    @Body() options: DateFilter,
  
  ): Promise<any[]> {
    return this.reportService.receivableReport(options, req.user._id);
  }


  /*---------------------*/
  @Post('me/customer-count-in-section')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Customer Count for section / Total Customer Count in store' })
  async customerCountInSection(@Req() req: RequestWithUser, @Body() dto: ReportDto, @Res()res: Response) {
    return await this.reportService.customerCountInSection(req, dto,res);
  }

  @Post('me/customer-count-in-department')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Customer Count for department / Total Customer Count in store' })
  async customeCountInDepartment(@Req() req: RequestWithUser, @Body() dto: ReportDto, @Res()res: Response) {
    return await this.reportService.customerCountInDepartment(req, dto, res);
  }



  @Post('me/wasted-item')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  @ApiOperation({ summary: 'wasted item' })
  async wastedItem(@Req() req: RequestWithUser, @Body() dto: ReportDto) {
    return await this.reportService.wastedItem(req, dto);
  }

  @Post('me/item-quantity')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  @ApiOperation({ summary: 'item quantity' })
  async itemQtys(@Req() req: RequestWithUser, @Body() dto: ReportDto) {
    return await this.reportService.itemQtys(req, dto);
  }

  @Post('me/item-with-zero-quantity')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  @ApiOperation({ summary: 'item with zero quantity' })
  async itemWithZeroQtys(@Req() req: RequestWithUser, @Body() dto: ReportDto) {
    return await this.reportService.itemWithZeroQtys(req, dto);
  }

  @Post('me/item-margin')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  @ApiOperation({ summary: 'item margin report' })
  async itemMarginReport(@Req() req: RequestWithUser, @Body() dto: ReportDto) {
    return await this.reportService.itemMarginReport(req, dto);
  }

  @Post('me/payables-and-deferred-payables-lists')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  @ApiOperation({ summary: 'payables and deferred payables lists' })
  async payablesAndDeferredPayablesLists(@Req() req: RequestWithUser, @Body() dto: ReportDto) {
  return await this.reportService.payablesAndDeferredPayablesLists(req, dto);
  }
  @Post('me/recievables-and-deferred-recievables-lists')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  @ApiOperation({ summary: 'recievables and deferred recievables lists' })
  async recievablesAndDeferredrecievablesLists(@Req() req: RequestWithUser, @Body() dto: ReportDto) {
  return await this.reportService.recievablesAndDeferredrecievablesLists(req, dto);
  }
  
  @Post('me/logs-list')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.ADMINSTRATION)
  @ApiOperation({ summary: 'logs list -SA' })
    async logsList(@Req() req: RequestWithUser, @Body() dto: ReportOptions ,@Res()res:Response) {
      return await this.reportService.logsList(dto,res);
  }

  @Post('me/customers-list')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  @ApiOperation({ summary: 'customers list - BO' })
  async customersAccountReport(@Req() req: RequestWithUser, @Body() dto: ReportDto) {
    return await this.reportService.customersAccountReport(req, dto);
  }

  @Post('me/customers-list-super-admin')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.ADMINSTRATION)
  @ApiOperation({ summary: 'customers list - SA' })
  async customersAccountReportSA( @Body() dto: ReportDto) {
    return await this.reportService.customersAccountReportSA(dto);
  }

  @Post('me/bussiness-list')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  @ApiOperation({ summary: 'bussiness list' })
  async bussinessAccountReport(@Req() req: RequestWithUser, @Body() dto: ReportDto) {
    return await this.reportService.businessAccountReport(req, dto);
  }

  @Post('me/coupons-list')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  @ApiOperation({ summary: 'coupons list' })
  async couponsReport(@Req() req: RequestWithUser) {
    return await this.reportService.couponsList(req);
  }

  @Get('me/coupon-details/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  @ApiOperation({ summary: 'coupon Details' })
  async couponDetailsReport(@Req() req: RequestWithUser, @Param('id') id: string) {
    return await this.reportService.couponDetails(req, id);
  }

  

  @Post('me/warehouses-list')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  @ApiOperation({ summary: 'Warehouses list' })
  async warehousesList(@Req() req: RequestWithUser) {
    return await this.reportService.warehousesList(req);
  }

  @Post('me/stock-category-list')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  @ApiOperation({ summary: 'Stock Category List ' })
  async stockCategoryList(@Req() req: RequestWithUser) {
    return await this.reportService.stockCategoryList(req);
  }

  @Post('me/stock-item-list')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  @ApiOperation({ summary: 'Stock Items List' })
  async stockItemList(@Req() req: RequestWithUser) {
    return await this.reportService.stockItemsList(req);
  }


  @Post('me/services-list')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  @ApiOperation({ summary: 'Services List' })
  async servicesList(@Req() req: RequestWithUser) {
    return await this.reportService.servicesList(req);
  }
  // -------------------------


  @Post('me/subscription')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.ADMINSTRATION)
  @ApiOperation({ summary: 'Subscriptions List -SA' })
  async subscription(@Req() req: RequestWithUser, @Body() dto: DateToDatePeriodDto) {
    return await this.reportService.subscription(req,dto);
  }

  
  @Post('me/statistics-report')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.ADMINSTRATION)
  @ApiOperation({ summary: 'statistics-report - SA' })
  async statisticsReport(@Body() dto: ReportDto) {
    return await this.reportService.statisticsReport(dto);
  }

  //new
  @Post('me/top-services-sold')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  @ApiOperation({ summary: 'Top Services Sold' })
  async Topservices(@Req() req: RequestWithUser, @Body()dto:ReportDto) {
    return await this.reportService.TopServiceSold(req ,dto);
  }
  
}
function HttpCode(OK: any) {
  throw new Error('Function not implemented.');
}


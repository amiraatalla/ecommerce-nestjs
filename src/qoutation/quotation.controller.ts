import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Req, Res, UseGuards } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { Roles } from "src/auth/decorators/role.decorator";
import { JwtAuthGuard, RoleGuard } from "src/auth/guards";
import { RequestWithUser } from "src/core/interfaces";
import { Pagination } from "src/core/shared";
import { RoleGroups } from "src/users/enums/roles.enum";
import { CreateQuotationDto } from "./dto/create-quotation.dto";
import { QuotationSearchOptions } from "./dto/quotation-search-options.dto";
import { QuotationService } from "./quotation.service";

@Controller('quotation')
@ApiTags('quotation')
export class QuotationController {
  constructor(
    private readonly quotationService: QuotationService,
  ) { }

  @Post('/me/create')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS_CASHIER)
  @ApiBody({ type: CreateQuotationDto })
  @ApiOperation({ summary: 'Create  quotation' })
  async createQuotation(
    @Req() req: RequestWithUser,
    @Body() dto: CreateQuotationDto,
    @Res() res: Response) {
    return await this.quotationService.createQuotation(req, dto, res);
  }


  @Get('/me/find/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS_CASHIER)
  @ApiOperation({ summary: 'find quotation' })
  async findQuotation(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    ) {
    return await this.quotationService.findQuotation(req, id);
  }


  @Delete('/me/delete/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS_CASHIER)
  @ApiOperation({ summary: 'Delete quotation' })
  async deleteQuotation(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    ) {
    return await this.quotationService.deleteQuotation(req, id);
  }

  @Post('me/search')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS_CASHIER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'find all quotations' })
  async search(@Req() req: RequestWithUser,@Body() options: QuotationSearchOptions) : Promise<Pagination>{
    return await this.quotationService.findAll(req.user._id,options, req);
  }


}

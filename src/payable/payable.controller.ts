import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/role.decorator';
import { JwtAuthGuard, RoleGuard } from 'src/auth/guards';
import { RequestWithUser } from 'src/auth/interfaces/user-request.interface';
import { Pagination } from 'src/core/shared';
import { RoleGroups, RolesEnum } from 'src/users/enums/roles.enum';
import { CreatePayableDto } from './dto/create-payable.dto';
import { PayableSearchOptions } from './dto/payable-search-options.dto';
import { PayableService } from './payable.service';

@Controller('payable')
@ApiTags('payable')
export class PayableController {
  constructor(
    private readonly PayableService: PayableService,
  ) { }
  

  @Post('me/create')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS_CASHIER)
  @ApiBody({ type: CreatePayableDto})
  @ApiOperation({ summary: 'Create a Payable' })
  async create(@Body() dto: CreatePayableDto,@Req() req: RequestWithUser) {
    return await this.PayableService.createPayable(req, dto);
  }

  @Get('me/findOne/:id')
  @ApiOperation({ summary: 'Find Payable by id' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS_CASHIER)
  async me(@Req() req: RequestWithUser, @Param('id') id: string) {
    return await this.PayableService.findOneAndErr({
      _id: this.PayableService.toObjectId(id),
    });
  }


  @Post('me/search')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS_CASHIER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'find all Payables' })
  async search(@Req() req,@Body() options: PayableSearchOptions) : Promise<Pagination>{
    return await this.PayableService.findAll(req.user._id,options);
  }

}
import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/role.decorator';
import { JwtAuthGuard, RoleGuard } from 'src/auth/guards';
import { RequestWithUser } from 'src/auth/interfaces/user-request.interface';
import { Pagination } from 'src/core/shared';
import { RoleGroups, RolesEnum } from 'src/users/enums/roles.enum';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { CustomerSearchOptions } from './dto/customer-search-options.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomerService } from './customer.service';

@Controller('customer')
@ApiTags('customer')
export class CustomerController {
  constructor(
    private readonly customerService: CustomerService,
  ) { }


  @Post('me/create')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS_CASHIER_CUSTOMER)
  @ApiBody({ type: CreateCustomerDto })
  @ApiOperation({ summary: 'Create a Customer' })
  async create(@Body() dto: CreateCustomerDto, @Req() req: RequestWithUser) {
    return await this.customerService.createCustomer(req, dto);
  }

  @Get('me/findOne/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS_CASHIER)
  @ApiOperation({ summary: 'Get a Customer' })
  async getCustomer(@Param('id') id: string, @Req() req: RequestWithUser) {
    return await this.customerService.findCustomer(req, id);
  }


  @Get('me/find-my-default-customer')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS_CASHIER)
  @ApiOperation({ summary: 'Get my default Customer' })
  async findMyDefaultCustomer(@Req() req: RequestWithUser) {
    return await this.customerService.findMyDefaultCustomer(req);
  }

  @Patch('/me/update/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS_CASHIER_CUSTOMER)
  @ApiBody({ type: UpdateCustomerDto })
  @ApiOperation({ summary: 'Update a Customer' })
  async update(@Req() req: RequestWithUser, @Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    return await this.customerService.updateCustomer(req, id, dto);
  }

  @Post('/me/search')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS_CASHIER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'find all Customers' })
  async search(@Req() req: RequestWithUser, @Body() options: CustomerSearchOptions): Promise<Pagination> {
    let id;
    if (req.user.role == RolesEnum.CASHIER) {
      id = req.user.owner
   } else {
      id = req.user._id
   }
    return await this.customerService.findAll(id, options);
  }


}
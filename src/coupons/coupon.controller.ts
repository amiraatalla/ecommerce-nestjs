import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  HttpCode,
  HttpStatus,
  Req,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, RoleGuard } from 'src/auth/guards';
import { RequestWithUser } from 'src/core/interfaces';
import { SearchOptions, Pagination } from 'src/core/shared';
import { RoleGroups, RolesEnum } from 'src/users/enums/roles.enum';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { CouponService } from './coupon.service';
import { Roles } from 'src/auth/decorators/role.decorator';
import { CreateCuoponDto } from './dto/create-coupon.dto';
import { ActivateCuoponDto } from './dto/activate-coupon.dto';
import { CreateMultiCuoponsDto } from './dto/create-multi-coupons.dto';
import { FindCuoponByCodeDto } from './dto/find-coupon-by-code.dto';

@Controller('coupon')
@ApiTags('coupon')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Post('me/create-single-coupon')
  @ApiOperation({ summary: 'Create a Coupon' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  createSingleCoupon(@Req() req: RequestWithUser, @Body() dto: CreateCuoponDto) {
    return this.couponService.createSingleCoupon(req, dto);
  }

  

  @Post('me/create-multi-coupon')
  @ApiOperation({ summary: 'Create Multi Coupon' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  createMultiCoupon(@Req() req: RequestWithUser, @Body() dto: CreateMultiCuoponsDto) {
    return this.couponService.createMultiCoupons(req, dto);
  }

  @Post('me/search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Search Coupon' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  findAll(
    @Req() req: RequestWithUser,
    @Body() options: SearchOptions,
  ): Promise<Pagination> {
    return this.couponService.findAll(req.user._id,options ,req);
  }

  @Get('me/findOne/:id')
  @ApiOperation({ summary: 'Find Coupon by id' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  async me(@Req() req: RequestWithUser, @Param('id') id: string) {
    return await this.couponService.findCoupon(req, id);
  }

  @Post('me/find-coupon-by-code')
  @ApiOperation({ summary: 'Find Coupon by code' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS_CASHIER_CUSTOMER)
  async findByCode(@Req() req: RequestWithUser, @Body() dto: FindCuoponByCodeDto) {
    return await this.couponService.findCouponByCode(req, dto);
  }


  @Patch('me/update/:id')
  @ApiOperation({ summary: 'Update Coupon by id' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  updateMe(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: UpdateCouponDto,
  ) {
    return this.couponService.updateCoupon(req, id, dto);
  }

  @Patch('me/activate/:id')
  @ApiOperation({ summary: 'Active or deactive coupon by id' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  async activateCoupon(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: ActivateCuoponDto,
  ) {
    return this.couponService.activeCoupon(req, id, dto);
  }
}

import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Req, Request, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/role.decorator';
import { JwtAuthGuard, LocalAuthGuard, RoleGuard } from 'src/auth/guards';
import { RequestWithUser } from 'src/core/interfaces';
import { Pagination, SearchOptions } from 'src/core/shared';
import { RoleGroups, RolesEnum } from 'src/users/enums/roles.enum';
import { CreatePackageDto } from './dtos/create-package.dto';
import { UpdatePackageExtraLimitDto } from './dtos/update-package-extra-limit.dto';
import { UpdatePackageTypeDto } from './dtos/update-package-type.dto';

import { UpdatePackageDto } from './dtos/update-package.dto';
import { SubscriptionService } from './subscribtion.service';

@Controller('subscription')
@ApiTags('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) { }

  

  @Post('me/create-package')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  @ApiOperation({ summary: 'Create a Package for subscription' })
  async createPackage(@Req() req: RequestWithUser) {
    return await this.subscriptionService.createPackage(req);
  }


  @Get('/get-package/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.ADMINSTRATION)
  @ApiOperation({ summary: 'get Package SA' })
  async getPackage(@Param('id') id: string) {
    return await this.subscriptionService.getPackage(id);
  }

  @Get('me/package')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  @ApiOperation({ summary: 'Find my package' })
  async getMyPackage(@Req() req: RequestWithUser){
    return await this.subscriptionService.getMyPackage(req);
  }

  @Patch('me/upgrade-or-downgrade-package')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  @ApiOperation({ summary: 'upgrade or downgrade Package' })
  async updatePackage(@Req() req: RequestWithUser, @Body()dto: UpdatePackageTypeDto) {
    return await this.subscriptionService.upgradeOrDownGradePackage(req, dto);
  }
  @Patch('me/update-extra/limit')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  @ApiOperation({ summary: 'update extra limit' })
  async updateExtraLimit(@Req() req: RequestWithUser, @Body()dto: UpdatePackageExtraLimitDto) {
    return await this.subscriptionService.updateExtraLimit(req, dto);
  }


  @Patch('me/renew-package')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  @ApiOperation({ summary: 'renew Package' })
  async renewPackage(@Req() req: RequestWithUser) {
    return await this.subscriptionService.renewPackage(req);
  }

  @Patch('me/add-users-to-package')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  @ApiOperation({ summary: 'add users to Package' })
  async addUsersToPackage(@Req() req: RequestWithUser, @Body()dto: UpdatePackageDto) {
    return await this.subscriptionService.addUsersToPackage(req, dto);
  }

  @Patch('me/remove-users-from-package')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  @ApiOperation({ summary: 'remove users from Package' })
  async removeUsersFromPackage(@Req() req: RequestWithUser, @Body()dto: UpdatePackageDto) {
    return await this.subscriptionService.removeUsersFromPackage(req, dto);
  }
  

  @Post('search')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(RolesEnum.SUPER_ADMIN)
  @ApiOperation({ summary: 'Search subscription details - SA' })
  findAll(@Request() req: RequestWithUser,@Body() options: SearchOptions): Promise<Pagination> {
    return this.subscriptionService.findAll(options);
  }

}

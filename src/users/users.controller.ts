import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Req, Request, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/role.decorator';
import { SignUpDto } from 'src/auth/dto/sign-up.dto';
import { JwtAuthGuard, RoleGuard } from 'src/auth/guards';
import { JwtCompletedGuard } from 'src/auth/guards/jwt-completed.guard';
import { RequestWithUser } from 'src/core/interfaces';
import { Pagination } from 'src/core/shared';
import { toObjectId } from 'src/core/utils';
import { ActionsEnum } from 'src/sysLog/enums/actions.enums';
import { SYSLogService } from 'src/sysLog/sysLog.service';
import { ChangeEmailDto } from './dto/change-email.dto';
import { CreateProfileDto } from './dto/create-profile.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { DeactiveUserDto } from './dto/deactive-user.dto';
import { UpdateCustomerPromotionalDto } from './dto/Update-customer-promotional.dto';
import { UpdatePinDto } from './dto/Update-pin.dto';
import { UpdateUserDeviceTokenDto } from './dto/update-user-device-token.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserSearchOptions } from './dto/user-search-options.dto';
import { User } from './entities/user.entity';
import { RoleGroups, RolesEnum } from './enums/roles.enum';
import { UsersService } from './users.service';

@Controller('users')
@ApiTags('users')

export class UsersController {
  constructor(
    private readonly usersService: UsersService,
        private readonly sysLogsService: SYSLogService,

  ) { }


  @Post('/create')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.ADMINSTRATION)
  @ApiBody({ type: CreateUserDto })
  @ApiOperation({ summary: 'Create super admin with password' })
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.createWithPassword(createUserDto);
  }

  @Post('/search')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(RolesEnum.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'find all users SA' })
  async search(@Body() options: UserSearchOptions): Promise<Pagination> {
    return await this.usersService.findAll(options);
  }

  // @Post('/search-business')
  // @UseGuards(JwtAuthGuard, RoleGuard)
  // @Roles(RolesEnum.SUPER_ADMIN)
  // @HttpCode(HttpStatus.OK)
  // @ApiOperation({ summary: 'find all  Bussiness Owners users SA' })
  // async searchBusiness(@Body() options: UserSearchOptions): Promise<Pagination> {
  //   return await this.usersService.findAllBusinessOwners(options);
  // }

  @Get('/find/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.ADMINSTRATION)
  @ApiOperation({ summary: 'Find one user by id' })
  async findUser(@Param('id') id: string): Promise<User> {
    return await this.usersService.findOneById(id, { password: 0 , pin: 0 });
  }
  @Get('/me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Find me' })
  async me(@Req() req: RequestWithUser): Promise<User> {
    return await this.usersService.me(req);
  }

  @Get('/me/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  @ApiOperation({ summary: 'Find user under resturant or merchant' })
  async myUser(@Req() req: RequestWithUser, @Param('id') id: string) {
    return await this.usersService.myUser(req, id);
  }

  // @Get('/me/search')
  // @UseGuards(JwtAuthGuard, RoleGuard)
  // @Roles(...RoleGroups.BUSSINESS)
  // @ApiOperation({ summary: 'Find users under Resturant or Merchant' })
  // async myUsers(@Req() req: RequestWithUser) {
  //   return await this.usersService.myUsers(req);
  // }

  @Post('/me/active/search')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Find active users under Resturant or Merchant' })
  async myActiveUsers(@Req() req: RequestWithUser,@Body() options: UserSearchOptions): Promise<Pagination> {
    return await this.usersService.findMyActiveUsers(options, req);
  }
  
  @Post('/me/deactive/search')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Find deactive users under Resturant or Merchant' })
  async myDeactiveUsers(@Req() req: RequestWithUser,@Body() options: UserSearchOptions): Promise<Pagination> {
    return await this.usersService.findMyDeActiveUsers(options, req);
  }
 
  @Patch('/me/update')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update me' })
  async updateMe(@Req() req: RequestWithUser, @Body() updateUserDto: UpdateUserDto): Promise<User> {
    return await this.usersService.updateMe(req, updateUserDto);
  }


  @Patch('/me/update/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  @ApiOperation({ summary: 'Update one user under Resturant or Merchant' })
  async updateMyUser(@Req() req: RequestWithUser, @Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<User> {
    return await this.usersService.updateMyUser(req, id, updateUserDto);
  }

  @Patch('/update-promotional-messages-discounts/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.ADMINSTRATION)
  @ApiOperation({ summary: 'Update customer SA' })
  async updateCustomerPromotional(@Req() req: RequestWithUser, @Param('id') id: string, @Body() dto: UpdateCustomerPromotionalDto): Promise<User> {
    return await this.usersService.updateCustomerPromotional(req, id, dto);
  }


  @Patch('/update-pin')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  @ApiOperation({ summary: 'Update Pin - BO' })
  async updateMYPin(@Req() req: RequestWithUser,  @Body() dto: UpdatePinDto): Promise<User> {
    
    return await this.usersService.updateMyPin(req, dto);
  }

  @Patch('device-token/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update one user device token by id' })
  updateUserDeviceToken(
    @Param('id') id: string,
    @Body() dto: UpdateUserDeviceTokenDto,
  ) {
    this.sysLogsService.create({
      userId: id,
      action: ActionsEnum.UPDATE_USER,
    });

    return this.usersService.updateUserDeviceToken(id, dto);
  }

  @Post('/deactive/:id')
  @ApiOperation({ summary: 'Deactive user by id' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(RolesEnum.SUPER_ADMIN)
  @ApiBody({ type: DeactiveUserDto })
  async deactiveUser(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: DeactiveUserDto,
  ): Promise<User> {
    return await this.usersService.deactiveUser(req, id, dto);
  }

 

  @Post('/profile')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  @ApiOperation({ summary: 'Create a profile for users under resturant and merchant' })
  @ApiBody({ type: CreateProfileDto })
  createProfile(@Req() req: RequestWithUser, @Body() dto: CreateProfileDto) {
    return this.usersService.createProfile(req, dto);
  }

  @Patch('/renew-user/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  @ApiOperation({ summary: 'renew user' })
  async renewUser(@Req() req: RequestWithUser,@Param('id') id: string) {
    return await this.usersService.renewUser(req,id);
  }



 // //remove later
  //   @Get('/get-user/:id')
  //   @Roles(...RoleGroups.ADMINSTRATION)
  //   @ApiOperation({ summary: 'Find one user by id' })
  //   findTest(@Param('id') id: string): Promise<User> {
  //     return this.usersService.findOne({_id:toObjectId(id)}, { password: 0 , pin: 0 });
  //   }



  

}
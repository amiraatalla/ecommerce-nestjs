import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/role.decorator';
import { JwtAuthGuard, RoleGuard } from 'src/auth/guards';
import { RequestWithUser } from 'src/auth/interfaces/user-request.interface';
import { Pagination } from 'src/core/shared';
import { RoleGroups, RolesEnum } from 'src/users/enums/roles.enum';
import { CreateEntitiesDto } from './dto/create-entity.dto';
import { EntitiesSearchOptions } from './dto/entity-search-options.dto';
import { UpdateEntitiesDto } from './dto/update-entites.dto';
import { UpdateIsFeaturesDto } from '../stock-item-data/dto/update-is-features.dto';
import { EntitiesService } from './entity.service';

@Controller('entities')
@ApiTags('entities')
export class EntitiesController {
  constructor(
    private readonly entitiesService: EntitiesService,
  ) { }
  

  @Post('me/create')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  @ApiBody({ type: CreateEntitiesDto })
  @ApiOperation({ summary: 'create entity' })
  async create(@Body() dto: CreateEntitiesDto, @Req() req: RequestWithUser) {
    return await this.entitiesService.createEntities(req, dto);
  }

  @Get('me/findOne/:id')
  @ApiOperation({ summary: 'find entity by id' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS_PROFILE_CUSTOMER)
  async me(@Req() req: RequestWithUser, @Param('id') id: string) {
    return await this.entitiesService.findOneAndErr({
      _id: this.entitiesService.toObjectId(id),
    });
  }

  @Patch('me/update/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  @ApiBody({ type: UpdateEntitiesDto })
  @ApiOperation({ summary: 'update entity' })
  async update(@Param('id') id : string, @Body() dto: UpdateEntitiesDto, @Req() req: RequestWithUser) {
    return await this.entitiesService.updateEntities(req, id, dto);
  }

  @Post('me/search')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'find all entities' })
  async search(@Body() options: EntitiesSearchOptions) : Promise<Pagination>{
    return await this.entitiesService.findAll(options);
  }

  @Post('customer/search')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(RolesEnum.CUSTOMER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'find all entities - customer' })
  async searchEntities(@Body() options: EntitiesSearchOptions) : Promise<Pagination>{
    return await this.entitiesService.findAll(options);
  }

  @Get('customer/findOne/:id')
  @ApiOperation({ summary: 'find entity by id - customer' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(RolesEnum.CUSTOMER)
  async findEntity(@Req() req: RequestWithUser, @Param('id') id: string) {
    return await this.entitiesService.findOneAndErr({
      _id: this.entitiesService.toObjectId(id),
    });
  }
  

}
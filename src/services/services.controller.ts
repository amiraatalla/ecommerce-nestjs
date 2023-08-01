import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, RoleGuard } from '../auth/guards';
import { RequestWithUser } from '../core/interfaces';
import { SearchOptions, Pagination } from '../core/shared';
import { RoleGroups, RolesEnum } from 'src/users/enums/roles.enum';
import { Roles } from 'src/auth/decorators/role.decorator';
import { ServicesService } from './services.service';
import { CreateServicesDto } from './dto/create-services.dto';
import { Services } from './entities/services.entity';
import { UpdateServicesDto } from './dto/update-services.dto';
import { type } from 'os';

@Controller('services')
@ApiTags('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}
  @Post('me/create')
  @ApiOperation({ summary: 'Create a service in restaurant' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  create(@Req() req: RequestWithUser, @Body() dto: CreateServicesDto): Promise<Services> {
    return this.servicesService.create({
      entityId: req.user.entityId,
      ...dto,
    });
  }

  @Post('search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Search services' })
  findAll(@Body() options: SearchOptions): Promise<Pagination> {
    return this.servicesService.findAll(options);
  }
  @Post('me/search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Search services for restaurant owner' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  findAllForMe(@Req() req: RequestWithUser, @Body() options: SearchOptions): Promise<Pagination> {
    return this.servicesService.findAll(options, req.user.entityId);
  }
  @Get('findone/:id')
  @ApiOperation({ summary: 'Find one service by id' })
  findOne(@Param('id') id: string): Promise<Services> {
    return this.servicesService.findOneById(id);
  }
  @Patch('me/update/:id')
  @ApiOperation({ summary: 'Update one service by id' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  update(@Param('id') id: string, @Body() dto: UpdateServicesDto): Promise<Services> {
    return this.servicesService.update(id, dto);
  }
  @Delete('me/delete/:id')
  @ApiOperation({ summary: 'Delete one service by id' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  remove(@Param('id') id: string): Promise<boolean> {
    return this.servicesService.remove(id);
  }
}
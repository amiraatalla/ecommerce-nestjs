import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { FireBaseService } from 'src/firebase/firebase.service';
import { ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { SearchOptions } from 'src/core/shared';
import { JwtAuthGuard, RoleGuard } from 'src/auth/guards';
import { Roles } from 'src/auth/decorators/role.decorator';
import { RolesEnum } from 'src/users/enums/roles.enum';

@Controller('notification')
@ApiTags('notification')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly fireBaseService: FireBaseService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(RolesEnum.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create notification' })
  @ApiProperty({type:CreateNotificationDto})
  async create(@Body() dto: CreateNotificationDto) {
    return this.notificationService.createNotification(dto);
  }

  @Post('search')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Search and filter notifications' })
  findAll(@Body() options: SearchOptions) {
    return this.notificationService.findAll(options);
  }

  @Post('search/:userId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(RolesEnum.SUPER_ADMIN)
  @ApiOperation({ summary: 'Search user notifications' })
  findAllUserNotification(
    @Param('userId') userId: string,
    @Body() options: SearchOptions,
  ) {
    return this.notificationService.findAll(options, userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(RolesEnum.SUPER_ADMIN)
  @ApiOperation({ summary: 'Find one notification by id' })
  findOne(@Param('id') id: string) {
    return this.notificationService.findOneById(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(RolesEnum.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete one notification by id' })
  remove(@Param('id') id: string) {
    return this.notificationService.remove(id);
  }
}

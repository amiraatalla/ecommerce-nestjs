import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpCode,
  UseGuards,
  HttpStatus,
  Request,
  Res,
} from '@nestjs/common';
import { SYSLogService } from './sysLog.service';
import { Pagination, SearchOptions } from 'src/core/shared';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, RoleGuard } from 'src/auth/guards';
import { RequestWithUser } from 'src/core/interfaces';
import { ActionsEnum } from './enums/actions.enums';
import { RolesEnum } from '../users/enums/roles.enum';
import { Response } from 'express';
import { LogsCSVDto } from './dto/get-logs-csv.dto';
import { Roles } from 'src/auth/decorators/role.decorator';

@Controller('sys-log')
@ApiTags('sys-log')
export class SYSLogsController {
  constructor(private readonly SYSLogsService: SYSLogService) {}

  @Post('search')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(RolesEnum.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Search Logs' })
  findAll(@Request() req: RequestWithUser, @Body() options: SearchOptions): Promise<Pagination> {
    return this.SYSLogsService.findAll(options);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(RolesEnum.SUPER_ADMIN)
  @ApiOperation({ summary: 'Find one log by id' })
  findOne(@Request() req: RequestWithUser, @Param('id') id: string) {
    return this.SYSLogsService.findOneLogPopulated(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(RolesEnum.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete one log by id' })
  remove(@Request() req: RequestWithUser, @Param('id') id: string): Promise<boolean> {
    this.SYSLogsService.create({
      userId: req.user._id,
      action: ActionsEnum.DELETE_LOG,
    });
    return this.SYSLogsService.remove(id);
  }

  // @Post('/csv')
  // // @UseGuards(JwtAuthGuard, RoleGuard)
  // // @Roles(RolesEnum.SUPER_ADMIN)
  // @ApiOperation({ summary: 'get logs CSV by date range' })
  // LogsCSV(@Request() req: RequestWithUser, @Res() res: Response, @Body() dto: LogsCSVDto) {

  //   return this.SYSLogsService.GetLogsByDateRange(res, dto);
  // }

}

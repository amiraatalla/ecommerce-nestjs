import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/role.decorator';
import { JwtAuthGuard, RoleGuard } from 'src/auth/guards';
import { RequestWithUser } from 'src/auth/interfaces/user-request.interface';
import { Pagination } from 'src/core/shared';
import { RoleGroups, RolesEnum } from 'src/users/enums/roles.enum';
import { CreateRecievableDto } from './dto/create-recievable.dto';
import { RecievableSearchOptions } from './dto/recievable-search-options.dto';
import { RecievableService } from './recievable.service';

@Controller('recievable')
@ApiTags('recievable')
export class RecievableController {
  constructor(
    private readonly RecievableService: RecievableService,
  ) { }
  

  @Post('me/create')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS_CASHIER)
  @ApiBody({ type: CreateRecievableDto})
  @ApiOperation({ summary: 'Create a Recievable' })
  async create(@Body() dto: CreateRecievableDto,@Req() req: RequestWithUser) {
    return await this.RecievableService.createRecievable(req, dto);
  }

  @Get('me/findOne/:id')
  @ApiOperation({ summary: 'Find Recievable by id' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS_CASHIER)
  async me(@Req() req: RequestWithUser, @Param('id') id: string) {
    return await this.RecievableService.findOneAndErr({
      _id: this.RecievableService.toObjectId(id),
    });
  }


  @Post('me/search')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS_CASHIER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'find all Recievables' })
  async search(@Req() req,@Body() options: RecievableSearchOptions) : Promise<Pagination>{
    return await this.RecievableService.findAll(req.user._id,options);
  }

}
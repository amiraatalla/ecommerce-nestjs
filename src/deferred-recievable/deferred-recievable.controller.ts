import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/role.decorator';
import { JwtAuthGuard, RoleGuard } from 'src/auth/guards';
import { RequestWithUser } from 'src/auth/interfaces/user-request.interface';
import { Pagination } from 'src/core/shared';
import { RoleGroups, RolesEnum } from 'src/users/enums/roles.enum';
import { DeferredRecievableService } from './deferred-recievable.service';
import { DeferredRecievableSearchOptions } from './dto/deferred-recievable-search-options.dto';
import { UpdateDeferredRecievableDto } from './dto/update-deferred-recievable.dto';

@Controller('deferred-recievable')
@ApiTags('deferred-recievable')
export class DeferredRecievableController {
  constructor(
    private readonly deferredRecievableService: DeferredRecievableService,
  ) { }
  

  @Patch('me/update/:id')
  @ApiOperation({ summary: 'update Recievable and Deferred Recievable by id' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS_CASHIER)
  @ApiBody({type:UpdateDeferredRecievableDto})
  async updateDeferredRecievable(@Req() req: RequestWithUser, @Param('id') id: string, @Body()dto: UpdateDeferredRecievableDto) {
    return await this.deferredRecievableService.updateDeferredRecievable(req,id,dto);
  }

  @Get('me/findOne/:id')
  @ApiOperation({ summary: 'Find DeferredRecievable by id' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS_CASHIER)
  async me(@Req() req: RequestWithUser, @Param('id') id: string) {
    return await this.deferredRecievableService.findOneAndErr({
      _id: this.deferredRecievableService.toObjectId(id),
    });
  }


  @Post('me/search')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS_CASHIER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'find all DeferredRecievables' })
  async search(@Req()req,@Body() options: DeferredRecievableSearchOptions) : Promise<Pagination>{
    return await this.deferredRecievableService.findAll(req.user._id,options);
  }

}
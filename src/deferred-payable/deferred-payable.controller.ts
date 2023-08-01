import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/role.decorator';
import { JwtAuthGuard, RoleGuard } from 'src/auth/guards';
import { RequestWithUser } from 'src/auth/interfaces/user-request.interface';
import { Pagination } from 'src/core/shared';
import { RoleGroups, RolesEnum } from 'src/users/enums/roles.enum';
import { DeferredPayableService } from './deferred-payable.service';
import { DeferredPayableSearchOptions } from './dto/deferred-payable-search-options.dto';
import { UpdateDeferredPayableDto } from './dto/update-deferred-payable.dto';

@Controller('deferred-payable')
@ApiTags('deferred-payable')
export class DeferredPayableController {
  constructor(
    private readonly DeferredPayableService: DeferredPayableService,
  ) { }
  

  @Patch('me/update/:id')
  @ApiOperation({ summary: 'update Payable and Deferred Payable by id' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS_CASHIER)
  @ApiBody({type:UpdateDeferredPayableDto})
  async updateDeferredPayable(@Req() req: RequestWithUser, @Param('id') id: string, @Body()dto: UpdateDeferredPayableDto) {
    return await this.DeferredPayableService.updateDeferredPayable(req,id,dto);
  }

  @Get('me/findOne/:id')
  @ApiOperation({ summary: 'Find DeferredPayable by id' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS_CASHIER)
  async me(@Req() req: RequestWithUser, @Param('id') id: string) {
    return await this.DeferredPayableService.findOneAndErr({
      _id: this.DeferredPayableService.toObjectId(id),
    });
  }


  @Post('me/search')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS_CASHIER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'find all DeferredPayables' })
  async search(@Req()req,@Body() options: DeferredPayableSearchOptions) : Promise<Pagination>{
    return await this.DeferredPayableService.findAll(req.user._id,options,req);
  }

}
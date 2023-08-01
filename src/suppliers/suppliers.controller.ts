import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Req,
  UseGuards,
  Res,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/role.decorator';
import { JwtAuthGuard, RoleGuard } from 'src/auth/guards';
import { RequestWithUser } from 'src/core/interfaces';
import { SearchOptions, Pagination } from 'src/core/shared';
import { RoleGroups, RolesEnum } from 'src/users/enums/roles.enum';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { SuppliersService } from './suppliers.service';
import { Response } from 'express'
import { DownloadSupplierSearchOptions } from './dto/download-supplier-options.dto';
@Controller('suppliers')
@ApiTags('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post('me/create')
  @ApiOperation({ summary: 'Create a supplier' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  create(@Req() req: RequestWithUser, @Body() dto: CreateSupplierDto) {
    return this.suppliersService.createSupplier(dto);
  }

  @Post('search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Search supplier' })
  @UseGuards(JwtAuthGuard)
  findAll(@Req() req: RequestWithUser, @Body() options: SearchOptions) {
    return this.suppliersService.findAll(options);
  }

  @Post('export-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'download all suppliers' })
  @UseGuards(JwtAuthGuard)
  downloadAll(@Res()res:Response,@Req() req: RequestWithUser, @Body() options: DownloadSupplierSearchOptions) {
    return this.suppliersService.downloadAll(res,options);
  }

  @Get('findone/:id')
  @ApiOperation({ summary: 'Find supplier by id' })
  @UseGuards(JwtAuthGuard)
  async me(@Req() req: RequestWithUser, @Param('id') id: string) {
    return await this.suppliersService.findOneAndErr({
      _id: this.suppliersService.toObjectId(id),
    });
  }

  @Patch('me/update/:id')
  @ApiOperation({ summary: 'Update supplier by id' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(...RoleGroups.BUSSINESS)
  updateMe(@Req() req: RequestWithUser, @Param('id') id: string, @Body() dto: UpdateSupplierDto) {
    return this.suppliersService.updateOne(
      {
        _id: this.suppliersService.toObjectId(id),
      },
      dto,
    );
  }
}

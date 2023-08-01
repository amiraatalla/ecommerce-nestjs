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
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/role.decorator';
import { JwtAuthGuard, RoleGuard } from 'src/auth/guards';
import { RequestWithUser } from 'src/core/interfaces';
import { SearchOptions, Pagination } from 'src/core/shared';
import { RoleGroups, RolesEnum } from 'src/users/enums/roles.enum';
import { CreateStockCategoryDto } from './dto/create-stock-category';
import { UpdateStockCategoryDto } from './dto/update-stock-category';
import { StockCategoryService } from './stock-category.service';

@Controller('stock-category')
@ApiTags('stock-category')
export class StockCategoryController {
  constructor(private readonly stockCategoryService: StockCategoryService) {}

  @Post('me')
  @ApiOperation({ summary: 'Create a stock category' })
  @UseGuards(JwtAuthGuard)
  @Roles(RolesEnum.RESTURANT)
  create(@Req() req: RequestWithUser, @Body() dto: CreateStockCategoryDto) {
    return this.stockCategoryService.createStockategory(req, dto);
  }
  @Post('search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Search stock category' })
  @UseGuards(JwtAuthGuard)
  findAll(@Req() req: RequestWithUser, @Body() options: SearchOptions): Promise<Pagination> {
    return this.stockCategoryService.findAll(options);
  }
  @Post('me/search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Search stock category for one resturant' })
  @UseGuards(JwtAuthGuard)
  @Roles(RolesEnum.RESTURANT)
  findAllForMe(@Req() req: RequestWithUser, @Body() options: SearchOptions): Promise<Pagination> {
    return this.stockCategoryService.findAll(options, req.user.entityId);
  }

  // @Post('me/search/:entityId')
  // @HttpCode(HttpStatus.OK)
  // @ApiOperation({ summary: 'Search items' })
  // @UseGuards(JwtAuthGuard)
  // @Roles(...RoleGroups.BUSSINESS_CASHIER_CUSTOMER)
  // findAllById(@Param('entityId') entityId: string,@Req() req: RequestWithUser, @Body() options: SearchOptions): Promise<Pagination> {
  //   return this.stockCategoryService.findAllById(
  //     this.stockCategoryService.toObjectId(entityId),
  //     req,
  //     options
  //           );
  // }

  @Get('me/:id')
  @ApiOperation({ summary: 'Find stock category by id' })
  @UseGuards(JwtAuthGuard)
  async me(@Req() req: RequestWithUser, @Param('id') id: string) {
    return await this.stockCategoryService.findOneAndErr({
      _id: this.stockCategoryService.toObjectId(id),
      entityId: req.user.entityId,
    });
  }

  @Patch('me/:id')
  @ApiOperation({ summary: 'Update stock category by id' })
  @UseGuards(JwtAuthGuard)
  updateMe(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: UpdateStockCategoryDto,
  ) {
    return this.stockCategoryService.updateOne(
      {
        _id: this.stockCategoryService.toObjectId(id),
        entityId: req.user.entityId,
      },
      dto,
    );
  }

  @Delete('me/:id')
  @ApiOperation({ summary: 'Delete stock category by id' })
  @UseGuards(JwtAuthGuard)
  @Roles(RolesEnum.RESTURANT)
  removeMe(@Req() req: RequestWithUser, @Param('id') id: string): Promise<boolean> {
    return this.stockCategoryService.removeOne({
      _id: this.stockCategoryService.toObjectId(id),
      entityId: req.user.entityId,
    });
  }
}

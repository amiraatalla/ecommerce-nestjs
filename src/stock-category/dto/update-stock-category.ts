import { PartialType } from '@nestjs/swagger';
import { CreateStockCategoryDto } from './create-stock-category';

export class UpdateStockCategoryDto extends PartialType(CreateStockCategoryDto) {}

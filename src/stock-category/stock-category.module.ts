import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StockCategory, StockCategorySchema } from './entities/stock-category.entity';
import { StockCategoryController } from './stock-category.controller';
import { StockCategoryService } from './stock-category.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: StockCategory.name, schema: StockCategorySchema }]),
  ],
  controllers: [StockCategoryController],
  providers: [StockCategoryService],
  exports: [StockCategoryService],
})
export class StockCategoryModule {}

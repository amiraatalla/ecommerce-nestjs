import { Test, TestingModule } from '@nestjs/testing';
import { StockCategoryController } from './stock-category.controller';

describe('StockCategoryController', () => {
  let controller: StockCategoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StockCategoryController],
    }).compile();

    controller = module.get<StockCategoryController>(StockCategoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { StockItemDataController } from './stock-item-data.controller';

describe('StockItemDataController', () => {
  let controller: StockItemDataController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StockItemDataController],
    }).compile();

    controller = module.get<StockItemDataController>(StockItemDataController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

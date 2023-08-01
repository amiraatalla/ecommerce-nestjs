import { Test, TestingModule } from '@nestjs/testing';
import { StockItemDataService } from './stock-item-data.service';

describe('StockItemDataService', () => {
  let service: StockItemDataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StockItemDataService],
    }).compile();

    service = module.get<StockItemDataService>(StockItemDataService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

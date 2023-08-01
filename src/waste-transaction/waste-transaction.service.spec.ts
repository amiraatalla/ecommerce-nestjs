import { Test, TestingModule } from '@nestjs/testing';
import { WasteTransactionService } from './waste-transaction.service';

describe('WasteTransactionService', () => {
  let service: WasteTransactionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WasteTransactionService],
    }).compile();

    service = module.get<WasteTransactionService>(WasteTransactionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { ShrinkageTransactionService } from './shrinkage-transaction.service';

describe('ShrinkageTransactionService', () => {
  let service: ShrinkageTransactionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShrinkageTransactionService],
    }).compile();

    service = module.get<ShrinkageTransactionService>(ShrinkageTransactionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

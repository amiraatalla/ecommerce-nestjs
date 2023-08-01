import { Test, TestingModule } from '@nestjs/testing';
import { ReverseTransactionService } from './reverse-transaction.service';

describe('ReverseTransactionService', () => {
  let service: ReverseTransactionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReverseTransactionService],
    }).compile();

    service = module.get<ReverseTransactionService>(ReverseTransactionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

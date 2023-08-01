import { Test, TestingModule } from '@nestjs/testing';
import { RefundTransactionService } from './refund-transaction.service';

describe('RefundTransactionService', () => {
  let service: RefundTransactionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RefundTransactionService],
    }).compile();

    service = module.get<RefundTransactionService>(RefundTransactionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

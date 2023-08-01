import { Test, TestingModule } from '@nestjs/testing';
import { AddTransactionsService } from './add-transactions.service';

describe('AddTranactionsService', () => {
  let service: AddTransactionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AddTransactionsService],
    }).compile();

    service = module.get<AddTransactionsService>(AddTransactionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

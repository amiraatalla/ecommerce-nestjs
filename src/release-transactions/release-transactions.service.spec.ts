import { Test, TestingModule } from '@nestjs/testing';
import { ReleaseTransactionsService } from './release-transactions.service';

describe('ReleaseTransactionsService', () => {
  let service: ReleaseTransactionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReleaseTransactionsService],
    }).compile();

    service = module.get<ReleaseTransactionsService>(ReleaseTransactionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

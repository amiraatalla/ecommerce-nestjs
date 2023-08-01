import { Test, TestingModule } from '@nestjs/testing';
import { AuditTransactionsService } from './audit-transactions.service';

describe('AuditTransactionsService', () => {
  let service: AuditTransactionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuditTransactionsService],
    }).compile();

    service = module.get<AuditTransactionsService>(AuditTransactionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

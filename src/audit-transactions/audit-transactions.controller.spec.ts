import { Test, TestingModule } from '@nestjs/testing';
import { AuditTransactionsController } from './audit-transactions.controller';

describe('AuditTransactionsController', () => {
  let controller: AuditTransactionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuditTransactionsController],
    }).compile();

    controller = module.get<AuditTransactionsController>(AuditTransactionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

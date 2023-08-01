import { Test, TestingModule } from '@nestjs/testing';
import { RefundTransactionController } from './refund-transaction.controller';

describe('RefundTransactionController', () => {
  let controller: RefundTransactionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RefundTransactionController],
    }).compile();

    controller = module.get<RefundTransactionController>(RefundTransactionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

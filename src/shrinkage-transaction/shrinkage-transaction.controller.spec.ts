import { Test, TestingModule } from '@nestjs/testing';
import { ShrinkageTransactionController } from './shrinkage-transaction.controller';

describe('ShrinkageTransactionController', () => {
  let controller: ShrinkageTransactionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShrinkageTransactionController],
    }).compile();

    controller = module.get<ShrinkageTransactionController>(ShrinkageTransactionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

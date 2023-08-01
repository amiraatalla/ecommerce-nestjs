import { Test, TestingModule } from '@nestjs/testing';
import { ReverseTransactionController } from './reverse-transaction.controller';

describe('ReverseTransactionController', () => {
  let controller: ReverseTransactionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReverseTransactionController],
    }).compile();

    controller = module.get<ReverseTransactionController>(ReverseTransactionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

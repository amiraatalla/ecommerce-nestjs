import { Test, TestingModule } from '@nestjs/testing';
import { AddTransactionsController } from './add-transactions.controller';

describe('AddTranactionsController', () => {
  let controller: AddTransactionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AddTransactionsController],
    }).compile();

    controller = module.get<AddTransactionsController>(AddTransactionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

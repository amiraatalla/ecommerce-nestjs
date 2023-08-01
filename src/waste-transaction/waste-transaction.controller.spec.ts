import { Test, TestingModule } from '@nestjs/testing';
import { WasteTransactionController } from './waste-transaction.controller';

describe('WasteTransactionController', () => {
  let controller: WasteTransactionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WasteTransactionController],
    }).compile();

    controller = module.get<WasteTransactionController>(WasteTransactionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

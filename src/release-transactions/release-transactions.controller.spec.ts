import { Test, TestingModule } from '@nestjs/testing';
import { ReleaseTransactionsController } from './release-transactions.controller';

describe('ReleaseTransactionsController', () => {
  let controller: ReleaseTransactionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReleaseTransactionsController],
    }).compile();

    controller = module.get<ReleaseTransactionsController>(ReleaseTransactionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

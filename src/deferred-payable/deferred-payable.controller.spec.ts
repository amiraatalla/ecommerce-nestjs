import { Test, TestingModule } from '@nestjs/testing';
import { DeferredPayableController } from './deferred-payable.controller';

describe('DeferredPayableController', () => {
  let controller: DeferredPayableController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeferredPayableController],
    }).compile();

    controller = module.get<DeferredPayableController>(DeferredPayableController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { DeferredRecievableController } from './deferred-recievable.controller';

describe('DeferredRecievableController', () => {
  let controller: DeferredRecievableController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeferredRecievableController],
    }).compile();

    controller = module.get<DeferredRecievableController>(DeferredRecievableController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

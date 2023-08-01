import { Test, TestingModule } from '@nestjs/testing';
import { RecievableController } from './recievable.controller';

describe('RecievableController', () => {
  let controller: RecievableController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecievableController],
    }).compile();

    controller = module.get<RecievableController>(RecievableController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { DeferredRecievableService } from './deferred-recievable.service';

describe('DeferredRecievableService', () => {
  let service: DeferredRecievableService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DeferredRecievableService],
    }).compile();

    service = module.get<DeferredRecievableService>(DeferredRecievableService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { DeferredPayableService } from './deferred-payable.service';

describe('DeferredPayableService', () => {
  let service: DeferredPayableService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DeferredPayableService],
    }).compile();

    service = module.get<DeferredPayableService>(DeferredPayableService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

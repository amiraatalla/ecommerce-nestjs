import { Test, TestingModule } from '@nestjs/testing';
import { RecievableService } from './recievable.service';

describe('RecievableService', () => {
  let service: RecievableService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RecievableService],
    }).compile();

    service = module.get<RecievableService>(RecievableService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

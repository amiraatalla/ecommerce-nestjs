import { Test, TestingModule } from '@nestjs/testing';
import { WarehouseManagementService } from './warehouse-management.service';

describe('WarehouseManagementService', () => {
  let service: WarehouseManagementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WarehouseManagementService],
    }).compile();

    service = module.get<WarehouseManagementService>(WarehouseManagementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

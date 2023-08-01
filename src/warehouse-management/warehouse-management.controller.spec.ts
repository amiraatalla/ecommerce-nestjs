import { Test, TestingModule } from '@nestjs/testing';
import { WarehouseManagementController } from './warehouse-management.controller';

describe('WarehouseManagementController', () => {
  let controller: WarehouseManagementController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WarehouseManagementController],
    }).compile();

    controller = module.get<WarehouseManagementController>(WarehouseManagementController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

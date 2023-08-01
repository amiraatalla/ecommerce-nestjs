import { Test, TestingModule } from '@nestjs/testing';
import { SYSLogsController } from './sysLog.controller';

describe('SYSLogController', () => {
  let controller: SYSLogsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SYSLogsController],
    }).compile();

    controller = module.get<SYSLogsController>(SYSLogsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

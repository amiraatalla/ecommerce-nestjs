import { HealthCheckService, MongooseHealthIndicator } from '@nestjs/terminus';
import { Test, TestingModule } from '@nestjs/testing';
import { HealthcheckController } from './healthcheck.controller';

jest.mock('@nestjs/terminus');

describe('HealthcheckController', () => {
  let controller: HealthcheckController;
  let health: HealthCheckService;
  let db: MongooseHealthIndicator;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthcheckController],
      providers: [HealthCheckService, MongooseHealthIndicator],
    }).compile();

    controller = module.get<HealthcheckController>(HealthcheckController);
    health = module.get<HealthCheckService>(HealthCheckService);
    db = module.get<MongooseHealthIndicator>(MongooseHealthIndicator);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /healthcheck', () => {
    it('should check the database', async () => {
      jest.spyOn(health, 'check').mockImplementation((checks) => {
        checks.forEach((fn) => fn());
        return null;
      });
      const dbListener = jest.spyOn(db, 'pingCheck').mockImplementation();
      await controller.check();

      expect(dbListener).toHaveBeenCalled();
    });
  });
});

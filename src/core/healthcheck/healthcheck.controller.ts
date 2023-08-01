import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthCheckService, MongooseHealthIndicator } from '@nestjs/terminus';

@Controller('healthcheck')
@ApiTags('healthcheck')
export class HealthcheckController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: MongooseHealthIndicator,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Check the health of the application.' })
  check() {
    return this.health.check([() => this.db.pingCheck('database')]);
  }
}

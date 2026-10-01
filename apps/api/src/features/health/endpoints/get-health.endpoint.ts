import { Controller, Get } from '@nestjs/common';
import type { HealthResponse } from '@shoppy/shared';
import { HealthService } from '../health.service.js';

// Answers 200 even when the database is down, so Cloud Run keeps the instance alive.
@Controller('health')
export class GetHealthEndpoint {
  constructor(private readonly health: HealthService) {}

  @Get()
  handle(): Promise<HealthResponse> {
    return this.health.check();
  }
}

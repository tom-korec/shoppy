import { Module } from '@nestjs/common';
import { GetHealthEndpoint } from './endpoints/get-health.endpoint.js';
import { HealthService } from './health.service.js';

@Module({
  controllers: [GetHealthEndpoint],
  providers: [HealthService],
})
export class HealthModule {}

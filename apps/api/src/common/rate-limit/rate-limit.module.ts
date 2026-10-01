import { Global, Module } from '@nestjs/common';
import { RateLimiter } from './rate-limiter.js';
import { UserWriteBudget } from './user-write-budget.service.js';

@Global()
@Module({
  providers: [RateLimiter, UserWriteBudget],
  exports: [RateLimiter, UserWriteBudget],
})
export class RateLimitModule {}

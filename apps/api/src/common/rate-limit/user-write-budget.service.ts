import { Injectable } from '@nestjs/common';
import type { AuthUser } from '../auth/auth-user.js';
import { RateLimiter, type RateLimitRule } from './rate-limiter.js';

// Rows a user may add per day (entries, history records, items, lists, categories). Far above
// real shopping, but it stops one account from filling the free-tier database (D-55).
export const USER_WRITE_BUDGET: RateLimitRule = { limit: 3000, windowMs: 24 * 60 * 60 * 1000 };

@Injectable()
export class UserWriteBudget {
  constructor(private readonly rateLimiter: RateLimiter) {}

  spend(user: AuthUser, rows: number): void {
    this.rateLimiter.consumeMany(`writes:user:${user.id}`, USER_WRITE_BUDGET, rows);
  }
}

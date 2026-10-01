import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

export interface RateLimitRule {
  limit: number;
  windowMs: number;
}

interface Bucket {
  count: number;
  resetAt: number;
}

const MAX_BUCKETS = 50_000;
const SWEEP_INTERVAL_MS = 60_000;

// In-memory and per instance: good enough with at most two Cloud Run instances (D-37).
@Injectable()
export class RateLimiter {
  private readonly buckets = new Map<string, Bucket>();
  private lastSweepAt = 0;

  consume(key: string, rule: RateLimitRule, now = Date.now()): void {
    this.consumeMany(key, rule, 1, now);
  }

  // Spends several units at once, e.g. one per row a bulk request writes.
  consumeMany(key: string, rule: RateLimitRule, cost: number, now = Date.now()): void {
    this.keepBounded(now);

    let bucket = this.buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + rule.windowMs };
      this.buckets.set(key, bucket);
    }

    bucket.count += cost;
    if (bucket.count > rule.limit) {
      throw new HttpException('Too many attempts. Try again later.', HttpStatus.TOO_MANY_REQUESTS);
    }
  }

  private keepBounded(now: number): void {
    if (now - this.lastSweepAt >= SWEEP_INTERVAL_MS) {
      this.lastSweepAt = now;
      for (const [key, bucket] of this.buckets) {
        if (bucket.resetAt <= now) this.buckets.delete(key);
      }
    }

    // A flood of distinct keys must not grow memory without limit; the oldest buckets go first.
    for (const key of this.buckets.keys()) {
      if (this.buckets.size < MAX_BUCKETS) break;
      this.buckets.delete(key);
    }
  }
}

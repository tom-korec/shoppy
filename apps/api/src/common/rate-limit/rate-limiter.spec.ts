import { HttpStatus } from '@nestjs/common';
import { RateLimiter } from './rate-limiter.js';

const RULE = { limit: 2, windowMs: 1000 };

describe('RateLimiter', () => {
  it('allows requests up to the limit', () => {
    const limiter = new RateLimiter();

    limiter.consume('ip:1', RULE, 0);

    expect(() => limiter.consume('ip:1', RULE, 10)).not.toThrow();
  });

  it('rejects the request over the limit with 429', () => {
    const limiter = new RateLimiter();
    limiter.consume('ip:1', RULE, 0);
    limiter.consume('ip:1', RULE, 10);

    expect(() => limiter.consume('ip:1', RULE, 20)).toThrow(
      expect.objectContaining({ status: HttpStatus.TOO_MANY_REQUESTS }),
    );
  });

  it('starts a new window once the old one ends', () => {
    const limiter = new RateLimiter();
    limiter.consume('ip:1', RULE, 0);
    limiter.consume('ip:1', RULE, 10);

    expect(() => limiter.consume('ip:1', RULE, 1000)).not.toThrow();
  });

  it('counts keys separately', () => {
    const limiter = new RateLimiter();
    limiter.consume('ip:1', RULE, 0);
    limiter.consume('ip:1', RULE, 10);

    expect(() => limiter.consume('ip:2', RULE, 20)).not.toThrow();
  });
});

describe('RateLimiter memory bound', () => {
  it('evicts the oldest buckets once full', () => {
    const limiter = new RateLimiter();
    const rule = { limit: 1, windowMs: 60 * 60 * 1000 };
    limiter.consume('first', rule, 0);
    for (let index = 0; index < 50_000; index += 1) limiter.consume(`key-${index}`, rule, 1);

    expect(() => limiter.consume('first', rule, 2)).not.toThrow();
  });
});

import { RateLimiter } from './rate-limiter.js';
import { USER_WRITE_BUDGET, UserWriteBudget } from './user-write-budget.service.js';

const user = { id: 'user-1', sessionId: 'session-1', isEmailVerified: true };

describe('UserWriteBudget', () => {
  it('allows rows up to the daily budget', () => {
    const budget = new UserWriteBudget(new RateLimiter());

    expect(() => budget.spend(user, USER_WRITE_BUDGET.limit)).not.toThrow();
  });

  it('rejects rows over the daily budget', () => {
    const budget = new UserWriteBudget(new RateLimiter());
    budget.spend(user, USER_WRITE_BUDGET.limit);

    expect(() => budget.spend(user, 1)).toThrow('Too many attempts');
  });

  it('keeps a separate budget per user', () => {
    const budget = new UserWriteBudget(new RateLimiter());
    budget.spend(user, USER_WRITE_BUDGET.limit);

    expect(() => budget.spend({ ...user, id: 'user-2' }, 1)).not.toThrow();
  });
});

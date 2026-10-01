import type { RateLimitRule } from '../../common/rate-limit/rate-limiter.js';

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

export const AUTH_RATE_LIMITS = {
  loginPerIp: { limit: 30, windowMs: 15 * MINUTE },
  loginPerEmail: { limit: 10, windowMs: 15 * MINUTE },
  registerPerIp: { limit: 10, windowMs: HOUR },
  googlePerIp: { limit: 30, windowMs: 15 * MINUTE },
  emailLinkPerIp: { limit: 10, windowMs: HOUR },
  emailLinkPerAddress: { limit: 3, windowMs: HOUR },
  tokenRedeemPerIp: { limit: 20, windowMs: 15 * MINUTE },
} satisfies Record<string, RateLimitRule>;

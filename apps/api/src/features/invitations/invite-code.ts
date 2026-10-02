import { INVITE_CODE_ALPHABET, INVITE_CODE_LENGTH } from '@shoppy/shared';
import { createHash, randomInt } from 'node:crypto';

// 32^8 ≈ 10^12 codes; guessing is limited by the redemption rate limit and the 7-day expiry.
export function generateInviteCode(): string {
  return Array.from(
    { length: INVITE_CODE_LENGTH },
    () => INVITE_CODE_ALPHABET[randomInt(INVITE_CODE_ALPHABET.length)],
  ).join('');
}

// Expects the normalized code (inviteCodeSchema: no spaces or dashes, upper case).
export function hashInviteCode(code: string): string {
  return createHash('sha256').update(`invite-code:${code}`).digest('base64url');
}

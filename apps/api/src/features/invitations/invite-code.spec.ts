import { INVITE_CODE_LENGTH, inviteCodeSchema } from '@shoppy/shared';
import { generateInviteCode, hashInviteCode } from './invite-code.js';

describe('invite codes', () => {
  it('generates codes the schema accepts', () => {
    const code = generateInviteCode();

    expect(code).toHaveLength(INVITE_CODE_LENGTH);
    expect(inviteCodeSchema.parse(code)).toBe(code);
  });

  it('hashes a typed code the same way after normalizing', () => {
    const code = generateInviteCode();
    const typed = `${code.slice(0, 4).toLowerCase()}-${code.slice(4)}`;

    expect(hashInviteCode(inviteCodeSchema.parse(typed))).toBe(hashInviteCode(code));
  });
});

import { hashPassword, verifyPassword } from './password-hash.js';

describe('password hashing', () => {
  it('encodes the hash as an Argon2id PHC string', async () => {
    const hash = await hashPassword('Secret123');

    expect(hash).toMatch(/^\$argon2id\$v=19\$m=19456,t=2,p=1\$/);
  });

  it('verifies the original password', async () => {
    const hash = await hashPassword('Secret123');

    expect(await verifyPassword('Secret123', hash)).toBe(true);
  });

  it('rejects a different password', async () => {
    const hash = await hashPassword('Secret123');

    expect(await verifyPassword('Secret124', hash)).toBe(false);
  });

  it('rejects a malformed hash', async () => {
    expect(await verifyPassword('Secret123', 'not-a-hash')).toBe(false);
  });
});

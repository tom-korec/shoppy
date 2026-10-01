import { emailSchema, passwordSchema } from './account-fields.js';

describe('passwordSchema', () => {
  it('accepts 8+ characters with lowercase, uppercase and a digit', () => {
    expect(passwordSchema.safeParse('Secret12').success).toBe(true);
  });

  it.each([
    ['too short', 'Secre12'],
    ['no uppercase', 'secret123'],
    ['no lowercase', 'SECRET123'],
    ['no digit', 'SecretPass'],
  ])('rejects a password with %s', (_reason, password) => {
    expect(passwordSchema.safeParse(password).success).toBe(false);
  });
});

describe('emailSchema', () => {
  it('trims and lowercases the address', () => {
    expect(emailSchema.parse('  Anna@Example.COM ')).toBe('anna@example.com');
  });

  it('rejects an invalid address', () => {
    expect(emailSchema.safeParse('anna@').success).toBe(false);
  });
});

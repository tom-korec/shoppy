import { formatRefreshToken, parseRefreshToken } from './refresh-token.js';

const SESSION_ID = '0199a1b2-c3d4-7e5f-8a9b-0c1d2e3f4a5b';
const KEY = 'k'.repeat(32);

describe('refresh token format', () => {
  it('round-trips the session id and secret', () => {
    const token = { sessionId: SESSION_ID, secret: 'abc_DEF-123' };

    expect(parseRefreshToken(formatRefreshToken(token, KEY), KEY)).toEqual(token);
  });

  it('rejects a token signed with another key', () => {
    const raw = formatRefreshToken({ sessionId: SESSION_ID, secret: 'abc' }, 'other'.repeat(8));

    expect(parseRefreshToken(raw, KEY)).toBeUndefined();
  });

  it('rejects a forged secret for a known session id', () => {
    const raw = formatRefreshToken({ sessionId: SESSION_ID, secret: 'abc' }, KEY);
    const [, , signature] = raw.split('.');

    expect(parseRefreshToken(`${SESSION_ID}.forged.${signature}`, KEY)).toBeUndefined();
  });

  it.each(['', 'no-dot', `${SESSION_ID}.secret`, `not-a-uuid.secret.sig`, `${SESSION_ID}.a.b.c`])(
    'rejects %j',
    (raw) => {
      expect(parseRefreshToken(raw, KEY)).toBeUndefined();
    },
  );
});

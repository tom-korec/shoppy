import { HttpStatus } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { type CryptoKey, generateKeyPair, SignJWT } from 'jose';
import type { Env } from '../../config/env.js';
import { GoogleIdTokenVerifier } from './google-id-token-verifier.service.js';

const CLIENT_ID = 'shoppy.apps.googleusercontent.com';

describe('GoogleIdTokenVerifier', () => {
  let privateKey: CryptoKey;
  let verifier: GoogleIdTokenVerifier;

  beforeAll(async () => {
    const keys = await generateKeyPair('RS256');
    privateKey = keys.privateKey;
    const config = { get: () => CLIENT_ID } as unknown as ConfigService<Env, true>;
    verifier = new GoogleIdTokenVerifier(() => Promise.resolve(keys.publicKey), config);
  });

  function googleToken(
    claims: Record<string, unknown>,
    options: { audience?: string; issuer?: string; expiresIn?: string } = {},
  ) {
    return new SignJWT({ email: 'Anna@Example.com', email_verified: true, name: 'Anna', ...claims })
      .setProtectedHeader({ alg: 'RS256' })
      .setSubject('google-user-1')
      .setIssuer(options.issuer ?? 'https://accounts.google.com')
      .setAudience(options.audience ?? CLIENT_ID)
      .setIssuedAt()
      .setExpirationTime(options.expiresIn ?? '5m')
      .sign(privateKey);
  }

  it('returns the profile from a valid token', async () => {
    const profile = await verifier.verify(await googleToken({}));

    expect(profile).toEqual({
      googleUserId: 'google-user-1',
      email: 'anna@example.com',
      isEmailVerified: true,
      name: 'Anna',
    });
  });

  it.each([
    ['another client', { audience: 'other.apps.googleusercontent.com' }],
    ['another issuer', { issuer: 'https://evil.example' }],
    ['an expired token', { expiresIn: '-1m' }],
  ])('rejects a token for %s', async (_case, options) => {
    await expect(verifier.verify(await googleToken({}, options))).rejects.toMatchObject({
      status: HttpStatus.UNAUTHORIZED,
    });
  });

  it('rejects a token without an email claim', async () => {
    await expect(verifier.verify(await googleToken({ email: undefined }))).rejects.toMatchObject({
      status: HttpStatus.UNAUTHORIZED,
    });
  });

  it('rejects garbage', async () => {
    await expect(verifier.verify('not-a-jwt')).rejects.toMatchObject({
      status: HttpStatus.UNAUTHORIZED,
    });
  });
});

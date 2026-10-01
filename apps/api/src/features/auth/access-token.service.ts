import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { jwtVerify, SignJWT } from 'jose';
import type { Env } from '../../config/env.js';

export interface AccessTokenClaims {
  userId: string;
  sessionId: string;
}

const ISSUER = 'shoppy';
const LIFETIME = '15m';

@Injectable()
export class AccessTokenService {
  private readonly key: Uint8Array;

  constructor(config: ConfigService<Env, true>) {
    this.key = new TextEncoder().encode(config.get('JWT_SECRET', { infer: true }));
  }

  sign({ userId, sessionId }: AccessTokenClaims): Promise<string> {
    return new SignJWT({ sid: sessionId })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(userId)
      .setIssuer(ISSUER)
      .setAudience(ISSUER)
      .setIssuedAt()
      .setExpirationTime(LIFETIME)
      .sign(this.key);
  }

  async verify(token: string): Promise<AccessTokenClaims> {
    const { payload } = await jwtVerify(token, this.key, {
      algorithms: ['HS256'],
      issuer: ISSUER,
      audience: ISSUER,
    });
    if (typeof payload.sub !== 'string' || typeof payload['sid'] !== 'string') {
      throw new Error('Access token is missing claims');
    }
    return { userId: payload.sub, sessionId: payload['sid'] };
  }
}

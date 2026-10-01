import {
  Inject,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { type JWTVerifyGetKey, jwtVerify } from 'jose';
import { z } from 'zod';
import type { Env } from '../../config/env.js';

export interface GoogleProfile {
  googleUserId: string;
  email: string;
  isEmailVerified: boolean;
  name: string | undefined;
}

export const GOOGLE_SIGNING_KEYS = Symbol('GOOGLE_SIGNING_KEYS');
export const GOOGLE_JWKS_URL = new URL('https://www.googleapis.com/oauth2/v3/certs');
const GOOGLE_ISSUERS = ['https://accounts.google.com', 'accounts.google.com'];

const googleClaimsSchema = z.object({
  sub: z.string().min(1),
  email: z.email(),
  email_verified: z.boolean(),
  name: z.string().optional(),
});

@Injectable()
export class GoogleIdTokenVerifier {
  private readonly clientId: string | undefined;

  constructor(
    @Inject(GOOGLE_SIGNING_KEYS) private readonly signingKeys: JWTVerifyGetKey,
    config: ConfigService<Env, true>,
  ) {
    this.clientId = config.get('GOOGLE_CLIENT_ID', { infer: true });
  }

  async verify(idToken: string): Promise<GoogleProfile> {
    if (!this.clientId) throw new ServiceUnavailableException('Google sign-in is not configured');

    const verified = await jwtVerify(idToken, this.signingKeys, {
      issuer: GOOGLE_ISSUERS,
      audience: this.clientId,
    }).catch(() => undefined);
    const claims = googleClaimsSchema.safeParse(verified?.payload);
    if (!claims.success) throw new UnauthorizedException('Google sign-in failed');

    return {
      googleUserId: claims.data.sub,
      email: claims.data.email.toLowerCase(),
      isEmailVerified: claims.data.email_verified,
      name: claims.data.name,
    };
  }
}

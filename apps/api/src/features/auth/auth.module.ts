import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { createRemoteJWKSet } from 'jose';
import { AccessTokenService } from './access-token.service.js';
import { AuthGuard } from './auth.guard.js';
import { EmailTokens } from './email-tokens.service.js';
import { EmailVerificationService } from './email-verification.service.js';
import { ForgotPasswordEndpoint } from './endpoints/forgot-password.endpoint.js';
import { GoogleSignInEndpoint } from './endpoints/google-sign-in.endpoint.js';
import { ListSessionsEndpoint } from './endpoints/list-sessions.endpoint.js';
import { LoginEndpoint } from './endpoints/login.endpoint.js';
import { LogoutEndpoint } from './endpoints/logout.endpoint.js';
import { RefreshSessionEndpoint } from './endpoints/refresh-session.endpoint.js';
import { RegisterEndpoint } from './endpoints/register.endpoint.js';
import { ResendVerificationEndpoint } from './endpoints/resend-verification.endpoint.js';
import { ResetPasswordEndpoint } from './endpoints/reset-password.endpoint.js';
import { RevokeAllSessionsEndpoint } from './endpoints/revoke-all-sessions.endpoint.js';
import { RevokeSessionEndpoint } from './endpoints/revoke-session.endpoint.js';
import { VerifyEmailEndpoint } from './endpoints/verify-email.endpoint.js';
import { GoogleAuthService } from './google-auth.service.js';
import {
  GOOGLE_JWKS_URL,
  GOOGLE_SIGNING_KEYS,
  GoogleIdTokenVerifier,
} from './google-id-token-verifier.service.js';
import { PasswordAuthService } from './password-auth.service.js';
import { PasswordResetService } from './password-reset.service.js';
import { RefreshCookie } from './refresh-cookie.service.js';
import { SessionIssuer } from './session-issuer.service.js';
import { SessionsService } from './sessions.service.js';

@Module({
  controllers: [
    RegisterEndpoint,
    LoginEndpoint,
    GoogleSignInEndpoint,
    RefreshSessionEndpoint,
    LogoutEndpoint,
    VerifyEmailEndpoint,
    ResendVerificationEndpoint,
    ForgotPasswordEndpoint,
    ResetPasswordEndpoint,
    ListSessionsEndpoint,
    RevokeSessionEndpoint,
    RevokeAllSessionsEndpoint,
  ],
  providers: [
    { provide: APP_GUARD, useClass: AuthGuard },
    AccessTokenService,
    SessionsService,
    SessionIssuer,
    RefreshCookie,
    EmailTokens,
    EmailVerificationService,
    PasswordAuthService,
    PasswordResetService,
    { provide: GOOGLE_SIGNING_KEYS, useFactory: () => createRemoteJWKSet(GOOGLE_JWKS_URL) },
    GoogleIdTokenVerifier,
    GoogleAuthService,
  ],
  exports: [SessionsService],
})
export class AuthModule {}

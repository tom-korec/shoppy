import type { ConfigService } from '@nestjs/config';
import type { Env } from '../../config/env.js';
import type { PrismaService } from '../../infrastructure/prisma/prisma.service.js';
import { hashOpaqueToken } from './opaque-token.js';
import { SessionsService } from './sessions.service.js';

const SESSION_ID = '0199a1b2-c3d4-7e5f-8a9b-0c1d2e3f4a5b';
const config = { get: () => 'j'.repeat(32) } as unknown as ConfigService<Env, true>;

function createService(rotationCount: number) {
  const session = {
    id: SESSION_ID,
    userId: 'user-1',
    currentTokenHash: '',
    previousTokenHash: null,
    rotatedAt: null,
    revokedAt: null,
    expiresAt: new Date(Date.now() + 60_000),
  };
  const prisma = {
    sessionFamily: {
      create: () => Promise.resolve(session),
      findUnique: () => Promise.resolve(session),
      updateMany: () => Promise.resolve({ count: rotationCount }),
    },
  } as unknown as PrismaService;
  return { service: new SessionsService(prisma, config), session };
}

describe('SessionsService.rotate', () => {
  it('issues a new token when it wins the rotation', async () => {
    const { service, session } = createService(1);
    const started = await service.start('user-1', undefined);
    session.currentTokenHash = hashOpaqueToken(started.refreshToken?.split('.')[1] ?? '');

    const rotated = await service.rotate(started.refreshToken ?? '');

    expect(rotated.refreshToken).toBeDefined();
    expect(rotated.refreshToken).not.toBe(started.refreshToken);
  });

  it('issues no new token when a concurrent request rotated first', async () => {
    const { service, session } = createService(0);
    const started = await service.start('user-1', undefined);
    session.currentTokenHash = hashOpaqueToken(started.refreshToken?.split('.')[1] ?? '');

    const rotated = await service.rotate(started.refreshToken ?? '');

    expect(rotated).toEqual({ sessionId: SESSION_ID, userId: 'user-1', refreshToken: undefined });
  });
});

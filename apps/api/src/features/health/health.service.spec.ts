import type { ConfigService } from '@nestjs/config';
import type { Env } from '../../config/env.js';
import type { PrismaService } from '../../infrastructure/prisma/prisma.service.js';
import { HealthService } from './health.service.js';

function createService(queryRaw: () => Promise<unknown>) {
  const prisma = { $queryRaw: queryRaw } as unknown as PrismaService;
  const config = { get: () => '1.0.0' } as unknown as ConfigService<Env, true>;
  return new HealthService(prisma, config);
}

describe('HealthService', () => {
  it('reports ok when the database answers', async () => {
    const result = await createService(() => Promise.resolve([1])).check();

    expect(result).toMatchObject({ status: 'ok', version: '1.0.0', checks: { database: 'up' } });
  });

  it('reports degraded when the database query fails', async () => {
    const result = await createService(() => Promise.reject(new Error('down'))).check();

    expect(result).toMatchObject({ status: 'degraded', checks: { database: 'down' } });
  });
});

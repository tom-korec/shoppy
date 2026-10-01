import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { PrismaService } from '../../src/infrastructure/prisma/prisma.service.js';

const DAY_MS = 24 * 60 * 60 * 1000;

export function daysAgo(days: number): Date {
  return new Date(Date.now() - days * DAY_MS);
}

// Backdated purchases, which the API can't create.
export async function insertPurchases(
  app: NestFastifyApplication,
  listId: string,
  purchases: { name: string; boughtAt: Date }[],
): Promise<void> {
  await app.get(PrismaService).purchaseRecord.createMany({
    data: purchases.map(({ name, boughtAt }) => ({ listId, nameSnapshot: name, boughtAt })),
  });
}

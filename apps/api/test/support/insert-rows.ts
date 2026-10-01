import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { PrismaService } from '../../src/infrastructure/prisma/prisma.service.js';

// Fills a scope or list up to a size limit directly, without hundreds of requests.
export async function insertRows(
  app: NestFastifyApplication,
  table: 'entries' | 'items' | 'lists' | 'categories',
  { ownerUserId, listId, count }: { ownerUserId: string; listId?: string; count: number },
): Promise<void> {
  const prisma = app.get(PrismaService);
  const names = Array.from({ length: count }, (_, index) => `Filler ${index}`);
  if (table === 'entries') {
    await prisma.listEntry.createMany({
      data: names.map((text) => ({ listId: listId ?? '', text })),
    });
  } else if (table === 'items') {
    await prisma.item.createMany({ data: names.map((name) => ({ ownerUserId, name })) });
  } else if (table === 'lists') {
    await prisma.list.createMany({
      data: names.map((name) => ({ ownerUserId, name, icon: 'tag' })),
    });
  } else {
    await prisma.category.createMany({
      data: names.map((name, index) => ({ ownerUserId, name, icon: 'tag', position: 100 + index })),
    });
  }
}

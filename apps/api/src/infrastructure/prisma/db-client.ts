import type { Prisma } from '../../generated/prisma/client.js';

// Either the PrismaService or the client of a running transaction.
export type DbClient = Prisma.TransactionClient;

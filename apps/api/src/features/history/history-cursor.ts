import { BadRequestException } from '@nestjs/common';

export interface HistoryCursor {
  boughtAt: Date;
  id: string;
}

// Keyset pagination over (bought_at DESC, id DESC); stable while new purchases arrive.
export function encodeHistoryCursor({ boughtAt, id }: HistoryCursor): string {
  return Buffer.from(`${boughtAt.toISOString()}|${id}`).toString('base64url');
}

export function decodeHistoryCursor(cursor: string): HistoryCursor {
  const [timestamp = '', id = ''] = Buffer.from(cursor, 'base64url').toString().split('|');
  const boughtAt = new Date(timestamp);
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  if (Number.isNaN(boughtAt.getTime()) || !isUuid) {
    throw new BadRequestException('Invalid cursor');
  }
  return { boughtAt, id };
}

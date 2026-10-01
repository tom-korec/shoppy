import { BadRequestException } from '@nestjs/common';
import { decodeHistoryCursor, encodeHistoryCursor } from './history-cursor.js';

describe('history cursor', () => {
  it('round-trips the position of a record', () => {
    const position = {
      boughtAt: new Date('2026-10-01T12:00:00.123Z'),
      id: '01999d6c-6c4a-7c39-9a3f-3f5b1c2d4e5f',
    };

    expect(decodeHistoryCursor(encodeHistoryCursor(position))).toEqual(position);
  });

  it('rejects a tampered cursor', () => {
    expect(() => decodeHistoryCursor('not-a-cursor')).toThrow(BadRequestException);
  });
});

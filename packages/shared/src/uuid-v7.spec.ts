import { z } from 'zod';
import { uuidV7 } from './uuid-v7.js';

describe('uuidV7', () => {
  it('creates a valid version 7 UUID', () => {
    const id = uuidV7();

    expect(z.uuid({ version: 'v7' }).safeParse(id).success).toBe(true);
  });

  it('encodes the time, so ids sort by creation', () => {
    expect(uuidV7(Date.UTC(2040, 0, 1)).slice(0, 13)).toBe('020251fe-2400');
  });

  it('keeps ids created in the same millisecond in order', () => {
    const now = Date.UTC(2041, 0, 1);
    const ids = [uuidV7(now), uuidV7(now), uuidV7(now)];

    expect([...ids].sort()).toEqual(ids);
  });
});

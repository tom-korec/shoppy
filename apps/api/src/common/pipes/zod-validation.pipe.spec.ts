import { BadRequestException } from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from './zod-validation.pipe.js';

describe('ZodValidationPipe', () => {
  const pipe = new ZodValidationPipe(z.object({ name: z.string().trim().min(1) }));

  it('returns parsed data', () => {
    expect(pipe.transform({ name: '  Milk ' })).toEqual({ name: 'Milk' });
  });

  it('throws BadRequest with issue paths', () => {
    try {
      pipe.transform({ name: '' });
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      const body = (error as BadRequestException).getResponse() as { issues: { path: string }[] };
      expect(body.issues[0]?.path).toBe('name');
    }
  });
});

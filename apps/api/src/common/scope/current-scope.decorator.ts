import {
  BadRequestException,
  createParamDecorator,
  type ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { z } from 'zod';
import { householdScope, personalScope, type Scope } from './scope.js';

const householdIdSchema = z.uuid();

// `/scopes/personal/...` or `/scopes/households/:householdId/...`. Membership and permissions
// are checked by ScopeAccess in the service.
export const CurrentScope = createParamDecorator(
  (_data: unknown, context: ExecutionContext): Scope => {
    const request = context
      .switchToHttp()
      .getRequest<FastifyRequest<{ Params: { householdId?: string } }>>();
    if (!request.user) throw new UnauthorizedException();
    const { householdId } = request.params;
    if (householdId === undefined) return personalScope(request.user);
    const parsed = householdIdSchema.safeParse(householdId);
    if (!parsed.success) throw new BadRequestException('Invalid household id');
    return householdScope(parsed.data);
  },
);

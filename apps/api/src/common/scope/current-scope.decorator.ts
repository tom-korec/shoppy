import { createParamDecorator, type ExecutionContext, UnauthorizedException } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { personalScope, type Scope } from './scope.js';

export const CurrentScope = createParamDecorator(
  (_data: unknown, context: ExecutionContext): Scope => {
    const { user } = context.switchToHttp().getRequest<FastifyRequest>();
    if (!user) throw new UnauthorizedException();
    return personalScope(user);
  },
);

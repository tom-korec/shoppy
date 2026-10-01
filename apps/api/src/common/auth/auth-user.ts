export interface AuthUser {
  id: string;
  sessionId: string;
  isEmailVerified: boolean;
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthUser;
  }
}

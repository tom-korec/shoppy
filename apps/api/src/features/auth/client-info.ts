import type { FastifyRequest } from 'fastify';
import { clientIpKey } from '../../common/rate-limit/client-ip-key.js';

export interface ClientInfo {
  // Rate-limit key: the IPv4 address or the IPv6 /64.
  ip: string;
  userAgent: string | undefined;
}

export function toClientInfo(request: FastifyRequest): ClientInfo {
  return { ip: clientIpKey(request.ip), userAgent: request.headers['user-agent'] };
}

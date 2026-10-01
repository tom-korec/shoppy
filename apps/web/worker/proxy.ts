export const PROXY_SECRET_HEADER = 'x-shoppy-proxy-secret';

export interface ProxyEnv {
  API_ORIGIN: string;
  PROXY_SECRET?: string;
}

// Serving the API from the PWA's own origin keeps the refresh-token cookie first-party (iOS ITP-safe).
export async function proxyToApi(
  request: Request,
  env: ProxyEnv,
  fetchImpl: typeof fetch = fetch,
): Promise<Response> {
  if (!env.API_ORIGIN) {
    return Response.json({ message: 'API_ORIGIN is not configured' }, { status: 503 });
  }

  const incoming = new URL(request.url);
  const target = new URL(incoming.pathname + incoming.search, env.API_ORIGIN);

  const headers = new Headers(request.headers);
  headers.delete('host');
  headers.set('x-forwarded-host', incoming.host);
  headers.set('x-forwarded-proto', incoming.protocol.replace(':', ''));
  const clientIp = request.headers.get('cf-connecting-ip');
  if (clientIp) headers.set('x-forwarded-for', clientIp);
  if (env.PROXY_SECRET) headers.set(PROXY_SECRET_HEADER, env.PROXY_SECRET);
  else headers.delete(PROXY_SECRET_HEADER);

  const hasBody = !['GET', 'HEAD'].includes(request.method);

  return fetchImpl(target, {
    method: request.method,
    headers,
    body: hasBody ? request.body : undefined,
    redirect: 'manual',
  });
}

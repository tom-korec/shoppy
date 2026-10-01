// @vitest-environment node
import { PROXY_SECRET_HEADER, proxyToApi } from './proxy.ts';

const API_ORIGIN = 'https://api.example.run.app';

function capture() {
  const calls: { url: string; init: RequestInit }[] = [];
  const fetchImpl = (async (url: URL, init: RequestInit) => {
    calls.push({ url: url.toString(), init });
    return new Response('ok');
  }) as unknown as typeof fetch;
  return { calls, fetchImpl };
}

describe('proxyToApi', () => {
  it('forwards path, query and forwarding headers', async () => {
    const { calls, fetchImpl } = capture();
    const request = new Request('https://shoppy.korec.dev/api/health?x=1', {
      headers: { 'cf-connecting-ip': '1.2.3.4', cookie: 'rt=abc' },
    });

    await proxyToApi(request, { API_ORIGIN, PROXY_SECRET: 's'.repeat(32) }, fetchImpl);

    const call = calls[0]!;
    expect(call.url).toBe(`${API_ORIGIN}/api/health?x=1`);
    const headers = new Headers(call.init.headers);
    expect(headers.get('x-forwarded-host')).toBe('shoppy.korec.dev');
    expect(headers.get('x-forwarded-proto')).toBe('https');
    expect(headers.get('x-forwarded-for')).toBe('1.2.3.4');
    expect(headers.get('cookie')).toBe('rt=abc');
    expect(headers.get(PROXY_SECRET_HEADER)).toBe('s'.repeat(32));
    expect(call.init.body).toBeUndefined();
  });

  it('does not pass through a client-supplied proxy secret when none is configured', async () => {
    const { calls, fetchImpl } = capture();
    const request = new Request('https://shoppy.korec.dev/api/health', {
      headers: { [PROXY_SECRET_HEADER]: 'forged' },
    });

    await proxyToApi(request, { API_ORIGIN }, fetchImpl);

    expect(new Headers(calls[0]!.init.headers).has(PROXY_SECRET_HEADER)).toBe(false);
  });

  it('forwards the body for POST requests', async () => {
    const { calls, fetchImpl } = capture();
    const request = new Request('https://shoppy.korec.dev/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'a@b.c' }),
    });

    await proxyToApi(request, { API_ORIGIN }, fetchImpl);

    expect(calls[0]!.init.method).toBe('POST');
    expect(calls[0]!.init.body).toBeDefined();
  });

  it('returns 503 when API_ORIGIN is missing', async () => {
    const res = await proxyToApi(new Request('https://shoppy.korec.dev/api/health'), {
      API_ORIGIN: '',
    });
    expect(res.status).toBe(503);
  });
});

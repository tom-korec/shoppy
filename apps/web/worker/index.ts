import { type ProxyEnv, proxyToApi } from './proxy.ts';

interface WorkerEnv extends ProxyEnv {
  ASSETS: Fetcher;
}

export default {
  async fetch(request, env): Promise<Response> {
    // `run_worker_first` only routes /api/* here; the asset fallback covers local `wrangler dev`.
    if (new URL(request.url).pathname.startsWith('/api/')) {
      return proxyToApi(request, env);
    }
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<WorkerEnv>;

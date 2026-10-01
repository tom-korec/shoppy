import fastifyCookie from '@fastify/cookie';
import fastifyHelmet from '@fastify/helmet';
import { ConfigService } from '@nestjs/config';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { API_PREFIX } from '@shoppy/shared';
import { Logger } from 'nestjs-pino';
import type { Env } from '../config/env.js';
import { createProxySecretHook } from './proxy-secret.hook.js';

export async function configureApp(app: NestFastifyApplication): Promise<NestFastifyApplication> {
  const config = app.get<ConfigService<Env, true>>(ConfigService);

  app.useLogger(app.get(Logger));
  app.setGlobalPrefix(API_PREFIX.slice(1));
  app.enableShutdownHooks();

  await app.register(fastifyHelmet);
  await app.register(fastifyCookie);

  const proxySecret = config.get('PROXY_SECRET', { infer: true });
  if (proxySecret) {
    app.getHttpAdapter().getInstance().addHook('onRequest', createProxySecretHook(proxySecret));
  }

  return app;
}

import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module.js';
import { configureApp } from '../../src/bootstrap/configure-app.js';
import { PrismaService } from '../../src/infrastructure/prisma/prisma.service.js';

interface TestAppOptions {
  prisma?: Record<string, unknown>;
  env?: Record<string, string>;
}

export async function createTestApp(options: TestAppOptions = {}): Promise<NestFastifyApplication> {
  Object.assign(process.env, options.env);

  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(PrismaService)
    .useValue({ $disconnect: () => Promise.resolve(), ...options.prisma })
    .compile();

  const app = moduleRef.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
  await configureApp(app);
  await app.init();
  await app.getHttpAdapter().getInstance().ready();
  return app;
}

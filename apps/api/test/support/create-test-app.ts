import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module.js';
import { configureApp } from '../../src/bootstrap/configure-app.js';
import { GoogleIdTokenVerifier } from '../../src/features/auth/google-id-token-verifier.service.js';
import { EmailSender } from '../../src/infrastructure/email/email-sender.js';
import { PrismaService } from '../../src/infrastructure/prisma/prisma.service.js';
import { RecordingEmailSender } from './recording-email-sender.js';

interface TestAppOptions {
  // Replaces the real test database; without it, tests run against TEST_DATABASE_URL.
  prisma?: Record<string, unknown>;
  env?: Record<string, string>;
  googleVerifier?: Pick<GoogleIdTokenVerifier, 'verify'>;
}

export async function createTestApp(options: TestAppOptions = {}): Promise<NestFastifyApplication> {
  Object.assign(process.env, options.env);
  const emails = new RecordingEmailSender();

  let builder = Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(EmailSender)
    .useValue(emails);
  if (options.prisma) {
    builder = builder
      .overrideProvider(PrismaService)
      .useValue({ $disconnect: () => Promise.resolve(), ...options.prisma });
  }
  if (options.googleVerifier) {
    builder = builder.overrideProvider(GoogleIdTokenVerifier).useValue(options.googleVerifier);
  }

  const app = (await builder.compile()).createNestApplication<NestFastifyApplication>(
    new FastifyAdapter(),
  );
  await configureApp(app);
  await app.init();
  await app.getHttpAdapter().getInstance().ready();
  return app;
}

export function sentEmails(app: NestFastifyApplication): RecordingEmailSender {
  return app.get(EmailSender) as RecordingEmailSender;
}

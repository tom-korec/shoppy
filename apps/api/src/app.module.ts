import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { SentryGlobalFilter, SentryModule } from '@sentry/nestjs/setup';
import { LoggerModule } from 'nestjs-pino';
import { RateLimitModule } from './common/rate-limit/rate-limit.module.js';
import { type Env, validateEnv } from './config/env.js';
import { AuthModule } from './features/auth/auth.module.js';
import { HealthModule } from './features/health/health.module.js';
import { UsersModule } from './features/users/users.module.js';
import { EmailModule } from './infrastructure/email/email.module.js';
import { loggerParams } from './infrastructure/logging/logger-params.js';
import { PrismaModule } from './infrastructure/prisma/prisma.module.js';

@Module({
  imports: [
    SentryModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true, cache: true, validate: validateEnv }),
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) =>
        loggerParams({
          NODE_ENV: config.get('NODE_ENV', { infer: true }),
          LOG_LEVEL: config.get('LOG_LEVEL', { infer: true }),
        }),
    }),
    PrismaModule,
    EmailModule,
    RateLimitModule,
    HealthModule,
    AuthModule,
    UsersModule,
  ],
  providers: [{ provide: APP_FILTER, useClass: SentryGlobalFilter }],
})
export class AppModule {}

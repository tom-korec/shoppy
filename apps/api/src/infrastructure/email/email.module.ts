import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from '../../config/env.js';
import { DailyCappedEmailSender } from './daily-capped-email-sender.js';
import { EmailSender } from './email-sender.js';
import { LogEmailSender } from './log-email-sender.js';
import { ResendEmailSender } from './resend-email-sender.js';

@Global()
@Module({
  providers: [
    {
      provide: EmailSender,
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>): EmailSender => {
        const apiKey = config.get('RESEND_API_KEY', { infer: true });
        if (!apiKey) return new LogEmailSender();
        return new DailyCappedEmailSender(
          new ResendEmailSender(apiKey, config.get('EMAIL_FROM', { infer: true })),
        );
      },
    },
  ],
  exports: [EmailSender],
})
export class EmailModule {}

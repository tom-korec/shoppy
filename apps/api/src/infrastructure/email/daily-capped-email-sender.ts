import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { type EmailMessage, EmailSender } from './email-sender.js';

// Resend's free tier allows 100 emails a day. With up to two instances, 40 each stays below it,
// so abuse of the public endpoints can't burn the quota and lock real users out for longer.
export const EMAIL_DAILY_LIMIT_PER_INSTANCE = 40;

export class DailyCappedEmailSender extends EmailSender {
  private readonly logger = new Logger(DailyCappedEmailSender.name);
  private day = '';
  private sentToday = 0;

  constructor(
    private readonly inner: EmailSender,
    private readonly limit = EMAIL_DAILY_LIMIT_PER_INSTANCE,
    private readonly now: () => Date = () => new Date(),
  ) {
    super();
  }

  async send(message: EmailMessage): Promise<void> {
    const today = this.now().toISOString().slice(0, 10);
    if (today !== this.day) {
      this.day = today;
      this.sentToday = 0;
    }

    if (this.sentToday >= this.limit) {
      this.logger.error(
        `Daily email limit of ${this.limit} reached; not sending "${message.subject}"`,
      );
      throw new HttpException(
        "Shoppy can't send more emails today. Try again tomorrow.",
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    this.sentToday += 1;
    await this.inner.send(message);
  }
}

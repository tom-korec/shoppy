import { Logger } from '@nestjs/common';
import { type EmailMessage, EmailSender } from './email-sender.js';

// Local development without a Resend key: the email (with its link) shows up in the API log.
export class LogEmailSender extends EmailSender {
  private readonly logger = new Logger(LogEmailSender.name);

  send(message: EmailMessage): Promise<void> {
    this.logger.log(`Email to ${message.to}: ${message.subject}\n${message.text}`);
    return Promise.resolve();
  }
}

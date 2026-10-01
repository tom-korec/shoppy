import { Logger } from '@nestjs/common';
import { type EmailMessage, EmailSender } from './email-sender.js';

const RESEND_ENDPOINT = 'https://api.resend.com/emails';

export class ResendEmailSender extends EmailSender {
  private readonly logger = new Logger(ResendEmailSender.name);

  constructor(
    private readonly apiKey: string,
    private readonly from: string,
    private readonly fetchImpl: typeof fetch = fetch,
  ) {
    super();
  }

  async send(message: EmailMessage): Promise<void> {
    const response = await this.fetchImpl(RESEND_ENDPOINT, {
      method: 'POST',
      headers: { authorization: `Bearer ${this.apiKey}`, 'content-type': 'application/json' },
      body: JSON.stringify({ from: this.from, ...message }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      this.logger.error(`Resend rejected an email (${response.status}): ${detail}`);
      throw new Error(`Email sending failed with status ${response.status}`);
    }
  }
}

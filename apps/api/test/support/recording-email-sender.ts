import type { EmailMessage, EmailSender } from '../../src/infrastructure/email/email-sender.js';

export class RecordingEmailSender implements EmailSender {
  readonly sent: EmailMessage[] = [];

  send(message: EmailMessage): Promise<void> {
    this.sent.push(message);
    return Promise.resolve();
  }

  lastLinkTo(email: string): URL {
    const message = this.sent.findLast((sent) => sent.to === email);
    const link = message?.text.match(/https?:\/\/\S+/)?.[0];
    if (!link) throw new Error(`No email with a link was sent to ${email}`);
    return new URL(link);
  }
}

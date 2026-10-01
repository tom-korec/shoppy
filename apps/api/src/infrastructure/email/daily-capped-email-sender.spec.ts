import { HttpStatus } from '@nestjs/common';
import { DailyCappedEmailSender } from './daily-capped-email-sender.js';
import type { EmailMessage, EmailSender } from './email-sender.js';

const MESSAGE: EmailMessage = { to: 'anna@example.com', subject: 'Hi', html: '', text: '' };

function createSender(limit: number, clock: { now: Date }) {
  const sent: EmailMessage[] = [];
  const inner: EmailSender = {
    send: (message) => {
      sent.push(message);
      return Promise.resolve();
    },
  };
  return { sender: new DailyCappedEmailSender(inner, limit, () => clock.now), sent };
}

describe('DailyCappedEmailSender', () => {
  it('sends up to the daily limit', async () => {
    const { sender, sent } = createSender(2, { now: new Date('2026-10-01T10:00:00Z') });

    await sender.send(MESSAGE);
    await sender.send(MESSAGE);

    expect(sent).toHaveLength(2);
  });

  it('refuses with 429 over the limit', async () => {
    const { sender, sent } = createSender(1, { now: new Date('2026-10-01T10:00:00Z') });
    await sender.send(MESSAGE);

    await expect(sender.send(MESSAGE)).rejects.toMatchObject({
      status: HttpStatus.TOO_MANY_REQUESTS,
    });
    expect(sent).toHaveLength(1);
  });

  it('starts counting again on the next day', async () => {
    const clock = { now: new Date('2026-10-01T23:59:00Z') };
    const { sender, sent } = createSender(1, clock);
    await sender.send(MESSAGE);

    clock.now = new Date('2026-10-02T00:01:00Z');
    await sender.send(MESSAGE);

    expect(sent).toHaveLength(2);
  });
});

import type { EmailMessage } from './email-sender.js';
import { ResendEmailSender } from './resend-email-sender.js';

const MESSAGE: EmailMessage = {
  to: 'anna@example.com',
  subject: 'Hi',
  html: '<p>Hi</p>',
  text: 'Hi',
};

describe('ResendEmailSender', () => {
  it('posts the message with the sender address and API key', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(Response.json({ id: 'email-1' }));
    const sender = new ResendEmailSender('re_key', 'Shoppy <noreply@shoppy.korec.dev>', fetchImpl);

    await sender.send(MESSAGE);

    const [url, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.resend.com/emails');
    expect(new Headers(init.headers).get('authorization')).toBe('Bearer re_key');
    expect(JSON.parse(init.body as string)).toMatchObject({
      from: 'Shoppy <noreply@shoppy.korec.dev>',
      to: 'anna@example.com',
    });
  });

  it('throws when Resend rejects the email', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response('quota', { status: 429 }));
    const sender = new ResendEmailSender('re_key', 'Shoppy <noreply@shoppy.korec.dev>', fetchImpl);

    await expect(sender.send(MESSAGE)).rejects.toThrow(/429/);
  });
});

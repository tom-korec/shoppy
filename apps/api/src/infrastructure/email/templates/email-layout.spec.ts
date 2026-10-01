import { renderActionEmail } from './email-layout.js';

const email = {
  to: 'anna@example.com',
  subject: 'Subject',
  greeting: 'Hi <Anna>,',
  intro: 'Intro',
  actionLabel: 'Do it',
  actionUrl: 'https://shoppy.korec.dev/verify-email?token=a&b',
  outro: 'Bye',
};

describe('renderActionEmail', () => {
  it('escapes user-provided text in the HTML body', () => {
    const { html } = renderActionEmail(email);

    expect(html).toContain('Hi &lt;Anna&gt;,');
    expect(html).not.toContain('<Anna>');
  });

  it('puts the raw link into the plain-text body', () => {
    const { text } = renderActionEmail(email);

    expect(text).toContain('Do it: https://shoppy.korec.dev/verify-email?token=a&b');
  });
});

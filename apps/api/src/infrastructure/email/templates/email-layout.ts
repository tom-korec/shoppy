import { APP_NAME } from '@shoppy/shared';
import type { EmailMessage } from '../email-sender.js';

export interface ActionEmail {
  to: string;
  subject: string;
  greeting: string;
  intro: string;
  actionLabel: string;
  actionUrl: string;
  outro: string;
}

const escapeHtml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

// Email clients ignore <style> blocks and external CSS, so everything is inline.
export function renderActionEmail(email: ActionEmail): EmailMessage {
  const url = escapeHtml(email.actionUrl);
  const html = `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:24px;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0f172a">
    <table role="presentation" width="100%" style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px">
      <tr><td>
        <p style="margin:0 0 24px;font-size:20px;font-weight:700;color:#059669">${APP_NAME}</p>
        <p style="margin:0 0 16px;font-size:16px">${escapeHtml(email.greeting)}</p>
        <p style="margin:0 0 24px;font-size:16px;line-height:1.5">${escapeHtml(email.intro)}</p>
        <p style="margin:0 0 24px">
          <a href="${url}" style="display:inline-block;padding:12px 20px;border-radius:10px;background:#059669;color:#ffffff;font-weight:600;text-decoration:none">${escapeHtml(email.actionLabel)}</a>
        </p>
        <p style="margin:0 0 8px;font-size:13px;color:#64748b">Or open this link: <a href="${url}" style="color:#059669;word-break:break-all">${url}</a></p>
        <p style="margin:0;font-size:13px;color:#64748b">${escapeHtml(email.outro)}</p>
      </td></tr>
    </table>
  </body>
</html>`;

  const text = [
    email.greeting,
    '',
    email.intro,
    '',
    `${email.actionLabel}: ${email.actionUrl}`,
    '',
    email.outro,
  ].join('\n');

  return { to: email.to, subject: email.subject, html, text };
}

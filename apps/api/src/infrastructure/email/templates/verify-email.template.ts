import { APP_NAME } from '@shoppy/shared';
import type { EmailMessage } from '../email-sender.js';
import { renderActionEmail } from './email-layout.js';

interface VerifyEmailParams {
  to: string;
  displayName: string;
  link: string;
}

export function verifyEmailTemplate({ to, displayName, link }: VerifyEmailParams): EmailMessage {
  return renderActionEmail({
    to,
    subject: `Confirm your email for ${APP_NAME}`,
    greeting: `Hi ${displayName},`,
    intro: `Welcome to ${APP_NAME}! Confirm your email address to start using your lists.`,
    actionLabel: 'Confirm email',
    actionUrl: link,
    outro: "The link is valid for 24 hours. If you didn't create an account, ignore this email.",
  });
}

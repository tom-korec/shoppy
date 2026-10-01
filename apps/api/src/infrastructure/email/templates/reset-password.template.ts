import { APP_NAME } from '@shoppy/shared';
import type { EmailMessage } from '../email-sender.js';
import { renderActionEmail } from './email-layout.js';

interface ResetPasswordParams {
  to: string;
  displayName: string;
  link: string;
}

export function resetPasswordTemplate({
  to,
  displayName,
  link,
}: ResetPasswordParams): EmailMessage {
  return renderActionEmail({
    to,
    subject: `Set a new ${APP_NAME} password`,
    greeting: `Hi ${displayName},`,
    intro: 'Someone (hopefully you) asked to set a new password for your account.',
    actionLabel: 'Set new password',
    actionUrl: link,
    outro:
      "The link is valid for 1 hour. If you didn't ask for it, ignore this email; your password stays the same.",
  });
}

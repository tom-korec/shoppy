import { APP_NAME } from '@shoppy/shared';
import type { EmailMessage } from '../email-sender.js';
import { renderActionEmail } from './email-layout.js';

interface HouseholdInvitationParams {
  to: string;
  inviterName: string;
  householdName: string;
  roleName: string;
  link: string;
}

export function householdInvitationTemplate({
  to,
  inviterName,
  householdName,
  roleName,
  link,
}: HouseholdInvitationParams): EmailMessage {
  return renderActionEmail({
    to,
    subject: `${inviterName} invited you to ${householdName} on ${APP_NAME}`,
    greeting: 'Hi,',
    intro: `${inviterName} invited you to join "${householdName}" on ${APP_NAME} as ${roleName}, to share shopping lists.`,
    actionLabel: 'Open invitation',
    actionUrl: link,
    outro: "The invitation is valid for 7 days. If you don't know the sender, ignore this email.",
  });
}

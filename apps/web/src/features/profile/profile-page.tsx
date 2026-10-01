import { Card } from '@/components/ui/card';
import { Page } from '@/components/ui/page';
import { Section } from '@/components/ui/section';
import { useCurrentUser } from '@/features/auth/use-current-user';
import { ApiStatus } from '@/features/health/api-status';
import { APP_VERSION } from '@/lib/app-version';
import { ChangePasswordForm } from './change-password-form';
import { ProfileForm } from './profile-form';
import { SessionList } from './session-list';
import { SetPasswordCard } from './set-password-card';
import { SignOutActions } from './sign-out-actions';

export function ProfilePage() {
  const user = useCurrentUser();

  return (
    <Page title="Profile">
      <Section title="Account">
        <Card>
          <ProfileForm />
        </Card>
      </Section>
      <Section title="Password">
        <Card>{user.hasPassword ? <ChangePasswordForm /> : <SetPasswordCard />}</Card>
      </Section>
      <Section title="Devices">
        <Card>
          <SessionList />
        </Card>
      </Section>
      <SignOutActions />
      <Section title="About">
        <Card className="gap-2">
          <p className="text-sm">
            App version: <span className="font-medium">{APP_VERSION}</span>
          </p>
          <ApiStatus />
        </Card>
      </Section>
    </Page>
  );
}

import { Page } from '@/components/ui/page';
import { Section } from '@/components/ui/section';
import { ApiStatus } from '@/features/health/api-status';
import { APP_VERSION } from '@/lib/app-version';

export function ProfilePage() {
  return (
    <Page title="Profile">
      <Section title="About">
        <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4">
          <p className="text-sm">
            App version: <span className="font-medium">{APP_VERSION}</span>
          </p>
          <ApiStatus />
        </div>
      </Section>
    </Page>
  );
}

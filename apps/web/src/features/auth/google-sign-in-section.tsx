import { GoogleSignInButton } from './google-sign-in-button';

interface GoogleSignInSectionProps {
  redirectTo: string;
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export function GoogleSignInSection({ redirectTo }: GoogleSignInSectionProps) {
  if (!GOOGLE_CLIENT_ID) return null;

  return (
    <>
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>
      <GoogleSignInButton clientId={GOOGLE_CLIENT_ID} redirectTo={redirectTo} />
    </>
  );
}

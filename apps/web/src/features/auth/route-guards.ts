import { redirect } from '@tanstack/react-router';
import type { AuthStore } from '@/lib/auth-store';
import { ensureSession } from '@/lib/refresh-session';

export async function requireVerifiedUser(auth: AuthStore, currentHref: string): Promise<void> {
  const user = await ensureSession(auth);
  if (!user) {
    throw redirect({
      to: '/sign-in',
      search: currentHref === '/' ? {} : { redirect: currentHref },
    });
  }
  if (!user.isEmailVerified) {
    throw redirect({
      to: '/verify-pending',
      search: currentHref === '/' ? {} : { redirect: currentHref },
    });
  }
}

export async function requireUnverifiedUser(auth: AuthStore): Promise<void> {
  const user = await ensureSession(auth);
  if (!user) throw redirect({ to: '/sign-in', search: {} });
  if (user.isEmailVerified) throw redirect({ to: '/' });
}

export async function redirectSignedInUser(auth: AuthStore): Promise<void> {
  const user = await ensureSession(auth);
  if (!user) return;
  throw redirect({ to: user.isEmailVerified ? '/' : '/verify-pending' });
}

// Only same-origin paths, so a crafted sign-in link can't send the user to another site.
// Browsers read a backslash like a slash, so `/\evil.example` counts as protocol-relative too.
export function safeRedirectPath(path: string | undefined): string {
  const isAppPath = path?.startsWith('/') && !path.startsWith('//') && !path.includes('\\');
  return isAppPath && path ? path : '/';
}

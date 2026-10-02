import { Navigate, Outlet } from '@tanstack/react-router';
import { useAuth } from '@/features/auth/use-auth';
import { BottomNav } from './bottom-nav';
import { SideNav } from './side-nav';
import { Toaster } from './toaster';

export function AppLayout() {
  const auth = useAuth();

  // The session can end while the app is open (revoked on another device, refresh failed).
  if (auth.status === 'signed-out') return <Navigate to="/sign-in" />;

  return (
    <>
      <SideNav />
      <main className="min-h-full pb-[calc(4rem+env(safe-area-inset-bottom))] lg:pb-0 lg:pl-60">
        <Outlet />
      </main>
      <Toaster />
      <BottomNav />
    </>
  );
}

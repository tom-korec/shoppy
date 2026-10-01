import { Outlet } from '@tanstack/react-router';
import { BottomNav } from './bottom-nav';
import { RouterDevtools } from './router-devtools';
import { UpdatePrompt } from './update-prompt';

export function RootLayout() {
  return (
    <>
      <main className="min-h-full pb-[calc(4rem+env(safe-area-inset-bottom))]">
        <Outlet />
      </main>
      <BottomNav />
      <UpdatePrompt />
      <RouterDevtools />
    </>
  );
}

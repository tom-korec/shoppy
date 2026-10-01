import { Outlet } from '@tanstack/react-router';
import { RouterDevtools } from './router-devtools';
import { UpdatePrompt } from './update-prompt';

export function RootLayout() {
  return (
    <>
      <Outlet />
      <UpdatePrompt />
      <RouterDevtools />
    </>
  );
}

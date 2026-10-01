import { useSyncExternalStore } from 'react';
import { type AuthState, authStore } from '@/lib/auth-store';

export function useAuth(): AuthState {
  return useSyncExternalStore(authStore.subscribe, authStore.getState);
}

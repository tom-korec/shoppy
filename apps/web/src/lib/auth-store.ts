import type { AuthSessionDto, UserDto } from '@shoppy/shared';

export type AuthState =
  | { status: 'unknown' }
  | { status: 'signed-out' }
  | { status: 'signed-in'; user: UserDto; accessToken: string };

type Listener = () => void;

// The access token lives only in memory (never in storage), as the auth design requires.
export class AuthStore {
  private state: AuthState = { status: 'unknown' };
  private readonly listeners = new Set<Listener>();

  getState = (): AuthState => this.state;

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getAccessToken(): string | undefined {
    return this.state.status === 'signed-in' ? this.state.accessToken : undefined;
  }

  getUser(): UserDto | undefined {
    return this.state.status === 'signed-in' ? this.state.user : undefined;
  }

  signIn({ accessToken, user }: AuthSessionDto): void {
    this.setState({ status: 'signed-in', accessToken, user });
  }

  setUser(user: UserDto): void {
    if (this.state.status !== 'signed-in') return;
    this.setState({ ...this.state, user });
  }

  signOut(): void {
    this.setState({ status: 'signed-out' });
  }

  private setState(state: AuthState): void {
    this.state = state;
    for (const listener of this.listeners) listener();
  }
}

export const authStore = new AuthStore();

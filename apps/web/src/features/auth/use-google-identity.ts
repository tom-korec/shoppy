import { useEffect, useRef, useState } from 'react';

interface GoogleCredentialResponse {
  credential: string;
}

interface GoogleAccountsId {
  initialize(config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    use_fedcm_for_button?: boolean;
  }): void;
  renderButton(parent: HTMLElement, options: Record<string, string | number>): void;
}

declare global {
  interface Window {
    google?: { accounts: { id: GoogleAccountsId } };
  }
}

const SCRIPT_URL = 'https://accounts.google.com/gsi/client';

let scriptLoading: Promise<void> | undefined;

function loadScript(): Promise<void> {
  scriptLoading ??= new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptLoading = undefined;
      reject(new Error('Google sign-in could not load'));
    };
    document.head.append(script);
  });
  return scriptLoading;
}

export function useGoogleIdentity(clientId: string, onCredential: (idToken: string) => void) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const callbackRef = useRef(onCredential);
  const [hasFailed, setHasFailed] = useState(false);

  useEffect(() => {
    callbackRef.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    let isActive = true;

    loadScript().then(
      () => {
        const accounts = window.google?.accounts.id;
        if (!isActive || !accounts || !buttonRef.current) return;
        accounts.initialize({
          client_id: clientId,
          callback: ({ credential }) => callbackRef.current(credential),
        });
        accounts.renderButton(buttonRef.current, {
          theme: 'outline',
          size: 'large',
          shape: 'pill',
          text: 'continue_with',
          width: buttonRef.current.offsetWidth,
        });
      },
      () => {
        if (isActive) setHasFailed(true);
      },
    );

    return () => {
      isActive = false;
    };
  }, [clientId]);

  return { buttonRef, hasFailed };
}

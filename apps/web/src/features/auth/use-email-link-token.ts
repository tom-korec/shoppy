import { useNavigate, useSearch } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

// The single-use token is moved out of the URL right away, so it doesn't linger in browser
// history or in the page URL that error reports carry.
export function useEmailLinkToken(): string {
  const search = useSearch({ strict: false });
  const navigate = useNavigate();
  const [token] = useState(() => search.token ?? '');

  useEffect(() => {
    if (token) void navigate({ to: '.', search: {}, replace: true });
  }, [token, navigate]);

  return token;
}

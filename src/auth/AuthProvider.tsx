import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import type { Role } from '../../shared/types';

export interface AuthUser {
  id: string;
  name: string;
  email: string | null;
  role: Role;
  organizationName: string | null;
  onboardingComplete: boolean;
}

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  beginSignIn: () => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me', { credentials: 'include' });
      if (!response.ok) throw new Error('Could not check your FoodLoop session.');
      const body = await response.json() as { user: AuthUser | null };
      setUser(body.user);
      setError(null);
    } catch {
      setUser(null);
      setError('Sign-in service is not available right now. You can still explore the clearly labeled demo.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const beginSignIn = useCallback(async () => {
    setError(null);
    const response = await fetch('/api/auth/start', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
    const body = await response.json() as { authorizationUrl?: string; error?: string };
    if (!response.ok || !body.authorizationUrl) throw new Error(body.error || 'Could not start sign-in.');
    window.location.assign(body.authorizationUrl);
  }, []);

  const signOut = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    setUser(null);
    window.location.assign('/');
  }, []);

  const value = useMemo(() => ({ user, loading, error, beginSignIn, signOut, refresh }), [user, loading, error, beginSignIn, signOut, refresh]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

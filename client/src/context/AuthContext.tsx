import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import api from '../api/client';

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (payload: { email: string; password: string }) => Promise<void>;
  register: (payload: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('topcit_token');
    const storedUser = localStorage.getItem('topcit_user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      const parsed = JSON.parse(storedUser);
      setUser({ ...parsed, role: parsed.role || 'USER' });
    }
    setLoading(false);
  }, []);

  const persist = (nextToken: string, nextUser: AuthUser) => {
    localStorage.setItem('topcit_token', nextToken);
    localStorage.setItem('topcit_user', JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  };

  const login = useCallback(async (payload: { email: string; password: string }) => {
    const { data } = await api.post('/auth/login', payload);
    persist(data.token, data.user);
  }, []);

  const register = useCallback(async (payload: { name: string; email: string; password: string }) => {
    const { data } = await api.post('/auth/register', payload);
    persist(data.token, data.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('topcit_token');
    localStorage.removeItem('topcit_user');
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout }),
    [user, token, loading, login, register, logout]
  );

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return ctx;
};

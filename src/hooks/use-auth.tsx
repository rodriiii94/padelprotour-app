import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import * as authApi from '@/api/auth';
import { getToken, setToken as persistToken } from '@/api/client';
import type { RegisterResult, User } from '@/api/types';

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  login: (input: { email: string; password: string }) => Promise<void>;
  register: (input: {
    name: string;
    email: string;
    password: string;
  }) => Promise<RegisterResult>;
  verifyEmail: (input: { token: string }) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        setUser(await authApi.me());
      } catch {
        await persistToken(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (input: { email: string; password: string }) => {
    const { token, user } = await authApi.login(input);
    await persistToken(token);
    setUser(user);
  }, []);

  // La cuenta se crea sin verificar y sin token — no se inicia sesión aquí,
  // el usuario debe confirmar el email antes de poder entrar.
  const register = useCallback(
    (input: { name: string; email: string; password: string }) => authApi.register(input),
    []
  );

  const verifyEmail = useCallback(async (input: { token: string }) => {
    const { token, user } = await authApi.verifyEmail(input);
    await persistToken(token);
    setUser(user);
  }, []);

  const loginWithGoogle = useCallback(async (idToken: string) => {
    const { token, user } = await authApi.loginWithGoogle({ id_token: idToken });
    await persistToken(token);
    setUser(user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      await persistToken(null);
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, login, register, verifyEmail, loginWithGoogle, logout }),
    [user, isLoading, login, register, verifyEmail, loginWithGoogle, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  fetchCurrentUser,
  logout as apiLogout,
  startGoogleLogin,
  type AuthUser,
} from "@/lib/auth";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  signInWithGoogle: () => void;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const u = await fetchCurrentUser();
    setUser(u);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const signInWithGoogle = useCallback(() => {
    startGoogleLogin();
  }, []);

  const signOut = useCallback(async () => {
    await apiLogout();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, signInWithGoogle, signOut, refresh }),
    [user, loading, signInWithGoogle, signOut, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}

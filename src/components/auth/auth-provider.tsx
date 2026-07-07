"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Creator } from "@/lib/types";

interface AuthContextType {
  user: Creator | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  loginWithGitHub: (code: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const USER_KEY = "trendcart-user";

function getStoredUser(): Creator | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function persistUser(user: Creator | null) {
  if (typeof window === "undefined") return;
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(USER_KEY);
}

/* Server-managed via httpOnly cookie; this endpoint tells us if a session exists. */
async function checkSession(): Promise<boolean> {
  try {
    const res = await fetch("/api/auth/session", { credentials: "include" });
    return res.ok;
  } catch {
    return false;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Creator | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate: stored user + verify session via cookie
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const storedUser = getStoredUser();
      const hasSession = await checkSession();
      if (cancelled) return;
      if (hasSession && storedUser) {
        setUser(storedUser);
      } else if (!hasSession) {
        persistUser(null);
        setUser(null);
      }
      setIsLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.login({ email, password });
    setUser(res.creator);
    persistUser(res.creator);
  }, []);

  const register = useCallback(
    async (email: string, password: string, displayName: string) => {
      await api.register({ email, password, display_name: displayName });
      await login(email, password);
    },
    [login]
  );

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setUser(null);
    persistUser(null);
  }, []);

  const loginWithGoogle = useCallback(async (idToken: string) => {
    const res = await api.loginWithGoogle(idToken);
    setUser(res.creator);
    persistUser(res.creator);
  }, []);

  const loginWithGitHub = useCallback(async (code: string) => {
    const res = await api.loginWithGitHub(code);
    setUser(res.creator);
    persistUser(res.creator);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        loginWithGoogle,
        loginWithGitHub,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

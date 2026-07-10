"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
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

/** Access token TTL in ms — refresh 1 min before expiry (14 min). */
const REFRESH_INTERVAL_MS = 14 * 60 * 1000;

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

/** Check if a session exists by calling the backend session endpoint. */
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
  const refreshTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Auto-refresh: silently refresh access token before it expires ──
  const startRefreshTimer = useCallback(() => {
    // Clear any existing timer
    if (refreshTimer.current) clearInterval(refreshTimer.current);
    refreshTimer.current = setInterval(async () => {
      try {
        await api.refresh();
      } catch {
        // Refresh failed — session expired, clear user
        setUser(null);
        persistUser(null);
        if (refreshTimer.current) clearInterval(refreshTimer.current);
      }
    }, REFRESH_INTERVAL_MS);
  }, []);

  const stopRefreshTimer = useCallback(() => {
    if (refreshTimer.current) {
      clearInterval(refreshTimer.current);
      refreshTimer.current = null;
    }
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => stopRefreshTimer();
  }, [stopRefreshTimer]);

  // Hydrate: stored user + verify session via cookie
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const storedUser = getStoredUser();
      const hasSession = await checkSession();
      if (cancelled) return;
      if (hasSession && storedUser) {
        setUser(storedUser);
        startRefreshTimer();
      } else if (!hasSession) {
        persistUser(null);
        setUser(null);
      }
      setIsLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [startRefreshTimer]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.login({ email, password });
    setUser(res.creator);
    persistUser(res.creator);
    startRefreshTimer();
  }, [startRefreshTimer]);

  const register = useCallback(
    async (email: string, password: string, displayName: string) => {
      await api.register({ email, password, display_name: displayName });
      await login(email, password);
    },
    [login]
  );

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      // Ignore logout errors — clear local state regardless
    }
    stopRefreshTimer();
    setUser(null);
    persistUser(null);
  }, [stopRefreshTimer]);

  const loginWithGoogle = useCallback(async (idToken: string) => {
    const res = await api.loginWithGoogle(idToken);
    setUser(res.creator);
    persistUser(res.creator);
    startRefreshTimer();
  }, [startRefreshTimer]);

  const loginWithGitHub = useCallback(async (code: string) => {
    const res = await api.loginWithGitHub(code);
    setUser(res.creator);
    persistUser(res.creator);
    startRefreshTimer();
  }, [startRefreshTimer]);

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

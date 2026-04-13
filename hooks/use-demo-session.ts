"use client";

import { useState, useEffect, useCallback } from "react";
import type { Usuario } from "@/lib/types";

type SessionUser = Usuario;
type DemoUser = Usuario & { isReadOnly?: boolean };

export interface UseDemoSessionReturn {
  /** Demo user object if demo session is active */
  demoUser: DemoUser | null;
  /** Active server session (non-demo) */
  sessionUser: SessionUser | null;
  /** Combined active user (session or demo) */
  user: SessionUser | DemoUser | null;
  /** Setter for demo user (useful for manual updates after auth) */
  setDemoUser: (user: DemoUser | null) => void;
  /** Combined auth state: true if either real session or demo session exists */
  isAuthenticated: boolean;
  /** Refreshes the demo session manually */
  refreshDemoSession: () => Promise<boolean>;
  /** Current user ID from session or demo */
  userId: string | undefined;
}

/**
 * Hook to manage demo session state.
 * Automatically detects demo_public cookie and fetches server session
 * when no real Neon auth session exists.
 */
export function useDemoSession(): UseDemoSessionReturn {
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [demoUser, setDemoUser] = useState<DemoUser | null>(null);

  const refreshDemoSession = useCallback(async () => {
    try {
      const { fetchServerSessionWithRetry } = await import("@/lib/auth/client");
      const user = await fetchServerSessionWithRetry({
        attempts: 4,
        initialDelayMs: 200,
      });

      if (!user) {
        setSessionUser(null);
        setDemoUser(null);
        return false;
      }

      const typedUser = user as SessionUser;

      const cookies = typeof document !== "undefined" ? document.cookie : "";
      const isDemo =
        cookies.includes("demo_public=1") || Boolean(typedUser.isReadOnly);

      if (isDemo) {
        setDemoUser(typedUser as DemoUser);
        setSessionUser(null);
      } else {
        setSessionUser(typedUser);
        setDemoUser(null);
      }

      return true;
    } catch {
      // Ignore errors - demo session will simply not be set
      setSessionUser(null);
      setDemoUser(null);
      return false;
    }
  }, []);

  useEffect(() => {
    void refreshDemoSession();
  }, [refreshDemoSession]);

  // Listen for demo session updates from auth-modal
  useEffect(() => {
    const handleDemoSessionUpdate = () => {
      void refreshDemoSession();
    };
    window.addEventListener("demo-session-updated", handleDemoSessionUpdate);
    return () =>
      window.removeEventListener(
        "demo-session-updated",
        handleDemoSessionUpdate,
      );
  }, [refreshDemoSession]);

  const isAuthenticated = !!sessionUser || !!demoUser;
  const userId = sessionUser?.id ?? demoUser?.id;
  const activeUser = sessionUser ?? demoUser;

  return {
    sessionUser,
    demoUser,
    user: activeUser,
    setDemoUser,
    isAuthenticated,
    refreshDemoSession,
    userId,
  };
}

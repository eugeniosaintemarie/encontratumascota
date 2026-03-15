"use client"

import { useState, useEffect, useCallback } from "react"

export interface UseDemoSessionReturn {
  /** Demo user object if demo session is active */
  demoUser: any | null
  /** Setter for demo user (useful for manual updates after auth) */
  setDemoUser: (user: any | null) => void
  /** Combined auth state: true if either real session or demo session exists */
  isAuthenticated: boolean
  /** Refreshes the demo session manually */
  refreshDemoSession: () => Promise<void>
  /** Current user ID from session or demo */
  userId: string | undefined
}

/**
 * Hook to manage demo session state.
 * Automatically detects demo_public cookie and fetches server session
 * when no real Neon auth session exists.
 */
export function useDemoSession(): UseDemoSessionReturn {
  const [sessionUser, setSessionUser] = useState<any | null>(null)
  const [demoUser, setDemoUser] = useState<any | null>(null)

  const refreshDemoSession = useCallback(async () => {
    try {
      const { fetchServerSession } = await import("@/lib/auth/client")
      const user = await fetchServerSession()

      if (!user) {
        setSessionUser(null)
        setDemoUser(null)
        return
      }

      const cookies = typeof document !== "undefined" ? document.cookie : ""
      const isDemo = cookies.includes("demo_public=1") || Boolean((user as any)?.isReadOnly)

      if (isDemo) {
        setDemoUser(user)
        setSessionUser(null)
      } else {
        setSessionUser(user)
        setDemoUser(null)
      }
    } catch {
      // Ignore errors - demo session will simply not be set
    }
  }, [])

  useEffect(() => {
    void refreshDemoSession()
  }, [refreshDemoSession])

  // Listen for demo session updates from auth-modal
  useEffect(() => {
    const handleDemoSessionUpdate = () => {
      void refreshDemoSession()
    }
    window.addEventListener("demo-session-updated", handleDemoSessionUpdate)
    return () => window.removeEventListener("demo-session-updated", handleDemoSessionUpdate)
  }, [refreshDemoSession])

  const isAuthenticated = !!sessionUser || !!demoUser
  const userId = sessionUser?.id ?? demoUser?.id

  return {
    demoUser,
    setDemoUser,
    isAuthenticated,
    refreshDemoSession,
    userId,
  }
}

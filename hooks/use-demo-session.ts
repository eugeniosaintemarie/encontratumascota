"use client"

import { useState, useEffect, useCallback } from "react"
import { authClient } from "@/lib/auth/client"

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
  const { data: session } = authClient.useSession()
  const [demoUser, setDemoUser] = useState<any | null>(null)

  const refreshDemoSession = useCallback(async () => {
    if (session?.user) return

    const cookies = typeof document !== "undefined" ? document.cookie : ""
    if (!cookies.includes("demo_public=1")) return

    try {
      const { fetchServerSession } = await import("@/lib/auth/client")
      const user = await fetchServerSession()
      if (user) setDemoUser(user)
    } catch {
      // Ignore errors - demo session will simply not be set
    }
  }, [session])

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

  const isAuthenticated = !!session?.user || !!demoUser
  const userId = session?.user?.id ?? demoUser?.id

  return {
    demoUser,
    setDemoUser,
    isAuthenticated,
    refreshDemoSession,
    userId,
  }
}

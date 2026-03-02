"use client"

import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from "react"
import { useDemoSession } from "@/hooks/use-demo-session"
import { logout as authLogout } from "@/lib/auth/client"

interface AuthModalState {
  isOpen: boolean
  initialView: "login" | "register"
}

interface AuthContextType {
  // Auth state
  isAuthenticated: boolean
  userId: string | undefined
  demoUser: any | null
  
  // Modal state
  authModal: AuthModalState
  isPublicarModalOpen: boolean
  isPerfilModalOpen: boolean
  pendingPublicacionId: string | null
  
  // Actions
  openAuthModal: (view?: "login" | "register") => void
  closeAuthModal: () => void
  openPublicarModal: () => void
  closePublicarModal: () => void
  openPerfilModal: () => void
  closePerfilModal: () => void
  logout: () => void
  requireAuth: (publicacionId?: string) => void
  clearPendingPublicacion: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  // Auth state from demo session hook
  const { demoUser, setDemoUser, isAuthenticated, userId } = useDemoSession()
  
  // Modal states
  const [authModal, setAuthModal] = useState<AuthModalState>({
    isOpen: false,
    initialView: "login",
  })
  const [isPublicarModalOpen, setIsPublicarModalOpen] = useState(false)
  const [isPerfilModalOpen, setIsPerfilModalOpen] = useState(false)
  const [pendingPublicacionId, setPendingPublicacionId] = useState<string | null>(null)

  // Auth modal actions
  const openAuthModal = useCallback((view: "login" | "register" = "login") => {
    setAuthModal({ isOpen: true, initialView: view })
  }, [])

  const closeAuthModal = useCallback(() => {
    setAuthModal((prev) => ({ ...prev, isOpen: false }))
  }, [])

  // Publicar modal actions
  const openPublicarModal = useCallback(() => {
    setIsPublicarModalOpen(true)
  }, [])

  const closePublicarModal = useCallback(() => {
    setIsPublicarModalOpen(false)
  }, [])

  // Perfil modal actions
  const openPerfilModal = useCallback(() => {
    setIsPerfilModalOpen(true)
  }, [])

  const closePerfilModal = useCallback(() => {
    setIsPerfilModalOpen(false)
  }, [])

  // Logout action
  const logout = useCallback(() => {
    authLogout()
  }, [])

  // Require auth action
  const requireAuth = useCallback((publicacionId?: string) => {
    if (publicacionId) {
      setPendingPublicacionId(publicacionId)
    }
    setAuthModal({ isOpen: true, initialView: "login" })
  }, [])

  const clearPendingPublicacion = useCallback(() => {
    setPendingPublicacionId(null)
  }, [])

  const value = useMemo(
    () => ({
      isAuthenticated,
      userId,
      demoUser,
      authModal,
      isPublicarModalOpen,
      isPerfilModalOpen,
      pendingPublicacionId,
      openAuthModal,
      closeAuthModal,
      openPublicarModal,
      closePublicarModal,
      openPerfilModal,
      closePerfilModal,
      logout,
      requireAuth,
      clearPendingPublicacion,
    }),
    [
      isAuthenticated,
      userId,
      demoUser,
      authModal,
      isPublicarModalOpen,
      isPerfilModalOpen,
      pendingPublicacionId,
      openAuthModal,
      closeAuthModal,
      openPublicarModal,
      closePublicarModal,
      openPerfilModal,
      closePerfilModal,
      logout,
      requireAuth,
      clearPendingPublicacion,
    ]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider")
  }
  return context
}

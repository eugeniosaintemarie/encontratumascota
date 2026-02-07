"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { PublicacionCard } from "@/components/publicacion-card"
import { AuthModal } from "@/components/auth-modal"
import { PublicarModal } from "@/components/publicar-modal"
import { PerfilModal } from "@/components/perfil-modal"
import { getCurrentUser, logout } from "@/lib/auth"
import type { Publicacion, Usuario } from "@/lib/types"
import { ArrowLeft } from "lucide-react"

interface PublicacionDetailProps {
  publicacion: Publicacion
}

export function PublicacionDetail({ publicacion }: PublicacionDetailProps) {
  const router = useRouter()
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isPublicarModalOpen, setIsPublicarModalOpen] = useState(false)
  const [isPerfilModalOpen, setIsPerfilModalOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUserState] = useState<Usuario | null>(null)

  useEffect(() => {
    const user = getCurrentUser()
    if (user) {
      setCurrentUserState(user)
      setIsAuthenticated(true)
    }
  }, [])

  const handleLogout = useCallback(() => {
    logout()
    setCurrentUserState(null)
    setIsAuthenticated(false)
  }, [])

  const handleAuthSuccess = useCallback(() => {
    const user = getCurrentUser()
    setCurrentUserState(user)
    setIsAuthenticated(true)
    setIsAuthModalOpen(false)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Header
        onPublicarClick={() => setIsPublicarModalOpen(true)}
        onAccederClick={() => setIsAuthModalOpen(true)}
        isAuthenticated={isAuthenticated}
        onPerfilClick={() => setIsPerfilModalOpen(true)}
        onLogout={handleLogout}
      />
      <main className="mx-auto max-w-lg px-4 pt-8 pb-8">
        <button
          onClick={() => router.push("/")}
          className="inline-flex items-center gap-2 text-sm text-primary hover:underline mb-6 group transition-all"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Volver
        </button>

        <PublicacionCard
          publicacion={publicacion}
          isAuthenticated={isAuthenticated}
          onRequireAuth={() => setIsAuthModalOpen(true)}
        />
      </main>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      <PublicarModal
        isOpen={isPublicarModalOpen}
        onClose={() => setIsPublicarModalOpen(false)}
        isAuthenticated={isAuthenticated}
        onRequireAuth={() => setIsAuthModalOpen(true)}
      />

      <PerfilModal
        isOpen={isPerfilModalOpen}
        onClose={() => setIsPerfilModalOpen(false)}
        currentUser={currentUser}
        onLogout={handleLogout}
      />
    </div>
  )
}

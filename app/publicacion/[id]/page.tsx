"use client"

import { usePublicaciones } from "@/lib/publicaciones-context"
import { useParams, useRouter } from "next/navigation"
import { PublicacionCard } from "@/components/publicacion-card"
import { Header } from "@/components/header"
import { useState, useEffect, useCallback } from "react"
import { getCurrentUser, logout } from "@/lib/auth"
import type { Usuario } from "@/lib/types"
import { AuthModal } from "@/components/auth-modal"
import { PerfilModal } from "@/components/perfil-modal"
import { PublicarModal } from "@/components/publicar-modal"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function PublicacionPage() {
  const params = useParams()
  const router = useRouter()
  const { publicaciones } = usePublicaciones()
  const publicacion = publicaciones.find((p) => p.id === params.id)

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

  if (!publicacion) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Publicación no encontrada</h1>
        <p className="text-muted-foreground mb-8">La publicación que buscas no existe o ha sido eliminada.</p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
        >
          Volver al inicio
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        onPublicarClick={() => setIsPublicarModalOpen(true)}
        onAccederClick={() => setIsAuthModalOpen(true)}
        isAuthenticated={isAuthenticated}
        onPerfilClick={() => setIsPerfilModalOpen(true)}
        onLogout={handleLogout}
      />
      <main className="mx-auto max-w-2xl px-4 pt-8 pb-8">
        <button
          onClick={() => router.back()}
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

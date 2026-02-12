"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { PublicacionCard } from "@/components/publicacion-card"
import { AuthModal } from "@/components/auth-modal"
import { PublicarModal } from "@/components/publicar-modal"
import { PerfilModal } from "@/components/perfil-modal"
import { Footer } from "@/components/footer"
import { authClient, logout } from "@/lib/auth/client"
import { mapNeonUser } from "@/lib/auth"
import type { Publicacion } from "@/lib/types"
import { ArrowLeft } from "lucide-react"

interface PublicacionDetailProps {
  publicacion: Publicacion
}

export function PublicacionDetail({ publicacion }: PublicacionDetailProps) {
  const router = useRouter()
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isPublicarModalOpen, setIsPublicarModalOpen] = useState(false)
  const [isPerfilModalOpen, setIsPerfilModalOpen] = useState(false)

  const { data: session } = authClient.useSession()
  const isAuthenticated = !!session?.user
  const currentUser = session?.user ? mapNeonUser(session.user) : null

  const handleLogout = useCallback(() => {
    logout()
  }, [])

  const handleAuthSuccess = useCallback(() => {
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

      <Footer />

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

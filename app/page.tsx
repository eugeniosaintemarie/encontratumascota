"use client"

import { useCallback } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ListadoPublicaciones } from "@/components/listado-publicaciones"
import { AuthModal } from "@/components/auth-modal"
import { PublicarModal } from "@/components/publicar-modal"
import { PerfilModal } from "@/components/perfil-modal"
import { useAuth } from "@/lib/auth-context"
import { useDemoSession } from "@/hooks/use-demo-session"
import { mapNeonUser } from "@/lib/auth"

export default function HomePage() {
  const {
    isAuthenticated,
    authModal,
    closeAuthModal,
    isPublicarModalOpen,
    closePublicarModal,
    isPerfilModalOpen,
    closePerfilModal,
    requireAuth,
    pendingPublicacionId,
    clearPendingPublicacion,
    logout,
  } = useAuth()
  
  const { user } = useDemoSession()
  const currentUser = user ? mapNeonUser(user) : null

  const handleAuthSuccess = useCallback(() => {
    closeAuthModal()
    
    // Si hay una publicacion pendiente, hacer scroll hacia ella
    if (pendingPublicacionId !== null) {
      setTimeout(() => {
        const element = document.getElementById(`publicacion-${pendingPublicacionId}`)
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" })
          element.classList.add("ring-2", "ring-primary", "ring-offset-2")
          setTimeout(() => {
            element.classList.remove("ring-2", "ring-primary", "ring-offset-2")
          }, 2000)
        }
        clearPendingPublicacion()
      }, 100)
    }
  }, [closeAuthModal, pendingPublicacionId, clearPendingPublicacion])

  return (
    <div className="min-h-screen bg-background">
        <Header />
        <main id="main" className="mx-auto max-w-7xl px-4 pt-4 pb-8" tabIndex={-1}>
          <ListadoPublicaciones 
            isAuthenticated={isAuthenticated} 
            onRequireAuth={requireAuth}
          />
        </main>
        <Footer />

        <AuthModal
          isOpen={authModal.isOpen}
          onClose={closeAuthModal}
          initialView={authModal.initialView}
          onAuthSuccess={handleAuthSuccess}
        />

        <PublicarModal
          isOpen={isPublicarModalOpen}
          onClose={closePublicarModal}
          isAuthenticated={isAuthenticated}
          onRequireAuth={() => requireAuth()}
        />

        <PerfilModal
          isOpen={isPerfilModalOpen}
          onClose={closePerfilModal}
          currentUser={currentUser}
          onLogout={logout}
        />
      </div>
    )
  }


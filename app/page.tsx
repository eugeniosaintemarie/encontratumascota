"use client"

import { useState, useCallback, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ListadoPublicaciones } from "@/components/listado-publicaciones"
import { AuthModal } from "@/components/auth-modal"
import { PublicarModal } from "@/components/publicar-modal"
import { PerfilModal } from "@/components/perfil-modal"
import { authClient, logout } from "@/lib/auth/client"
import { mapNeonUser } from "@/lib/auth"

export default function HomePage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isPublicarModalOpen, setIsPublicarModalOpen] = useState(false)
  const [isPerfilModalOpen, setIsPerfilModalOpen] = useState(false)
  const [authInitialView, setAuthInitialView] = useState<"login" | "register">("login")
  const [pendingPublicacionId, setPendingPublicacionId] = useState<string | null>(null)

  const { data: session } = authClient.useSession()
  const [demoUser, setDemoUser] = useState<any | null>(null)

  const isAuthenticated = !!session?.user || !!demoUser
  const currentUser = session?.user ? mapNeonUser(session.user) : demoUser ? mapNeonUser(demoUser) : null

  const handlePublicarClick = useCallback(() => {
    setIsPublicarModalOpen(true)
  }, [])

  const handleAccederClick = useCallback(() => {
    setAuthInitialView("login")
    setPendingPublicacionId(null)
    setIsAuthModalOpen(true)
  }, [])

  const handlePerfilClick = useCallback(() => {
    setIsPerfilModalOpen(true)
  }, [])

  const handleLogout = useCallback(() => {
    logout()
  }, [])

  const handleAuthSuccess = useCallback(() => {
    setIsAuthModalOpen(false)
    // Try fetching server session in case demo login was used (demo_public cookie)
    void (async () => {
      try {
        const user = await (await import("@/lib/auth/client")).fetchServerSession()
        if (user) setDemoUser(user)
      } catch {}
    })()
    
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
        setPendingPublicacionId(null)
      }, 100)
    }
  }, [pendingPublicacionId])

  const handleRequireAuthFromCard = useCallback((publicacionId: string) => {
    setPendingPublicacionId(publicacionId)
    setAuthInitialView("login")
    setIsAuthModalOpen(true)
  }, [])

  // On mount, if there's no neon session but demo_public cookie exists, fetch server session
  useEffect(() => {
    if (!session?.user) {
      const cookies = typeof document !== 'undefined' ? document.cookie : ''
      if (cookies.includes('demo_public=1')) {
        void (async () => {
          try {
            const user = await (await import("@/lib/auth/client")).fetchServerSession()
            if (user) setDemoUser(user)
          } catch {}
        })()
      }
    }
  }, [session])

  const handleRequireAuth = useCallback(() => {
    setAuthInitialView("login")
    setIsAuthModalOpen(true)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onPublicarClick={handlePublicarClick} 
        onAccederClick={handleAccederClick}
        isAuthenticated={isAuthenticated}
        onPerfilClick={handlePerfilClick}
        onLogout={handleLogout}
      />
      <main className="mx-auto max-w-7xl px-4 pt-4 pb-8">
        <ListadoPublicaciones 
          isAuthenticated={isAuthenticated} 
          onRequireAuth={handleRequireAuthFromCard}
        />
      </main>
      <Footer />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialView={authInitialView}
        onAuthSuccess={handleAuthSuccess}
      />

      <PublicarModal
        isOpen={isPublicarModalOpen}
        onClose={() => setIsPublicarModalOpen(false)}
        isAuthenticated={isAuthenticated}
        onRequireAuth={handleRequireAuth}
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

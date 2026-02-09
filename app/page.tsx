"use client"

import { useState, useCallback } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ListadoPublicaciones } from "@/components/listado-publicaciones"
import { AuthModal } from "@/components/auth-modal"
import { PublicarModal } from "@/components/publicar-modal"
import { PerfilModal } from "@/components/perfil-modal"
import { authClient } from "@/lib/auth/client"
import { mapNeonUser } from "@/lib/auth"

export default function HomePage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isPublicarModalOpen, setIsPublicarModalOpen] = useState(false)
  const [isPerfilModalOpen, setIsPerfilModalOpen] = useState(false)
  const [authInitialView, setAuthInitialView] = useState<"login" | "register">("login")
  const [pendingPublicacionId, setPendingPublicacionId] = useState<string | null>(null)

  const { data: session } = authClient.useSession()
  const isAuthenticated = !!session?.user
  const currentUser = session?.user ? mapNeonUser(session.user) : null

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

  const handleLogout = useCallback(async () => {
    try {
      await fetch("/api/auth/sign-out", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      })
    } catch (e) {
      // Ignorar errores de red — limpiamos igual
    }
    // Borrar cookies accesibles desde el cliente (por si acaso)
    document.cookie.split(";").forEach((c) => {
      const name = c.split("=")[0].trim()
      if (name.includes("neon-auth") || name.includes("better-auth") || name.includes("session")) {
        document.cookie = `${name}=; Max-Age=0; Path=/`
        document.cookie = `${name}=; Max-Age=0; Path=/; Secure`
      }
    })
    window.location.href = "/"
  }, [])

  const handleAuthSuccess = useCallback(() => {
    setIsAuthModalOpen(false)
    
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

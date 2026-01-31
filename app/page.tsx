"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { ListadoPublicaciones } from "@/components/listado-publicaciones"
import { AuthModal } from "@/components/auth-modal"
import { PublicarModal } from "@/components/publicar-modal"
import { PerfilModal } from "@/components/perfil-modal"
import { getCurrentUser, logout } from "@/lib/auth"
import type { Usuario } from "@/lib/types"

export default function HomePage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isPublicarModalOpen, setIsPublicarModalOpen] = useState(false)
  const [isPerfilModalOpen, setIsPerfilModalOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUserState] = useState<Usuario | null>(null)
  const [authInitialView, setAuthInitialView] = useState<"login" | "register">("login")
  const [pendingPublicacionId, setPendingPublicacionId] = useState<string | null>(null)

  // Verificar si hay sesion guardada al cargar
  useEffect(() => {
    const user = getCurrentUser()
    if (user) {
      setCurrentUserState(user)
      setIsAuthenticated(true)
    }
  }, [])

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
    setCurrentUserState(null)
    setIsAuthenticated(false)
  }, [])

  const handleAuthSuccess = useCallback(() => {
    const user = getCurrentUser()
    setCurrentUserState(user)
    setIsAuthenticated(true)
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
      <footer className="border-t border-border">
        <div className="bg-primary/10 py-4">
          <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12">
            <p className="text-sm text-foreground flex items-center gap-2">
              <span className="text-2xl font-bold text-primary leading-none">127</span>
              <span>mascotas reunidas con sus familias</span>
            </p>
            <p className="text-sm text-foreground text-center sm:text-left">
              No encontras tu mascota?{" "}
              <Link href="/transitadas" className="text-primary hover:underline font-medium">
                Fijate si le dieron transito ubicandola con otra familia
              </Link>
            </p>
          </div>
        </div>
        <div className="py-6 bg-background">
          <div className="mx-auto max-w-7xl px-4 text-center text-sm text-foreground/60">
            <p>
              Encontra Tu Mascota - Plataforma colaborativa para reunir mascotas
              perdidas con sus familias
            </p>
          </div>
        </div>
      </footer>

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

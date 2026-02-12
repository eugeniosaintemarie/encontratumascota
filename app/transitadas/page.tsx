"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { PublicacionCard } from "@/components/publicacion-card"
import { Header } from "@/components/header"
import { AuthModal } from "@/components/auth-modal"
import { PublicarModal } from "@/components/publicar-modal"
import { PerfilModal } from "@/components/perfil-modal"
import { PawPrint } from "lucide-react"
import { Footer } from "@/components/footer"
import { usePublicaciones } from "@/lib/publicaciones-context"
import { getCurrentUser, logout as doLogout } from "@/lib/auth"
import type { Especie, Sexo, Usuario } from "@/lib/types"

export default function TransitadasPage() {
  const [especie, setEspecie] = useState<Especie | "todos">("todos")
  const [sexo, setSexo] = useState<Sexo | "todos">("todos")
  const [ubicacion, setUbicacion] = useState("")

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isPublicarModalOpen, setIsPublicarModalOpen] = useState(false)
  const [isPerfilModalOpen, setIsPerfilModalOpen] = useState(false)

  // Verificar sesion guardada al cargar
  useEffect(() => {
    const user = getCurrentUser()
    if (user) {
      setCurrentUser(user)
      setIsAuthenticated(true)
    }
  }, [])

  const { publicaciones } = usePublicaciones()

  const publicacionesTransito = useMemo(() => {
    return publicaciones.filter((pub) => {
      if (especie !== "todos" && pub.mascota.especie !== especie) return false
      if (sexo !== "todos" && pub.mascota.sexo !== sexo) return false
      if (
        ubicacion &&
        !pub.ubicacion.toLowerCase().includes(ubicacion.toLowerCase())
      )
        return false
      return pub.enTransito === true
    })
  }, [especie, sexo, ubicacion, publicaciones])

  const handlePublicarClick = useCallback(() => {
    if (isAuthenticated) {
      setIsPublicarModalOpen(true)
    } else {
      setIsAuthModalOpen(true)
    }
  }, [isAuthenticated])

  const handleAuthSuccess = useCallback(() => {
    const user = getCurrentUser()
    setCurrentUser(user)
    setIsAuthenticated(true)
    setIsAuthModalOpen(false)
  }, [])

  const handleLogout = useCallback(() => {
    doLogout()
    setIsAuthenticated(false)
    setCurrentUser(null)
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header
        onPublicarClick={handlePublicarClick}
        onAccederClick={() => setIsAuthModalOpen(true)}
        isAuthenticated={isAuthenticated}
        onPerfilClick={() => setIsPerfilModalOpen(true)}
        onLogout={handleLogout}
        showBackButton
      />

      <main className="mx-auto max-w-7xl px-4 pt-4 pb-8 flex-1 w-full">
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <h2 className="text-lg font-semibold text-foreground shrink-0">
              Mascotas en tránsito esperando a sus dueños:
            </h2>
            <div className="rounded-xl border border-primary bg-primary p-4 shadow-sm flex-1">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <input
                    placeholder="Buscar por ubicacion..."
                    value={ubicacion}
                    onChange={(e) => setUbicacion(e.target.value)}
                    className="flex h-9 w-full rounded-md border bg-white/10 border-white/30 px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-white/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    style={{ color: 'white' }}
                  />
                </div>
                <div className="flex gap-3">
                  <select
                    value={especie}
                    onChange={(e) => setEspecie(e.target.value as Especie | "todos")}
                    className="h-9 w-[140px] rounded-md border bg-white/10 border-white/30 px-3 text-sm text-white"
                  >
                    <option value="todos">Tipo</option>
                    <option value="perro">Perro</option>
                    <option value="gato">Gato</option>
                    <option value="otro">Otro</option>
                  </select>
                  <select
                    value={sexo}
                    onChange={(e) => setSexo(e.target.value as Sexo | "todos")}
                    className="h-9 w-[140px] rounded-md border bg-white/10 border-white/30 px-3 text-sm text-white"
                  >
                    <option value="todos">Género</option>
                    <option value="macho">Macho</option>
                    <option value="hembra">Hembra</option>
                    <option value="desconocido">Desconocido</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {publicacionesTransito.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {publicacionesTransito.map((publicacion) => (
                <PublicacionCard
                  key={publicacion.id}
                  publicacion={publicacion}
                  isAuthenticated={isAuthenticated}
                  onRequireAuth={() => setIsAuthModalOpen(true)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 py-16">
              <PawPrint className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <h3 className="text-lg font-medium text-foreground">
                No hay mascotas en tránsito
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Las mascotas que se marquen como "en tránsito" aparecerán aquí
              </p>
            </div>
          )}
        </div>
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
        currentUser={currentUser}
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

"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { useItemsPerPage } from "@/hooks/use-items-per-page"
import { PublicacionCard } from "@/components/publicacion-card"
import { FiltrosPublicaciones } from "@/components/filtros-publicaciones"
import { Header } from "@/components/header"
import { AuthModal } from "@/components/auth-modal"
import { PublicarModal } from "@/components/publicar-modal"
import { PerfilModal } from "@/components/perfil-modal"
import { PawPrint, ChevronLeft, ChevronRight } from "lucide-react"
import { Footer } from "@/components/footer"
import { usePublicaciones } from "@/lib/publicaciones-context"
import { authClient, logout } from "@/lib/auth/client"
import { mapNeonUser } from "@/lib/auth"
import type { Especie, Sexo } from "@/lib/types"
import { Button } from "@/components/ui/button"

export default function BuscadosPage() {
  const [especie, setEspecie] = useState<Especie | "todos">("todos")
  const [sexo, setSexo] = useState<Sexo | "todos">("todos")
  const [ubicacion, setUbicacion] = useState("")
  const [raza, setRaza] = useState<string | "todos">("todos")
  const [fechaDesde, setFechaDesde] = useState<string | undefined>(undefined)
  const [currentPage, setCurrentPage] = useState(1)

  // Auth state via Neon Auth
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isPublicarModalOpen, setIsPublicarModalOpen] = useState(false)
  const [isPerfilModalOpen, setIsPerfilModalOpen] = useState(false)

  const { data: session } = authClient.useSession()
  const [demoUser, setDemoUser] = useState<any | null>(null)

  const isAuthenticated = !!session?.user || !!demoUser
  const currentUser = session?.user ? mapNeonUser(session.user) : demoUser ? mapNeonUser(demoUser) : null

  const { publicaciones } = usePublicaciones()
  const { itemsPerPage, columns } = useItemsPerPage()

  const publicacionesBuscadas = useMemo(() => {
    return publicaciones.filter((pub) => {
      // Solo mostrar publicaciones "buscadas" (mascotas perdidas por sus dueños)
      if (pub.tipoPublicacion !== "buscada") return false
      if (especie !== "todos" && pub.mascota.especie !== especie) return false
      if (raza !== "todos" && pub.mascota.raza !== raza) return false
      if (sexo !== "todos" && pub.mascota.sexo !== sexo) return false
      if (
        ubicacion &&
        !pub.ubicacion.toLowerCase().includes(ubicacion.toLowerCase())
      )
        return false
      // Filtrar por fechaDesde
      if (fechaDesde) {
        try {
          const since = new Date(fechaDesde)
          if (isNaN(since.getTime())) return false
          if (pub.fechaPublicacion < since) return false
        } catch { /* ignore parse errors */ }
      }
      // Solo mostrar activas
      return pub.activa
    })
  }, [especie, raza, sexo, ubicacion, fechaDesde, publicaciones])

  const totalPages = Math.ceil(publicacionesBuscadas.length / itemsPerPage)
  const paginatedPublicaciones = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return publicacionesBuscadas.slice(startIndex, startIndex + itemsPerPage)
  }, [publicacionesBuscadas, currentPage, itemsPerPage])

  const handlePublicarClick = useCallback(() => {
    if (isAuthenticated) {
      setIsPublicarModalOpen(true)
    } else {
      setIsAuthModalOpen(true)
    }
  }, [isAuthenticated])

  // On mount, if neon session missing but demo_public cookie set, fetch server session
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

  // Reset page when itemsPerPage changes (responsive)
  useEffect(() => {
    setCurrentPage(1)
  }, [itemsPerPage])

  const handleLogout = useCallback(() => {
    logout()
  }, [])

  const hasActiveFilters =
    especie !== "todos" || raza !== "todos" || sexo !== "todos" || ubicacion !== "" || !!fechaDesde

  const clearFilters = () => {
    setEspecie("todos")
    setRaza("todos")
    setSexo("todos")
    setUbicacion("")
    setFechaDesde(undefined)
    setCurrentPage(1)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header
        onPublicarClick={handlePublicarClick}
        onAccederClick={() => setIsAuthModalOpen(true)}
        isAuthenticated={isAuthenticated}
        onPerfilClick={() => setIsPerfilModalOpen(true)}
        onLogout={handleLogout}
      />

      <main className="mx-auto max-w-7xl px-4 pt-4 pb-8 flex-1 w-full">
        <div className="space-y-4">
          <FiltrosPublicaciones
            tipoPublicacion={"perdida"}
            especie={especie}
            raza={raza}
            sexo={sexo}
            ubicacion={ubicacion}
            fechaDesde={fechaDesde}
            transitoUrgente={false}
            hideTipoSelector={true}
            onTipoPublicacionChange={() => { /* noop: not applicable for buscados */ }}
            onEspecieChange={setEspecie}
            onRazaChange={setRaza}
            onSexoChange={setSexo}
            onUbicacionChange={setUbicacion}
            onFechaDesdeChange={setFechaDesde}
            onTransitoUrgenteChange={() => { /* noop */ }}
            onClearFilters={clearFilters}
            onSearch={() => {}}
            hasActiveFilters={hasActiveFilters}
          />

          {/* Grid */}
          {publicacionesBuscadas.length > 0 ? (
            <>
              <div
                className="grid gap-4"
                style={{
                  gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                }}
              >
                {paginatedPublicaciones.map((pub) => (
                  <PublicacionCard
                    key={pub.id}
                    publicacion={pub}
                    isAuthenticated={isAuthenticated}
                    onRequireAuth={() => setIsAuthModalOpen(true)}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Página {currentPage} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-full bg-muted p-6 mb-4">
                <PawPrint className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Todavía no hay mascotas que estén siendo buscadas por sus familias
              </h3>
              <p className="text-muted-foreground max-w-md">
                Las publicaciones de mascotas buscadas aparecerán aquí
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={() => setIsAuthModalOpen(false)}
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

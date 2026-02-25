"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { useItemsPerPage } from "@/hooks/use-items-per-page"
import { PublicacionCard } from "@/components/publicacion-card"
import { FiltrosPublicaciones } from "@/components/filtros-publicaciones"
import { Header } from "@/components/header"
import { AuthModal } from "@/components/auth-modal"
import { PublicarModal } from "@/components/publicar-modal"
import { PerfilModal } from "@/components/perfil-modal"
import { PawPrint } from "lucide-react"
import { Footer } from "@/components/footer"
import { usePublicaciones } from "@/lib/publicaciones-context"
import { authClient, logout } from "@/lib/auth/client"
import { mapNeonUser } from "@/lib/auth"
import type { Especie, Sexo } from "@/lib/types"

export default function ReunidasPage() {
  const [especie, setEspecie] = useState<Especie | "todos">("todos")
  const [sexo, setSexo] = useState<Sexo | "todos">("todos")
  const [ubicacion, setUbicacion] = useState("")
  const [raza, setRaza] = useState<string | "todos">("todos")

  // Auth state via Neon Auth
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isPublicarModalOpen, setIsPublicarModalOpen] = useState(false)
  const [isPerfilModalOpen, setIsPerfilModalOpen] = useState(false)

  const { data: session } = authClient.useSession()
  const [demoUser, setDemoUser] = useState<any | null>(null)

  const isAuthenticated = !!session?.user || !!demoUser
  const currentUser = session?.user ? mapNeonUser(session.user) : demoUser ? mapNeonUser(demoUser) : null

  const { publicaciones } = usePublicaciones()
  const itemsPerPage = useItemsPerPage()

  const publicacionesReunidas = useMemo(() => {
    return publicaciones.filter((pub) => {
      if (especie !== "todos" && pub.mascota.especie !== especie) return false
      if (raza !== "todos" && pub.mascota.raza !== raza) return false
      if (sexo !== "todos" && pub.mascota.sexo !== sexo) return false
      if (
        ubicacion &&
        !pub.ubicacion.toLowerCase().includes(ubicacion.toLowerCase())
      )
        return false
      // Reunidas = publicacion cerrada (no activa) y no en tránsito
      return pub.activa === false && pub.enTransito === false
    })
  }, [especie, raza, sexo, ubicacion, publicaciones])

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

  const handleLogout = useCallback(() => {
    logout()
  }, [])

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
            tipoPublicacion={"adopcion"}
            especie={especie}
            raza={raza}
            sexo={sexo}
            ubicacion={ubicacion}
            fechaDesde={undefined}
            transitoUrgente={false}
            onTipoPublicacionChange={() => { /* noop: fixed to adopcion */ }}
            hideTipoSelector={true}
            onEspecieChange={(v) => setEspecie(v)}
            onRazaChange={(v) => setRaza(v)}
            onSexoChange={(v) => setSexo(v)}
            onUbicacionChange={(v) => setUbicacion(v)}
            onFechaDesdeChange={() => {}}
            onTransitoUrgenteChange={() => {}}
            onClearFilters={() => {
              setEspecie("todos")
              setRaza("todos")
              setSexo("todos")
              setUbicacion("")
            }}
            onSearch={() => {}}
            hasActiveFilters={especie !== "todos" || raza !== "todos" || sexo !== "todos" || ubicacion !== ""}
          />

          {publicacionesReunidas.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {publicacionesReunidas.slice(0, itemsPerPage).map((publicacion) => (
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
                Todavía no hay mascotas que hayan sido reunidas con sus familias
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Las publicaciones cerradas aparecerán aquí
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

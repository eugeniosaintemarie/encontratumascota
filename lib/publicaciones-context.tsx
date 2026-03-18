"use client"

import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from "react"
import { toast } from "sonner"
import type { Publicacion } from "./types"

interface PublicacionesContextType {
  publicaciones: Publicacion[]
  loading: boolean
  cerrarPublicacion: (id: string, motivo: "encontrado_dueno" | "adoptado" | "en_transito" | "otro", transitoContacto?: { nombre: string; telefono: string; email: string }) => void
  agregarPublicacion: (publicacion: Omit<Publicacion, "id" | "fechaPublicacion">) => void
  actualizarPublicacion: (id: string, datos: Partial<Publicacion>) => void
  refetch: () => Promise<void>
}

const PublicacionesContext = createContext<PublicacionesContextType | null>(null)

export function PublicacionesProvider({ children }: { children: ReactNode }) {
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([])
  const [loading, setLoading] = useState(true)
  const isInitialLoadRef = useRef(true)

  // Mezcla in-place segura (Fisher-Yates) sobre una copia
  const shuffleArray = <T,>(arr: T[]) => {
    const a = arr.slice()
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const tmp = a[i]
      a[i] = a[j]
      a[j] = tmp
    }
    return a
  }

  // Intentar cargar desde la API (DB) al montar
  const fetchPublicaciones = useCallback(async (options?: { skipShuffle?: boolean }) => {
    try {
      // Si estamos en la ruta /reunidas, solicitamos también las publicaciones cerradas
      let url = "/api/publicaciones"
      try {
        if (typeof window !== "undefined" && window.location.pathname === "/reunidas") {
          url = "/api/publicaciones?soloActivas=false"
        }
      } catch {
        // Fallback to default URL if window is not available
      }

      const res = await fetch(url)
      if (!res.ok) {
        const errorText = await res.text()
        console.warn(
          `[Publicaciones Context] API returned ${res.status}:`,
          errorText
        )
        // Even on error, try to get JSON data (it might contain publicaciones)
        try {
          const data = JSON.parse(errorText)
          if (data.publicaciones && Array.isArray(data.publicaciones)) {
            const pubs = data.publicaciones.map((p: any) => ({
              ...p,
              fechaPublicacion: new Date(p.fechaPublicacion),
              fechaEncuentro: new Date(p.fechaEncuentro),
            }))
            const shouldShuffle = isInitialLoadRef.current && !options?.skipShuffle
            setPublicaciones(shouldShuffle ? shuffleArray(pubs) : pubs)
            isInitialLoadRef.current = false
          }
        } catch {
          // JSON parse failed, set empty state
          setPublicaciones([])
        }
      } else {
        const data = await res.json()
        if (data.publicaciones) {
          const pubs = data.publicaciones.map((p: any) => ({
            ...p,
            fechaPublicacion: new Date(p.fechaPublicacion),
            fechaEncuentro: new Date(p.fechaEncuentro),
          }))
          // Solo mezclar en la carga inicial para dar visibilidad a todas
          // En actualizaciones posteriores mantener el orden estable
          const shouldShuffle = isInitialLoadRef.current && !options?.skipShuffle
          setPublicaciones(shouldShuffle ? shuffleArray(pubs) : pubs)
          isInitialLoadRef.current = false
        }
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Error desconocido"
      console.error("Error cargando publicaciones:", e)
      toast.error(`Error al cargar las publicaciones: ${message}`)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPublicaciones()
  }, [fetchPublicaciones])

  const cerrarPublicacion = useCallback(async (id: string, motivo: "encontrado_dueno" | "adoptado" | "en_transito" | "otro", transitoContacto?: { nombre: string; telefono: string; email: string }, confirmarTransferenciaMultiple?: boolean) => {
    try {
      const res = await fetch(`/api/publicaciones/${id}/cerrar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ motivo, transitoContacto, confirmarTransferenciaMultiple }),
      })
      if (res.ok) {
        await fetchPublicaciones({ skipShuffle: true })
        toast.success("Publicación cerrada exitosamente")
      } else {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error || "Error al cerrar la publicación")
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Error de conexión"
      console.error("Error cerrando publicacion:", e)
      toast.error(`Error al cerrar la publicación: ${message}`)
    }
  }, [fetchPublicaciones])

  const agregarPublicacion = useCallback(async (publicacion: Omit<Publicacion, "id" | "fechaPublicacion">) => {
    try {
      const res = await fetch("/api/publicaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          especie: publicacion.mascota.especie,
          raza: publicacion.mascota.raza,
          sexo: publicacion.mascota.sexo,
          color: publicacion.mascota.color,
          descripcion: publicacion.mascota.descripcion,
          imagenUrl: publicacion.mascota.imagenUrl,
          ubicacion: publicacion.ubicacion,
          fechaEncuentro: publicacion.fechaEncuentro,
          contactoNombre: publicacion.contactoNombre,
          contactoTelefono: publicacion.contactoTelefono,
          contactoEmail: publicacion.contactoEmail,
          usuarioId: publicacion.usuarioId,
          transitoUrgente: publicacion.transitoUrgente ?? false,
        }),
      })
      if (res.ok) {
        await fetchPublicaciones({ skipShuffle: true })
      } else {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error || "Error al crear la publicación")
        throw new Error(data.error || "Error al crear la publicación")
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Error de conexión"
      console.error("Error creando publicacion:", e)
      toast.error(`Error al crear la publicación: ${message}`)
      throw e
    }
  }, [fetchPublicaciones])

  const actualizarPublicacion = useCallback(async (id: string, datos: Partial<Publicacion>) => {
    try {
      const res = await fetch(`/api/publicaciones/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
      })
      if (res.ok) {
        await fetchPublicaciones({ skipShuffle: true })
        toast.success("Publicación actualizada exitosamente")
      } else {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error || "Error al actualizar la publicación")
        throw new Error(data.error || "Error al actualizar la publicación")
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Error de conexión"
      console.error("Error actualizando publicacion:", e)
      toast.error(`Error al actualizar la publicación: ${message}`)
      throw e
    }
  }, [fetchPublicaciones])

  return (
    <PublicacionesContext.Provider
      value={{
        publicaciones,
        loading,
        cerrarPublicacion,
        agregarPublicacion,
        actualizarPublicacion,
        refetch: fetchPublicaciones,
      }}
    >
      {children}
    </PublicacionesContext.Provider>
  )
}

export function usePublicaciones() {
  const context = useContext(PublicacionesContext)
  if (!context) {
    throw new Error("usePublicaciones debe usarse dentro de PublicacionesProvider")
  }
  return context
}

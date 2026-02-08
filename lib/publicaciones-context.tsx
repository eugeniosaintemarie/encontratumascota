"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import type { Publicacion } from "./types"

interface PublicacionesContextType {
  publicaciones: Publicacion[]
  loading: boolean
  cerrarPublicacion: (id: string, motivo: "encontrado_dueno" | "adoptado" | "en_transito" | "otro") => void
  agregarPublicacion: (publicacion: Omit<Publicacion, "id" | "fechaPublicacion">) => void
  actualizarPublicacion: (id: string, datos: Partial<Publicacion>) => void
  refetch: () => Promise<void>
}

const PublicacionesContext = createContext<PublicacionesContextType | null>(null)

export function PublicacionesProvider({ children }: { children: ReactNode }) {
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([])
  const [loading, setLoading] = useState(true)

  // Intentar cargar desde la API (DB) al montar
  const fetchPublicaciones = useCallback(async () => {
    try {
      const res = await fetch("/api/publicaciones")
      if (res.ok) {
        const data = await res.json()
        if (data.publicaciones) {
          const pubs = data.publicaciones.map((p: any) => ({
            ...p,
            fechaPublicacion: new Date(p.fechaPublicacion),
            fechaEncuentro: new Date(p.fechaEncuentro),
          }))
          setPublicaciones(pubs)
        }
      }
    } catch (e) {
      console.error("Error cargando publicaciones:", e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPublicaciones()
  }, [fetchPublicaciones])

  const cerrarPublicacion = useCallback(async (id: string, motivo: "encontrado_dueno" | "adoptado" | "en_transito" | "otro") => {
    try {
      const res = await fetch(`/api/publicaciones/${id}/cerrar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ motivo }),
      })
      if (res.ok) {
        await fetchPublicaciones()
      }
    } catch {
      console.error("Error cerrando publicacion")
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
        await fetchPublicaciones()
      }
    } catch {
      console.error("Error creando publicacion")
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
        await fetchPublicaciones()
      }
    } catch {
      console.error("Error actualizando publicacion")
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

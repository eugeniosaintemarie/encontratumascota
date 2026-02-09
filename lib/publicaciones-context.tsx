"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import { publicacionesMock } from "./mock-data"
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
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>(publicacionesMock)
  const [loading, setLoading] = useState(true)
  const [usingDB, setUsingDB] = useState(false)

  // Intentar cargar desde la API (DB) al montar
  const fetchPublicaciones = useCallback(async () => {
    try {
      const res = await fetch("/api/publicaciones")
      if (res.ok) {
        const data = await res.json()
        if (data.publicaciones && data.publicaciones.length >= 0) {
          // Reconstituir fechas
          const pubs = data.publicaciones.map((p: any) => ({
            ...p,
            fechaPublicacion: new Date(p.fechaPublicacion),
            fechaEncuentro: new Date(p.fechaEncuentro),
          }))
          setPublicaciones(pubs)
          setUsingDB(true)
        }
      }
    } catch {
      // Si falla, quedarse con mock data
      console.log("DB no disponible, usando datos mock")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPublicaciones()
  }, [fetchPublicaciones])

  const cerrarPublicacion = useCallback(async (id: string, motivo: "encontrado_dueno" | "adoptado" | "en_transito" | "otro", transitoContacto?: { nombre: string; telefono: string; email: string }) => {
    if (usingDB) {
      try {
        const res = await fetch(`/api/publicaciones/${id}/cerrar`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ motivo, transitoContacto }),
        })
        if (res.ok) {
          await fetchPublicaciones()
          return
        }
      } catch {
        console.error("Error cerrando publicacion en DB")
      }
    }
    
    // Fallback: actualizar local
    setPublicaciones(prev => 
      prev.map(pub => {
        if (pub.id === id) {
          return {
            ...pub,
            activa: false,
            enTransito: motivo === "en_transito",
            transitoContactoNombre: transitoContacto?.nombre,
            transitoContactoTelefono: transitoContacto?.telefono,
            transitoContactoEmail: transitoContacto?.email,
          }
        }
        return pub
      })
    )
  }, [usingDB, fetchPublicaciones])

  const agregarPublicacion = useCallback(async (publicacion: Omit<Publicacion, "id" | "fechaPublicacion">) => {
    if (usingDB) {
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
          return
        }
      } catch {
        console.error("Error creando publicacion en DB")
      }
    }
    
    // Fallback: agregar local
    const nuevaPublicacion: Publicacion = {
      ...publicacion,
      id: `new-${Date.now()}`,
      fechaPublicacion: new Date(),
    }
    setPublicaciones(prev => [nuevaPublicacion, ...prev])
  }, [usingDB, fetchPublicaciones])

  const actualizarPublicacion = useCallback(async (id: string, datos: Partial<Publicacion>) => {
    if (usingDB) {
      try {
        const res = await fetch(`/api/publicaciones/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(datos),
        })
        if (res.ok) {
          await fetchPublicaciones()
          return
        }
      } catch {
        console.error("Error actualizando publicacion en DB")
      }
    }
    
    // Fallback: actualizar local
    setPublicaciones(prev =>
      prev.map(pub => (pub.id === id ? { ...pub, ...datos } : pub))
    )
  }, [usingDB, fetchPublicaciones])

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

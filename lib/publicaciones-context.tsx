"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { publicacionesMock } from "./mock-data"
import type { Publicacion } from "./types"

interface PublicacionesContextType {
  publicaciones: Publicacion[]
  cerrarPublicacion: (id: string, motivo: "encontrado_dueno" | "adoptado" | "en_transito" | "otro") => void
  agregarPublicacion: (publicacion: Omit<Publicacion, "id" | "fechaPublicacion">) => void
  actualizarPublicacion: (id: string, datos: Partial<Publicacion>) => void
}

const PublicacionesContext = createContext<PublicacionesContextType | null>(null)

export function PublicacionesProvider({ children }: { children: ReactNode }) {
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>(publicacionesMock)

  const cerrarPublicacion = useCallback((id: string, motivo: "encontrado_dueno" | "adoptado" | "en_transito" | "otro") => {
    setPublicaciones(prev => 
      prev.map(pub => {
        if (pub.id === id) {
          return {
            ...pub,
            activa: false,
            enTransito: motivo === "en_transito",
            motivoCierre: motivo,
          }
        }
        return pub
      })
    )
  }, [])

  const agregarPublicacion = useCallback((publicacion: Omit<Publicacion, "id" | "fechaPublicacion">) => {
    const nuevaPublicacion: Publicacion = {
      ...publicacion,
      id: `new-${Date.now()}`,
      fechaPublicacion: new Date(),
    }
    setPublicaciones(prev => [nuevaPublicacion, ...prev])
  }, [])

  const actualizarPublicacion = useCallback((id: string, datos: Partial<Publicacion>) => {
    setPublicaciones(prev =>
      prev.map(pub => (pub.id === id ? { ...pub, ...datos } : pub))
    )
  }, [])

  return (
    <PublicacionesContext.Provider
      value={{
        publicaciones,
        cerrarPublicacion,
        agregarPublicacion,
        actualizarPublicacion,
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

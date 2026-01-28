"use client"

import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Lock } from "lucide-react"
import type { Publicacion } from "@/lib/types"
import { razasLabels, especieLabels, generoLabels } from "@/lib/mock-data"

interface PublicacionCardProps {
  publicacion: Publicacion
  isAuthenticated?: boolean
  onRequireAuth?: (publicacionId: number) => void
}

function formatDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, "0")
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const year = date.getFullYear().toString().slice(-2)
  return `${day}/${month}/${year}`
}

export function PublicacionCard({
  publicacion,
  isAuthenticated = false,
  onRequireAuth,
}: PublicacionCardProps) {
  const { mascota } = publicacion
  
  const handleLoginClick = () => {
    if (onRequireAuth) {
      onRequireAuth(publicacion.id)
    }
  }

  // Limitar descripcion a 140 caracteres y capitalizar primera letra
  const descripcionLimitada = mascota.descripcion.length > 140 
    ? mascota.descripcion.slice(0, 140).trim() + "..." 
    : mascota.descripcion
  const descripcionFormateada = descripcionLimitada.charAt(0).toUpperCase() + descripcionLimitada.slice(1).toLowerCase()

  return (
    <Card 
      id={`publicacion-${publicacion.id}`}
      className="group flex flex-col overflow-hidden transition-all hover:shadow-lg p-0 gap-0"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Image
          src={mascota.imagenUrl || "/placeholder.svg"}
          alt={`${especieLabels[mascota.especie]} encontrado`}
          fill
          className="object-cover object-top transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="secondary" className="bg-card/90 backdrop-blur-sm">
              {especieLabels[mascota.especie]}
            </Badge>
            <Badge
              variant="outline"
              className="border-card/50 bg-card/90 backdrop-blur-sm"
            >
              {generoLabels[mascota.sexo]}
            </Badge>
          </div>
          <Badge variant="secondary" className="bg-card/90 backdrop-blur-sm font-medium w-fit">
            {razasLabels[mascota.raza]}
          </Badge>
        </div>
        <div className="absolute right-3 bottom-3">
          <Badge variant="secondary" className="bg-card/90 backdrop-blur-sm text-xs">
            {formatDate(publicacion.fechaEncuentro)}
          </Badge>
        </div>
      </div>

      <CardContent className="flex flex-1 flex-col px-[10px] py-[10px]">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-[10px]">
          {descripcionFormateada}
        </p>

        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-[10px]">
          <MapPin className="h-4 w-4 shrink-0 text-primary" />
          <span>{publicacion.ubicacion}</span>
        </div>

        <div className="mt-auto">
          {isAuthenticated ? (
            <div className="space-y-0.5 rounded-lg bg-secondary/50 p-3">
              <p className="text-sm font-medium text-foreground">
                {publicacion.contactoNombre}
              </p>
              <p className="text-sm text-muted-foreground">{publicacion.contactoTelefono}</p>
              <p className="text-sm text-muted-foreground">{publicacion.contactoEmail}</p>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border bg-muted/30 p-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Lock className="h-4 w-4 shrink-0" />
                <span>
                  <button 
                    type="button"
                    onClick={handleLoginClick}
                    className="text-primary hover:underline font-medium"
                  >
                    Inicia sesion o registrate
                  </button>
                  {" "}para ver los datos de contacto
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

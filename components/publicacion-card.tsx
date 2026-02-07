"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Lock, Share2, Check, Loader2 } from "lucide-react"
import type { Publicacion } from "@/lib/types"
import { razasLabels, especieLabels, generoLabels } from "@/lib/mock-data"
import { toast } from "sonner"

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
  
  const [isSharing, setIsSharing] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  const handleLoginClick = () => {
    if (onRequireAuth) {
      onRequireAuth(publicacion.id)
    }
  }

  const handleShare = async () => {
    if (isSharing) return
    setIsSharing(true)

    const url = `${window.location.origin}/publicacion/${publicacion.id}`
    const title = `${especieLabels[mascota.especie]} encontrado en ${publicacion.ubicacion}`
    const text = mascota.descripcion

    try {
      // Intentar Web Share API (mobile nativo)
      if (navigator.share) {
        await navigator.share({ url, title, text })
        setIsSharing(false)
        return
      }

      // Fallback: copiar al portapapeles
      await navigator.clipboard.writeText(url)
      setIsCopied(true)
      toast.success("¡Enlace copiado!", {
        description: "El enlace a la publicación está en tu portapapeles.",
      })
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      // Si el usuario canceló el share nativo, no mostrar error
      if ((err as Error).name === "AbortError") {
        setIsSharing(false)
        return
      }
      toast.error("No se pudo compartir", {
        description: "Intentá copiar el enlace manualmente.",
      })
    } finally {
      setIsSharing(false)
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
        {/* Botón de compartir */}
        <div className="absolute right-3 top-3 z-10">
          <Button
            size="icon"
            variant="secondary"
            className="h-9 w-9 rounded-full bg-card/90 backdrop-blur-sm shadow-sm border-0 hover:bg-card transition-all"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleShare()
            }}
            disabled={isSharing}
            title="Compartir publicación"
          >
            {isSharing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isCopied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Share2 className="h-4 w-4" />
            )}
          </Button>
        </div>

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

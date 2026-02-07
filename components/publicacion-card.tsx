"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Lock, Share2, Check, Download, Loader2 } from "lucide-react"
import type { Publicacion } from "@/lib/types"
import { razasLabels, especieLabels, generoLabels } from "@/lib/mock-data"
import { toPng } from "html-to-image"
import { toast } from "sonner"
import { ShareTemplate } from "./share-template"

interface PublicacionCardProps {
  publicacion: Publicacion
  isAuthenticated?: boolean
  onRequireAuth?: (publicacionId: string) => void
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
  const shareTemplateRef = useRef<HTMLDivElement>(null)
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

    try {
      // 1. Copiar URL al portapapeles
      await navigator.clipboard.writeText(url)
      setIsCopied(true)
      toast.success("¡URL copiada!", {
        description: "El enlace directo a la publicación está en tu portapapeles.",
      })
      setTimeout(() => setIsCopied(false), 2000)

      // 2. Generar imagen para historia
      if (shareTemplateRef.current) {
        // Pequeña pausa para asegurar que el DOM esté listo y las imágenes cargadas
        // html-to-image a veces necesita que las imágenes estén completamente cargadas
        const dataUrl = await toPng(shareTemplateRef.current, {
          quality: 1,
          pixelRatio: 1,
          skipFonts: false,
        })

        const link = document.createElement('a')
        link.download = `historia-mascota-${publicacion.id}.png`
        link.href = dataUrl
        link.click()

        toast.success("Imagen lista", {
          description: "Se ha descargado la imagen para tu historia.",
        })
      }
    } catch (err) {
      console.error('Error al compartir:', err)
      toast.error("Error al compartir", {
        description: "Hubo un problema al generar la imagen de compartir.",
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
    <>
      <ShareTemplate
        ref={shareTemplateRef}
        publicacion={publicacion}
        url={`${typeof window !== 'undefined' ? window.location.origin : ''}/publicacion/${publicacion.id}`}
      />

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

          {/* Botón de Compartir */}
          <div className="absolute right-3 top-3 z-10">
            <Button
              size="icon"
              variant="secondary"
              className="h-10 w-10 rounded-full bg-white/90 dark:bg-black/70 backdrop-blur-md shadow-sm border-0 hover:bg-white dark:hover:bg-black transition-all"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleShare()
              }}
              disabled={isSharing}
              title="Compartir para historia"
            >
              {isSharing ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              ) : isCopied ? (
                <Check className="h-5 w-5 text-green-600" />
              ) : (
                <Share2 className="h-5 w-5 text-primary" />
              )}
            </Button>
          </div>

          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="secondary" className="bg-white dark:bg-black/70 text-foreground dark:text-white backdrop-blur-sm border-0">
                {especieLabels[mascota.especie]}
              </Badge>
              <Badge
                variant="outline"
                className="bg-white dark:bg-black/70 text-foreground dark:text-white backdrop-blur-sm border-0"
              >
                {generoLabels[mascota.sexo]}
              </Badge>
            </div>
            <Badge variant="secondary" className="bg-white dark:bg-black/70 text-foreground dark:text-white backdrop-blur-sm font-medium w-fit border-0">
              {razasLabels[mascota.raza]}
            </Badge>
          </div>
          <div className="absolute left-3 bottom-3">
            <Badge variant="secondary" className="bg-white dark:bg-black/70 text-foreground dark:text-white backdrop-blur-sm text-xs flex items-center gap-1 border-0">
              <MapPin className="h-3 w-3" />
              {publicacion.ubicacion}
            </Badge>
          </div>
          <div className="absolute right-3 bottom-3">
            <Badge variant="secondary" className="bg-white dark:bg-black/70 text-foreground dark:text-white backdrop-blur-sm text-xs border-0">
              {formatDate(publicacion.fechaEncuentro)}
            </Badge>
          </div>
        </div>

        <CardContent className="flex flex-1 flex-col px-[10px] py-[10px]">
          <p className="text-sm text-foreground/80 line-clamp-3 mb-[10px]">
            {descripcionFormateada}
          </p>

          <div className="mt-auto">
            {isAuthenticated ? (
              <div className="space-y-0.5 rounded-lg bg-secondary/50 p-3 overflow-hidden">
                <p className="text-sm font-medium text-foreground">
                  {publicacion.contactoNombre}
                </p>
                <a
                  href={`tel:${publicacion.contactoTelefono.replace(/\s/g, '')}`}
                  className="block text-sm text-muted-foreground hover:text-primary hover:underline"
                >
                  {publicacion.contactoTelefono}
                </a>
                <a
                  href={`mailto:${publicacion.contactoEmail}`}
                  className="block text-sm text-muted-foreground hover:text-primary hover:underline truncate"
                  title={publicacion.contactoEmail}
                >
                  {publicacion.contactoEmail}
                </a>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border bg-muted/30 p-3">
                <div className="flex items-center gap-2 text-sm text-foreground/70">
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
    </>
  )
}

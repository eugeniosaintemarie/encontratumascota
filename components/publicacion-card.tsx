"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Lock, Share2, Check, Loader2, AlertTriangle, UserPlus, User, Download } from "lucide-react"
import type { Publicacion } from "@/lib/types"
import { razasLabels, especieLabels, generoLabels } from "@/lib/labels"
import { generateShareImage } from "@/lib/generate-share-image"
import { toast } from "sonner"

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
    const title = `${especieLabels[mascota.especie]} ${generoLabels[mascota.sexo]} ${razasLabels[mascota.raza]} encontrado en ${publicacion.ubicacion}`
    const transitoTag = publicacion.transitoUrgente ? "\n⚠️ ¡Tránsito urgente!" : ""
    const shareText = `🐾 *${title}*${transitoTag}\n\n${mascota.descripcion}\n\n${url}`

    try {
      // 1. Generar imagen para compartir (formato 4:5)
      const imageBlob = await generateShareImage(publicacion)

      // 2. Siempre copiar link al portapapeles
      try {
        await navigator.clipboard.writeText(url)
      } catch {
        // Silently fail on clipboard - some browsers block it
      }

      // 3. Intentar Web Share API — solo texto (WhatsApp muestra bien el texto + preview OG del link)
      //    La imagen se descarga aparte para Instagram/redes que usen imágenes.
      if (navigator.share) {
        await navigator.share({
          title,
          text: shareText,
        })

        // Después de compartir texto, descargar imagen automáticamente
        const downloadUrl = URL.createObjectURL(imageBlob)
        const a = document.createElement("a")
        a.href = downloadUrl
        a.download = `mascota-${publicacion.id}.jpg`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(downloadUrl)

        toast.success("¡Compartido! Imagen descargada y enlace copiado.", {
          description: "La imagen está en tus descargas para subirla a Instagram.",
        })
        setIsSharing(false)
        return
      }

      // 4. Fallback: descargar imagen + confirmar link copiado
      const downloadUrl = URL.createObjectURL(imageBlob)
      const a = document.createElement("a")
      a.href = downloadUrl
      a.download = `mascota-${publicacion.id}.jpg`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(downloadUrl)

      setIsCopied(true)
      toast.success("¡Imagen descargada y enlace copiado!", {
        description: "Subí la imagen a tus redes y pegá el enlace.",
      })
      setTimeout(() => setIsCopied(false), 3000)
    } catch (err) {
      // Si el usuario canceló el share nativo, no mostrar error
      if ((err as Error).name === "AbortError") {
        // Igualmente el link se copió
        toast.info("Enlace copiado al portapapeles", {
          description: "Podés pegarlo donde quieras.",
        })
        setIsSharing(false)
        return
      }

      // Fallback final: solo copiar link
      try {
        await navigator.clipboard.writeText(url)
        setIsCopied(true)
        toast.success("¡Enlace copiado!", {
          description: "El enlace a la publicación está en tu portapapeles.",
        })
        setTimeout(() => setIsCopied(false), 2000)
      } catch {
        toast.error("No se pudo compartir", {
          description: "Intentá copiar el enlace manualmente.",
        })
      }
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
        <div className="absolute left-3 bottom-3 flex flex-col gap-1.5">
          {publicacion.transitoUrgente && (
            <Badge variant="secondary" className="text-white backdrop-blur-sm text-xs flex items-center gap-1 border-0 w-fit" style={{ backgroundColor: "#F44336" }}>
              <AlertTriangle className="h-3 w-3" />
              Tránsito urgente
            </Badge>
          )}
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
            <div className="space-y-2">
              {/* Si está en tránsito y tiene contacto de tránsito, mostrar ambos */}
              {publicacion.enTransito && publicacion.transitoContactoNombre ? (
                <>
                  {/* Contacto actual (cuidador de tránsito) */}
                  <div className="space-y-0.5 rounded-lg bg-primary/10 p-3 overflow-hidden">
                    <div className="flex items-center gap-1.5 mb-1">
                      <UserPlus className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs font-medium text-primary">Cuidador actual</span>
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      {publicacion.transitoContactoNombre}
                    </p>
                    <a 
                      href={`tel:${publicacion.transitoContactoTelefono?.replace(/\s/g, '')}`}
                      className="block text-sm text-muted-foreground hover:text-primary hover:underline"
                    >
                      {publicacion.transitoContactoTelefono}
                    </a>
                    <a 
                      href={`mailto:${publicacion.transitoContactoEmail}`}
                      className="block text-sm text-muted-foreground hover:text-primary hover:underline truncate"
                      title={publicacion.transitoContactoEmail ?? ""}
                    >
                      {publicacion.transitoContactoEmail}
                    </a>
                  </div>
                  {/* Contacto original (quien publicó) */}
                  <div className="space-y-0.5 rounded-lg bg-secondary/50 p-3 overflow-hidden">
                    <div className="flex items-center gap-1.5 mb-1">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground">Quien lo encontró</span>
                    </div>
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
                </>
              ) : (
                /* Contacto normal (sin tránsito) */
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
              )}
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
  )
}

"use client"

import { useState, memo, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Lock, Share2, Check, Loader2, AlertTriangle, UserPlus, User, ZoomIn, History } from "lucide-react"
import type { Publicacion } from "@/lib/types"
import { ImageViewerModal } from "@/components/image-viewer-modal"
import { formatHeartEmojiSpacing } from "@/lib/utils"
import { useSharePublicacion } from "@/hooks/use-share-publicacion"
import { PublicacionBadges, PublicacionDetalle } from "@/components/publicacion-badges"

interface PublicacionCardProps {
  publicacion: Publicacion
  isAuthenticated?: boolean
  onRequireAuth?: (publicacionId: string) => void
}

export const PublicacionCard = memo(function PublicacionCard({
  publicacion,
  isAuthenticated = false,
  onRequireAuth,
}: PublicacionCardProps) {
  const router = useRouter()
  const { mascota } = publicacion

  const { isSharing, isCopied, handleShare } = useSharePublicacion(publicacion)
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [authChecked, setAuthChecked] = useState(isAuthenticated)

  useEffect(() => {
    setAuthChecked(isAuthenticated)
  }, [isAuthenticated])

  useEffect(() => {
    const handleSessionUpdate = () => {
      setAuthChecked(true)
    }
    window.addEventListener("demo-session-updated", handleSessionUpdate)
    return () => window.removeEventListener("demo-session-updated", handleSessionUpdate)
  }, [])

  // Obtener el historial anterior (del array historialTransferencias)
  const historialTransferencias = (publicacion.historialTransferencias as any[]) || []
  const tieneHistorial = historialTransferencias.length > 0
  const contactoAnterior = tieneHistorial ? historialTransferencias[historialTransferencias.length - 1] : null

  const handleLoginClick = () => {
    if (onRequireAuth) {
      onRequireAuth(publicacion.id)
    }
  }

  return (
    <Card
      id={`publicacion-${publicacion.id}`}
      className="group flex flex-col overflow-hidden transition-all hover:shadow-lg p-0 gap-0"
    >
      <div className="relative aspect-square overflow-hidden bg-muted cursor-pointer" onClick={() => setIsImageViewerOpen(true)}>
        <Image
          src={mascota.imagenUrl || "/placeholder.svg"}
          alt={`${publicacion.mascota.especie} ${publicacion.mascota.raza} ${publicacion.tipoPublicacion === "buscada" ? "buscado" : publicacion.tipoPublicacion === "adopcion" ? "en adopción" : "encontrado"} en ${publicacion.ubicacion}`}
          fill
          loading="lazy"
          className="object-cover object-top transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 20vw"
        />

        {/* Zoom indicator overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="bg-white/90 dark:bg-black/70 rounded-full p-2 shadow-lg backdrop-blur-sm">
            <ZoomIn className="h-5 w-5 text-foreground" />
          </div>
        </div>

        {/* imagen renderizada */}

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
            aria-label="Compartir publicación"
          >
            {isSharing ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : isCopied ? (
              <Check className="h-4 w-4 text-green-600" aria-hidden="true" />
            ) : (
              <Share2 className="h-4 w-4" aria-hidden="true" />
            )}
          </Button>
        </div>

        <PublicacionBadges publicacion={publicacion} />
      </div>

      <CardContent className="flex flex-1 flex-col px-3 py-3">
        <PublicacionDetalle publicacion={publicacion} />

        <div className="mt-auto">
          {(() => {
            const isCerrada = publicacion.activa === false && !publicacion.enTransito
            const canSeeContact = authChecked || (publicacion.mostrarContactoPublico && !isCerrada)
            return canSeeContact
          })() ? (
            <div className="rounded-lg bg-[#FF8A65]/10 px-3 py-3 min-h-[84px] relative flex flex-col">
              {/* Icono flip para ver historial (solo si hay historial) */}
              {tieneHistorial && (
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white dark:bg-black/50 hover:bg-gray-100 dark:hover:bg-black/70 transition-colors"
                  title={showHistory ? "Ver cuidador actual" : "Ver cuidador anterior"}
                  aria-label={showHistory ? "Ver cuidador actual" : "Ver cuidador anterior"}
                >
                  <History className="h-4 w-4 text-primary" />
                </button>
              )}

              {/* Si está en tránsito y tiene contacto de tránsito, mostrar ambos o historial */}
              {publicacion.transitoContactoNombre ? (
                <div
                  style={{
                    perspective: "1000px",
                    minHeight: "84px",
                    flex: 1,
                  } as any}
                >
                  <div
                    style={{
                      transition: "transform 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
                      transformStyle: "preserve-3d",
                      transform: showHistory ? "rotateY(180deg)" : "rotateY(0deg)",
                      minHeight: "inherit",
                    } as any}
                  >
                    {/* FRENTE - Cuidador actual */}
                    <div
                      style={{
                        backfaceVisibility: "hidden",
                        minHeight: "inherit",
                      } as any}
                    >
                      <div className="space-y-0 leading-tight rounded-lg bg-transparent p-0 overflow-hidden h-full">
                        <div className="flex items-center gap-1.5 mb-1">
                          <UserPlus className="h-3.5 w-3.5 text-primary" />
                          <span className="text-xs font-medium text-primary">Cuidador actual</span>
                        </div>
                        <p className="text-sm font-medium text-foreground m-0 p-0 ml-0">
                          {publicacion.transitoContactoNombre}
                        </p>
                        <a
                          href={`tel:${publicacion.transitoContactoTelefono?.replace(/\s/g, '')}`}
                          className="block text-sm text-muted-foreground hover:text-primary m-0 p-0 ml-0"
                        >
                          {publicacion.transitoContactoTelefono}
                        </a>
                        <a
                          href={`mailto:${publicacion.transitoContactoEmail}`}
                          className="block text-sm text-muted-foreground hover:text-primary truncate m-0 p-0 ml-0"
                          title={publicacion.transitoContactoEmail ?? ""}
                        >
                          {publicacion.transitoContactoEmail}
                        </a>
                      </div>
                    </div>

                    {/* ATRÁS - Cuidador anterior */}
                    {contactoAnterior && (
                      <div
                        style={{
                          backfaceVisibility: "hidden",
                          transform: "rotateY(180deg)",
                          minHeight: "inherit",
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                        } as any}
                      >
                        <div className="space-y-0 leading-tight rounded-lg bg-transparent p-0 overflow-hidden h-full">
                          <div className="flex items-center gap-1.5 mb-1">
                            <History className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">Cuidador anterior</span>
                          </div>
                          <p className="text-sm font-medium text-foreground m-0 p-0 ml-0">
                            {contactoAnterior.nombre}
                          </p>
                          <a
                            href={`tel:${contactoAnterior.telefono.replace(/\s/g, '')}`}
                            className="block text-sm text-muted-foreground hover:text-primary m-0 p-0 ml-0"
                          >
                            {contactoAnterior.telefono}
                          </a>
                          <a
                            href={`mailto:${contactoAnterior.email}`}
                            className="block text-sm text-muted-foreground hover:text-primary truncate m-0 p-0 ml-0"
                            title={contactoAnterior.email}
                          >
                            {contactoAnterior.email}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Contacto normal (sin tránsito) */
                <div className="space-y-0 leading-tight rounded-lg bg-transparent p-0 overflow-hidden min-h-[84px] flex flex-col flex-1">
                  <div className="mb-1">
                    <div className="flex items-center gap-1.5">
                      {publicacion.esRefugio ? (
                        <span className="text-[14px] leading-none" aria-hidden="true">❤️‍🩹</span>
                      ) : (
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                      <span className="text-xs font-medium text-muted-foreground"></span>
                    </div>
                    {publicacion.esRefugio ? (
                      <button
                        onClick={() => router.push(`/refugio/${publicacion.usuarioId}`)}
                        className="text-sm font-medium text-foreground hover:text-primary text-left transition-colors p-0 m-0 h-auto bg-transparent border-0 ml-0"
                      >
                        {formatHeartEmojiSpacing(publicacion.contactoNombre)}
                      </button>
                    ) : (
                      <p className="text-sm font-medium text-foreground m-0 p-0 ml-0">
                        {publicacion.contactoNombre}
                      </p>
                    )}
                  </div>
                  <a
                    href={`tel:${publicacion.contactoTelefono.replace(/\s/g, '')}`}
                    className="block text-sm text-muted-foreground hover:text-primary m-0 p-0 ml-0"
                  >
                    {publicacion.contactoTelefono}
                  </a>
                  <a
                    href={`mailto:${publicacion.contactoEmail}`}
                    className="block text-sm text-muted-foreground hover:text-primary truncate m-0 p-0 ml-0"
                    title={publicacion.contactoEmail}
                  >
                    {publicacion.contactoEmail}
                  </a>
                </div>
              )}
            </div>
            ) : (
            <div className="rounded-lg bg-[#FF8A65]/10 px-3 py-3 min-h-[104px] flex flex-col justify-center">
              <div className="flex items-center gap-2 text-foreground/70">
                <Lock className="h-4 w-4 shrink-0" />
                <div className="flex flex-col items-start">
                  <button
                    type="button"
                    onClick={handleLoginClick}
                    className="text-[#FF8A65] text-sm font-medium text-left bg-transparent border-none p-0 inline-block focus:outline-none"
                  >
                    Iniciá sesión o regístrate
                  </button>
                  <span className="text-xs text-muted-foreground">
                    para ver los datos de contacto
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>

      {/* Image Viewer Modal */}
      <ImageViewerModal
        isOpen={isImageViewerOpen}
        onClose={() => setIsImageViewerOpen(false)}
        imageUrl={mascota.imagenUrl || "/placeholder.svg"}
        alt={`${publicacion.mascota.especie} ${publicacion.tipoPublicacion === "buscada" ? "buscado" : "encontrado"}`}
      />
    </Card>
  )
})

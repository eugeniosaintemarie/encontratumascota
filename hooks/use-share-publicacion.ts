"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { generateShareImage } from "@/lib/generate-share-image"
import { getPublicacionInfo } from "@/lib/publicacion-utils"
import type { Publicacion } from "@/lib/types"

export function useSharePublicacion(publicacion: Publicacion | null) {
  const [isSharing, setIsSharing] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const isSharingRef = useRef(false)

  useEffect(() => {
    setIsSharing(false)
    setIsCopied(false)
    isSharingRef.current = false
  }, [publicacion?.id])

  const handleShare = useCallback(async () => {
    if (!publicacion || isSharingRef.current) return
    isSharingRef.current = true
    setIsSharing(true)

    const url = `${window.location.origin}/publicacion/${publicacion.id}`
    const info = getPublicacionInfo(publicacion)
    const razaDetalle = info.razaDetalle
      ? ` ${info.razaDetalle.replace(/\n/g, " + ")}`
      : ""
    const color = info.color ? ` ${info.color}` : ""
    const transitoTag = info.transitoUrgente ? " ¡Tránsito urgente! ⚠️" : ""

    let title: string
    if (info.esAdopcion) {
      title = `${info.tipo}${info.raza ? ` ${info.raza}` : ""}${razaDetalle}${color ? ` ${color}` : ""} 🐾 ${info.categoria.toLowerCase()}${transitoTag}`
    } else {
      title = `${info.tipo}${info.raza ? ` ${info.raza}` : ""}${razaDetalle}${color} ${info.categoria.toLowerCase()} en ${info.ubicacionCorta}${transitoTag}`
    }
    const shareText = `${title}\n\n${info.descripcion}\n\n${url}`

    try {
      const imageBlob = await generateShareImage(publicacion)

      // Copy URL to clipboard
      try {
        await navigator.clipboard.writeText(url)
      } catch {
        // Silently fail
      }

      if (navigator.share) {
        try {
          // Try sharing with file
          const imageFile = new File([imageBlob], `mascota-${publicacion.id}.jpg`, {
            type: "image/jpeg",
          })
          await navigator.share({
            files: [imageFile],
            title,
            text: shareText,
          })
          return
        } catch (shareErr) {
          if ((shareErr as Error).name !== "AbortError") {
            // File share failed, try text only
            try {
              await navigator.share({ title, text: shareText })
              return
            } catch {
              // Text share also failed
            }
          }
        }
      }

      // Fallback: download
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
        description: "Subí la imagen a tus redes y pegá el enlace",
      })
      setTimeout(() => setIsCopied(false), 3000)
    } catch {
      try {
        await navigator.clipboard.writeText(url)
        setIsCopied(true)
        toast.success("¡Enlace copiado!", {
          description: "El enlace a la publicación está en tu portapapeles",
        })
        setTimeout(() => setIsCopied(false), 2000)
      } catch {
        toast.error("No se pudo compartir", {
          description: "Intentá copiar el enlace manualmente",
        })
      }
    } finally {
      isSharingRef.current = false
      setIsSharing(false)
    }
  }, [publicacion])

  return { isSharing, isCopied, handleShare }
}

"use client"

import { useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ImageViewerModalProps {
  isOpen: boolean
  onClose: () => void
  imageUrl: string
  alt?: string
}

export function ImageViewerModal({
  isOpen,
  onClose,
  imageUrl,
  alt = "Imagen",
}: ImageViewerModalProps) {
  // Handle escape key to close
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    },
    [onClose]
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown)
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, handleKeyDown])

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="w-full max-w-[calc(100vw-1rem)] sm:max-w-[640px] max-h-[95vh] h-auto p-0 bg-transparent border-0 shadow-none left-1/2 top-[50%] -translate-x-1/2 translate-y-[-50%]"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">{alt}</DialogTitle>
        <div className="flex flex-col items-center justify-center gap-4">
          {/* Image container */}
          <div className="relative w-full max-w-[calc(100vw-1rem)] sm:max-w-[640px] max-h-[calc(100vh-3rem)]">
            <img
              src={imageUrl || "/placeholder.svg"}
              alt={alt}
              className="w-full h-auto max-h-[calc(100vh-3rem)] object-contain rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <Button
            variant="secondary"
            size="icon"
            className="z-50 rounded-full bg-black/70 hover:bg-black/80 text-white border-0 h-10 w-10"
            onClick={onClose}
            aria-label="Cerrar vista de imagen"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

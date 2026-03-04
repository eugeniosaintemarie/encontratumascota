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
        className="max-w-[95vw] max-h-[95vh] w-auto h-auto p-0 bg-transparent border-0 shadow-none top-[50%] translate-y-[-50%]"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">{alt}</DialogTitle>
        <div className="relative flex items-center justify-center">
          {/* Close button */}
          <Button
            variant="secondary"
            size="icon"
            className="absolute -top-12 right-0 z-50 rounded-full bg-black/50 hover:bg-black/70 text-white border-0 h-10 w-10"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>

          {/* Image container */}
          <div className="relative max-w-[90vw] max-h-[85vh]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl || "/placeholder.svg"}
              alt={alt}
              className="max-w-full max-h-[85vh] w-auto h-auto object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

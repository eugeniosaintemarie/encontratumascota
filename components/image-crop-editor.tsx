"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { ZoomIn, ZoomOut, Check, RotateCcw } from "lucide-react"

interface ImageCropEditorProps {
  imageFile: File
  onCropComplete: (blob: Blob, previewUrl: string) => void
  onCancel: () => void
}

export function ImageCropEditor({
  imageFile,
  onCropComplete,
  onCancel,
}: ImageCropEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [imageEl, setImageEl] = useState<HTMLImageElement | null>(null)

  // Crop state: offset of image relative to the square viewport, and scale
  const [offsetX, setOffsetX] = useState(0)
  const [offsetY, setOffsetY] = useState(0)
  const [scale, setScale] = useState(1)
  const [minScale, setMinScale] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const dragStart = useRef({ x: 0, y: 0, ox: 0, oy: 0 })

  // Viewport size (square, fits container)
  const VIEWPORT = 300

  // Load file into image
  useEffect(() => {
    const url = URL.createObjectURL(imageFile)
    setImageSrc(url)

    const img = new window.Image()
    img.onload = () => {
      setImageEl(img)

      // Calculate minimum scale so image covers the viewport
      const scaleX = VIEWPORT / img.width
      const scaleY = VIEWPORT / img.height
      const fitScale = Math.max(scaleX, scaleY)
      setMinScale(fitScale)
      setScale(fitScale)

      // Center
      setOffsetX((VIEWPORT - img.width * fitScale) / 2)
      setOffsetY((VIEWPORT - img.height * fitScale) / 2)
    }
    img.src = url

    return () => URL.revokeObjectURL(url)
  }, [imageFile])

  // Constrain offsets so image always covers the viewport
  const constrain = useCallback(
    (ox: number, oy: number, s: number) => {
      if (!imageEl) return { ox, oy }
      const w = imageEl.width * s
      const h = imageEl.height * s

      // Image left edge must be <= 0 (viewport left)
      // Image right edge must be >= VIEWPORT
      let nx = Math.min(0, Math.max(VIEWPORT - w, ox))
      let ny = Math.min(0, Math.max(VIEWPORT - h, oy))

      return { ox: nx, oy: ny }
    },
    [imageEl]
  )

  // Update offsets when scale changes
  useEffect(() => {
    if (!imageEl) return
    const { ox, oy } = constrain(offsetX, offsetY, scale)
    if (ox !== offsetX || oy !== offsetY) {
      setOffsetX(ox)
      setOffsetY(oy)
    }
  }, [scale, imageEl, constrain, offsetX, offsetY])

  // Draw preview
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !imageEl) return
    const ctx = canvas.getContext("2d")!
    canvas.width = VIEWPORT
    canvas.height = VIEWPORT

    ctx.clearRect(0, 0, VIEWPORT, VIEWPORT)
    ctx.fillStyle = "#f0f0f0"
    ctx.fillRect(0, 0, VIEWPORT, VIEWPORT)

    ctx.drawImage(
      imageEl,
      offsetX,
      offsetY,
      imageEl.width * scale,
      imageEl.height * scale
    )
  }, [imageEl, offsetX, offsetY, scale])

  // Drag handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true)
    dragStart.current = { x: e.clientX, y: e.clientY, ox: offsetX, oy: offsetY }
      ; (e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return
    const dx = e.clientX - dragStart.current.x
    const dy = e.clientY - dragStart.current.y
    const { ox, oy } = constrain(
      dragStart.current.ox + dx,
      dragStart.current.oy + dy,
      scale
    )
    setOffsetX(ox)
    setOffsetY(oy)
  }

  const handlePointerUp = () => {
    setIsDragging(false)
  }

  const handleScaleChange = (value: number[]) => {
    const newScale = value[0]

    // Zoom towards center
    if (imageEl) {
      const centerX = VIEWPORT / 2
      const centerY = VIEWPORT / 2
      const imgX = (centerX - offsetX) / scale
      const imgY = (centerY - offsetY) / scale
      const newOx = centerX - imgX * newScale
      const newOy = centerY - imgY * newScale
      const { ox, oy } = constrain(newOx, newOy, newScale)
      setOffsetX(ox)
      setOffsetY(oy)
    }

    setScale(newScale)
  }

  const handleReset = () => {
    if (!imageEl) return
    const scaleX = VIEWPORT / imageEl.width
    const scaleY = VIEWPORT / imageEl.height
    const fitScale = Math.max(scaleX, scaleY)
    setScale(fitScale)
    setOffsetX((VIEWPORT - imageEl.width * fitScale) / 2)
    setOffsetY((VIEWPORT - imageEl.height * fitScale) / 2)
  }

  const handleConfirm = () => {
    if (!imageEl) return

    // Render at 1080x1080 for high quality
    const outputSize = 1080
    const outCanvas = document.createElement("canvas")
    outCanvas.width = outputSize
    outCanvas.height = outputSize
    const ctx = outCanvas.getContext("2d")!

    // Map viewport coordinates back to image coordinates
    const ratio = outputSize / VIEWPORT
    ctx.drawImage(
      imageEl,
      offsetX * ratio,
      offsetY * ratio,
      imageEl.width * scale * ratio,
      imageEl.height * scale * ratio
    )

    outCanvas.toBlob(
      (blob) => {
        if (blob) {
          const previewUrl = URL.createObjectURL(blob)
          onCropComplete(blob, previewUrl)
        }
      },
      "image/jpeg",
      0.88
    )
  }

  if (!imageSrc) return null

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground text-center">
        Arrastrá la imagen para encuadrar el recorte cuadrado
      </p>

      {/* Square viewport */}
      <div className="flex justify-center">
        <div
          ref={containerRef}
          className="relative overflow-hidden rounded-lg border-2 border-dashed border-primary/40 bg-muted"
          style={{ width: VIEWPORT, height: VIEWPORT, cursor: isDragging ? "grabbing" : "grab" }}
        >
          <canvas
            ref={canvasRef}
            width={VIEWPORT}
            height={VIEWPORT}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="touch-none"
          />
          {/* Corner markers */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-2 top-2 h-5 w-5 border-l-2 border-t-2 border-white/80" />
            <div className="absolute right-2 top-2 h-5 w-5 border-r-2 border-t-2 border-white/80" />
            <div className="absolute bottom-2 left-2 h-5 w-5 border-b-2 border-l-2 border-white/80" />
            <div className="absolute bottom-2 right-2 h-5 w-5 border-b-2 border-r-2 border-white/80" />
          </div>
        </div>
      </div>

      {/* Zoom control */}
      <div className="flex items-center gap-3 px-4">
        <ZoomOut className="h-4 w-4 text-muted-foreground shrink-0" />
        <Slider
          min={minScale}
          max={minScale * 3}
          step={0.01}
          value={[scale]}
          onValueChange={handleScaleChange}
          className="flex-1"
        />
        <ZoomIn className="h-4 w-4 text-muted-foreground shrink-0" />
      </div>

      <div className="flex gap-2 justify-center">
        <Button type="button" variant="ghost" size="sm" onClick={handleReset}>
          <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
          Restablecer
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="button" size="sm" onClick={handleConfirm}>
          <Check className="mr-1.5 h-3.5 w-3.5" />
          Confirmar recorte
        </Button>
      </div>
    </div>
  )
}

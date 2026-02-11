import type { Publicacion } from "./types"
import { razasLabels, especieLabels, generoLabels } from "./labels"

// 4:5 aspect ratio (optimal for Instagram feed / sharing)
const CANVAS_WIDTH = 1080
const CANVAS_HEIGHT = 1350

const COLORS = {
  white: "#FAFAFA",
  text: "#1a1a1a",
  textSecondary: "#555555",
  badgeBg: "#ffffff",
  badgeText: "#1a1a1a",
  urgentBg: "#F44336",
  urgentText: "#ffffff",
}

function formatDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, "0")
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const year = date.getFullYear().toString().slice(-2)
  return `${day}/${month}/${year}`
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    img.crossOrigin = "anonymous"
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function drawBadge(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  options: {
    bgColor?: string
    textColor?: string
    fontSize?: number
  } = {}
): number {
  const {
    bgColor = COLORS.badgeBg,
    textColor = COLORS.badgeText,
    fontSize = 30,
  } = options

  ctx.font = `600 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
  const textWidth = ctx.measureText(text).width
  const paddingX = 22
  const paddingY = 12
  const badgeW = textWidth + paddingX * 2
  const badgeH = fontSize + paddingY * 2

  ctx.shadowColor = "rgba(0,0,0,0.15)"
  ctx.shadowBlur = 6
  ctx.shadowOffsetY = 2
  ctx.fillStyle = bgColor
  roundRect(ctx, x, y, badgeW, badgeH, badgeH / 2)
  ctx.fill()

  ctx.shadowColor = "transparent"
  ctx.shadowBlur = 0
  ctx.shadowOffsetY = 0

  ctx.fillStyle = textColor
  ctx.textBaseline = "middle"
  ctx.fillText(text, x + paddingX, y + badgeH / 2)

  return badgeW
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number = Infinity
): number {
  const words = text.split(" ")
  let line = ""
  let lineCount = 0
  let currentY = y

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + " "
    const metrics = ctx.measureText(testLine)

    if (metrics.width > maxWidth && i > 0) {
      lineCount++
      if (lineCount > maxLines) {
        const truncated = line.trim()
        ctx.fillText(truncated.slice(0, -3) + "...", x, currentY)
        return currentY + lineHeight
      }
      ctx.fillText(line.trim(), x, currentY)
      line = words[i] + " "
      currentY += lineHeight
    } else {
      line = testLine
    }
  }

  lineCount++
  if (lineCount <= maxLines) {
    ctx.fillText(line.trim(), x, currentY)
  }

  return currentY + lineHeight
}

export async function generateShareImage(
  publicacion: Publicacion
): Promise<Blob> {
  const canvas = document.createElement("canvas")
  canvas.width = CANVAS_WIDTH
  canvas.height = CANVAS_HEIGHT
  const ctx = canvas.getContext("2d")!

  const { mascota } = publicacion

  // =====================
  // 1. WHITE BACKGROUND (same as landing)
  // =====================
  ctx.fillStyle = COLORS.white
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

  // =====================
  // 2. PET IMAGE — square 1:1 (full width)
  // =====================
  const imageSize = CANVAS_WIDTH // 1080x1080

  try {
    const petImage = await loadImage(mascota.imagenUrl)
    const imgRatio = petImage.width / petImage.height
    let sx = 0, sy = 0, sw = petImage.width, sh = petImage.height

    if (imgRatio > 1) {
      sw = petImage.height
      sx = (petImage.width - sw) / 2
    } else {
      sh = petImage.width
      sy = 0
    }
    ctx.drawImage(petImage, sx, sy, sw, sh, 0, 0, imageSize, imageSize)
  } catch {
    ctx.fillStyle = "#e0e0e0"
    ctx.fillRect(0, 0, imageSize, imageSize)
    ctx.fillStyle = "#999"
    ctx.font = "bold 48px sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText("Sin imagen", imageSize / 2, imageSize / 2)
    ctx.textAlign = "start"
  }

  // =====================
  // 3. GRADIENT OVERLAYS for badge readability
  // =====================
  const topGrad = ctx.createLinearGradient(0, 0, 0, imageSize * 0.3)
  topGrad.addColorStop(0, "rgba(0,0,0,0.45)")
  topGrad.addColorStop(1, "rgba(0,0,0,0)")
  ctx.fillStyle = topGrad
  ctx.fillRect(0, 0, imageSize, imageSize * 0.3)

  const bottomGrad = ctx.createLinearGradient(0, imageSize * 0.6, 0, imageSize)
  bottomGrad.addColorStop(0, "rgba(0,0,0,0)")
  bottomGrad.addColorStop(1, "rgba(0,0,0,0.55)")
  ctx.fillStyle = bottomGrad
  ctx.fillRect(0, imageSize * 0.6, imageSize, imageSize * 0.4)

  // =====================
  // 4. BADGES ON IMAGE (same layout as card)
  // =====================
  const badgePad = 30
  let badgeY = badgePad

  let cx = badgePad
  const w1 = drawBadge(ctx, especieLabels[mascota.especie], cx, badgeY)
  cx += w1 + 10
  drawBadge(ctx, generoLabels[mascota.sexo], cx, badgeY)
  badgeY += 56 + 10

  drawBadge(ctx, razasLabels[mascota.raza], badgePad, badgeY)

  // Bottom-left: tránsito urgente + ubicación
  let bottomY = imageSize - badgePad

  bottomY -= 56
  drawBadge(ctx, `📍 ${publicacion.ubicacion}`, badgePad, bottomY, { fontSize: 28 })

  if (publicacion.transitoUrgente) {
    bottomY -= 56 + 10
    drawBadge(ctx, "⚠️ Tránsito urgente", badgePad, bottomY, {
      bgColor: COLORS.urgentBg,
      textColor: COLORS.urgentText,
      fontSize: 28,
    })
  }

  // Bottom-right: date
  const dateText = formatDate(publicacion.fechaEncuentro)
  ctx.font = `600 28px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
  const dateW = ctx.measureText(dateText).width
  drawBadge(ctx, dateText, imageSize - badgePad - dateW - 44, imageSize - badgePad - 56, {
    fontSize: 28,
  })

  // =====================
  // 5. DESCRIPTION (below image, white bg, no title)
  // =====================
  const descPadding = 44
  const descStartY = imageSize + 36
  const descMaxWidth = CANVAS_WIDTH - descPadding * 2
  const lineHeight = 42

  const descripcion =
    mascota.descripcion.charAt(0).toUpperCase() +
    mascota.descripcion.slice(1).toLowerCase()

  ctx.fillStyle = COLORS.text
  ctx.font = `400 32px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
  ctx.textBaseline = "top"
  ctx.textAlign = "start"

  const maxDescLines = Math.floor((CANVAS_HEIGHT - descStartY - 24) / lineHeight)
  wrapText(ctx, descripcion, descPadding, descStartY, descMaxWidth, lineHeight, maxDescLines)

  // Convert to blob (JPEG for smaller file size)
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error("Failed to generate image"))
      },
      "image/jpeg",
      0.92
    )
  })
}

import type { Publicacion } from "./types"
import { getPublicacionInfo, formatEdad, formatDate } from "./publicacion-utils"

// 4:5 aspect ratio (optimal for Instagram feed / sharing)
const CANVAS_WIDTH = 1080
const CANVAS_HEIGHT = 1500

const COLORS = {
  white: "#FAFAFA",
  text: "#1a1a1a",
  textSecondary: "#555555",
  badgeBg: "#ffffff",
  badgeText: "#1a1a1a",
  urgentBg: "#F44336",
  urgentText: "#ffffff",
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

  const info = getPublicacionInfo(publicacion)

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
    const petImage = await loadImage(publicacion.mascota.imagenUrl)
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
  // 4. BADGES ON IMAGE
  // =====================
  const badgePad = 30
  let badgeY = badgePad
  const badgeH = 56

  // Arriba a la izquierda: Tipo
  drawBadge(ctx, info.tipo, badgePad, badgeY)

  // Centro arriba: Edad o fecha
  const dateText = info.edadOFecha || (info.esAdopcion ? "Edad desconocida" : "Fecha desconocida")
  ctx.font = `600 28px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
  const dateTextW = ctx.measureText(dateText).width
  const centerX = (CANVAS_WIDTH - dateTextW) / 2 - badgePad
  drawBadge(ctx, dateText, centerX, badgeY, { fontSize: 28 })

  // Abajo a la izquierda: Raza (si es mestizo, mostrar madre y padre en dos líneas)
  ctx.font = `600 30px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
  let bottomY = imageSize - badgePad - badgeH
  if (info.esMestizo && info.madreRaza && info.padreRaza) {
    drawBadge(ctx, info.madreRaza, badgePad, bottomY, { fontSize: 28 })
    bottomY -= badgeH + 10
    drawBadge(ctx, info.padreRaza, badgePad, bottomY, { fontSize: 28 })
  } else if (info.raza) {
    drawBadge(ctx, info.raza, badgePad, bottomY, { fontSize: 28 })
  }

  // Abajo a la derecha: tránsito urgente (arriba) y ubicación (abajo) - solo para no-adopciones
  let rightBottomY = imageSize - badgePad - badgeH
  if (info.transitoUrgente) {
    const transitoText = "⚠ Tránsito urgente"
    const transitoW = ctx.measureText(transitoText).width
    drawBadge(ctx, transitoText, CANVAS_WIDTH - badgePad - transitoW - 44, rightBottomY, { fontSize: 28, bgColor: "#F44336", textColor: "#FFFFFF" })
    rightBottomY -= badgeH + 10
  }
  if (!info.esAdopcion) {
    const ubicacionText = `⚲ ${info.ubicacionCorta}`
    const ubicacionW = ctx.measureText(ubicacionText).width
    drawBadge(ctx, ubicacionText, CANVAS_WIDTH - badgePad - ubicacionW - 44, rightBottomY, { fontSize: 28 })
  }

  // =====================
  // 5. DESCRIPTION (below image, white bg)
  // =====================
  const descPadding = 44
  const descStartY = imageSize + 36
  const descMaxWidth = CANVAS_WIDTH - descPadding * 2
  const lineHeight = 42
  const domainRectHeight = 70
  const domainRectMargin = 24

  let currentY = descStartY

  // 1. Categoría en negrita
  ctx.fillStyle = COLORS.text
  ctx.font = `700 32px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
  ctx.textBaseline = "top"
  ctx.textAlign = "start"
  ctx.fillText(info.categoria, descPadding, currentY)
  currentY += 40

  // 2. Color
  if (info.color) {
    ctx.font = `400 32px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
    ctx.fillText(info.color, descPadding, currentY)
    currentY += 40
  }

  // 3. Descripción en cursiva
  ctx.font = `italic 32px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
  const maxDescLines = Math.floor((CANVAS_HEIGHT - currentY - domainRectHeight - domainRectMargin) / lineHeight)
  wrapText(ctx, info.descripcion, descPadding, currentY, descMaxWidth, lineHeight, maxDescLines)

  // =====================
  // 6. ENCONTRA TU MASCOTA AT BOTTOM
  // =====================
  const domainText = "EncontraTuMascota.ar"
  const domainRectY = CANVAS_HEIGHT - domainRectHeight - domainRectMargin
  const domainRectX = descPadding
  const domainRectWidth = CANVAS_WIDTH - descPadding * 2

  ctx.fillStyle = "rgba(245, 245, 245, 0.95)"
  roundRect(ctx, domainRectX, domainRectY, domainRectWidth, domainRectHeight, domainRectHeight / 2)
  ctx.fill()
  ctx.strokeStyle = "rgba(0,0,0,0.1)"
  ctx.lineWidth = 2
  ctx.stroke()

  ctx.fillStyle = COLORS.text
  ctx.font = `600 36px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText(domainText, CANVAS_WIDTH / 2, domainRectY + domainRectHeight / 2)

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

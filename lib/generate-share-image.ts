import type { Publicacion } from "./types"
import { razasLabels, especieLabels, generoLabels } from "./labels"

// Instagram Stories recommended: 1080x1920 (9:16)
const CANVAS_WIDTH = 1080
const CANVAS_HEIGHT = 1920

const COLORS = {
  background: "#1a1a2e",
  cardBg: "#ffffff",
  primary: "#FF8A65",
  primaryDark: "#E64A19",
  text: "#1a1a1a",
  textSecondary: "#555555",
  textLight: "#888888",
  badgeBg: "#ffffff",
  badgeText: "#1a1a1a",
  urgentBg: "#F44336",
  urgentText: "#ffffff",
  overlay: "rgba(0,0,0,0.35)",
  gradientTop: "rgba(0,0,0,0.5)",
  gradientBottom: "rgba(0,0,0,0.65)",
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
    icon?: string
  } = {}
): number {
  const {
    bgColor = COLORS.badgeBg,
    textColor = COLORS.badgeText,
    fontSize = 30,
    icon,
  } = options

  ctx.font = `600 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
  const textWidth = ctx.measureText(text).width
  const iconWidth = icon ? fontSize + 8 : 0
  const paddingX = 24
  const paddingY = 14
  const badgeW = textWidth + iconWidth + paddingX * 2
  const badgeH = fontSize + paddingY * 2

  // Shadow
  ctx.shadowColor = "rgba(0,0,0,0.2)"
  ctx.shadowBlur = 8
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 2

  ctx.fillStyle = bgColor
  roundRect(ctx, x, y, badgeW, badgeH, badgeH / 2)
  ctx.fill()

  // Reset shadow
  ctx.shadowColor = "transparent"
  ctx.shadowBlur = 0
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 0

  ctx.fillStyle = textColor
  ctx.textBaseline = "middle"

  if (icon) {
    // Draw icon text (emoji or symbol)
    ctx.font = `${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
    ctx.fillText(icon, x + paddingX, y + badgeH / 2)
    ctx.font = `600 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
    ctx.fillText(text, x + paddingX + iconWidth, y + badgeH / 2)
  } else {
    ctx.fillText(text, x + paddingX, y + badgeH / 2)
  }

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
        // Truncate with ellipsis
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
  publicacion: Publicacion,
  siteUrl: string
): Promise<Blob> {
  const canvas = document.createElement("canvas")
  canvas.width = CANVAS_WIDTH
  canvas.height = CANVAS_HEIGHT
  const ctx = canvas.getContext("2d")!

  const { mascota } = publicacion
  const padding = 60

  // =====================
  // 1. BACKGROUND
  // =====================
  // Gradient background
  const bgGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT)
  bgGradient.addColorStop(0, "#1a1a2e")
  bgGradient.addColorStop(0.5, "#16213e")
  bgGradient.addColorStop(1, "#0f3460")
  ctx.fillStyle = bgGradient
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

  // =====================
  // 2. PET IMAGE (upper ~55%)
  // =====================
  const imageAreaHeight = CANVAS_HEIGHT * 0.55
  const imageMargin = 40
  const imageX = imageMargin
  const imageY = imageMargin
  const imageW = CANVAS_WIDTH - imageMargin * 2
  const imageH = imageAreaHeight
  const imageRadius = 32

  // Draw rounded image container
  ctx.save()
  roundRect(ctx, imageX, imageY, imageW, imageH, imageRadius)
  ctx.clip()

  // Load and draw pet image
  try {
    const petImage = await loadImage(mascota.imagenUrl)
    // Cover fit - calculate crop
    const imgRatio = petImage.width / petImage.height
    const containerRatio = imageW / imageH
    let sx = 0,
      sy = 0,
      sw = petImage.width,
      sh = petImage.height

    if (imgRatio > containerRatio) {
      // Image is wider - crop horizontally
      sw = petImage.height * containerRatio
      sx = (petImage.width - sw) / 2
    } else {
      // Image is taller - crop from top (face priority)
      sh = petImage.width / containerRatio
      sy = 0 // Keep top
    }
    ctx.drawImage(petImage, sx, sy, sw, sh, imageX, imageY, imageW, imageH)
  } catch {
    // Fallback: solid color
    ctx.fillStyle = "#ddd"
    ctx.fillRect(imageX, imageY, imageW, imageH)
    ctx.fillStyle = "#999"
    ctx.font = "bold 48px sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText("Sin imagen", imageX + imageW / 2, imageY + imageH / 2)
    ctx.textAlign = "start"
  }

  // Bottom gradient overlay on image for readability
  const imgGradient = ctx.createLinearGradient(
    0,
    imageY + imageH * 0.5,
    0,
    imageY + imageH
  )
  imgGradient.addColorStop(0, "rgba(0,0,0,0)")
  imgGradient.addColorStop(1, "rgba(0,0,0,0.6)")
  ctx.fillStyle = imgGradient
  ctx.fillRect(imageX, imageY, imageW, imageH)

  // Top gradient for badges
  const topGradient = ctx.createLinearGradient(
    0,
    imageY,
    0,
    imageY + imageH * 0.25
  )
  topGradient.addColorStop(0, "rgba(0,0,0,0.4)")
  topGradient.addColorStop(1, "rgba(0,0,0,0)")
  ctx.fillStyle = topGradient
  ctx.fillRect(imageX, imageY, imageW, imageH)

  ctx.restore()

  // =====================
  // 3. BADGES ON IMAGE
  // =====================
  const badgeStartX = imageX + 30
  let badgeY = imageY + 30

  // Row 1: especie + sexo
  let currentX = badgeStartX
  const w1 = drawBadge(ctx, especieLabels[mascota.especie], currentX, badgeY)
  currentX += w1 + 12
  const w2 = drawBadge(ctx, generoLabels[mascota.sexo], currentX, badgeY)
  badgeY += 58 + 12

  // Row 2: raza
  drawBadge(ctx, razasLabels[mascota.raza], badgeStartX, badgeY)

  // Bottom-left of image: tránsito urgente + ubicación
  let bottomBadgeY = imageY + imageH - 30

  // Location badge
  bottomBadgeY -= 58
  drawBadge(ctx, `📍 ${publicacion.ubicacion}`, badgeStartX, bottomBadgeY, {
    fontSize: 28,
  })

  // Urgent transit badge
  if (publicacion.transitoUrgente) {
    bottomBadgeY -= 58 + 12
    drawBadge(ctx, "⚠️ Tránsito urgente", badgeStartX, bottomBadgeY, {
      bgColor: COLORS.urgentBg,
      textColor: COLORS.urgentText,
      fontSize: 28,
    })
  }

  // Bottom-right: date
  const dateText = formatDate(publicacion.fechaEncuentro)
  ctx.font = `600 28px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
  const dateWidth = ctx.measureText(dateText).width
  const dateBadgeX = imageX + imageW - 30 - dateWidth - 48
  drawBadge(ctx, dateText, dateBadgeX, imageY + imageH - 30 - 58, {
    fontSize: 28,
  })

  // =====================
  // 4. DESCRIPTION SECTION (below image)
  // =====================
  const descStartY = imageY + imageH + 50
  const descPadding = padding + 10

  // Description title
  ctx.fillStyle = COLORS.primary
  ctx.font = `bold 36px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
  ctx.textBaseline = "top"
  ctx.fillText("Descripción", descPadding, descStartY)

  // Decorative line
  ctx.fillStyle = COLORS.primary
  roundRect(ctx, descPadding, descStartY + 50, 80, 4, 2)
  ctx.fill()

  // Description text
  const descTextY = descStartY + 72
  const descMaxWidth = CANVAS_WIDTH - descPadding * 2
  const lineHeight = 44

  // Capitalize first letter
  const descripcion =
    mascota.descripcion.charAt(0).toUpperCase() +
    mascota.descripcion.slice(1).toLowerCase()

  ctx.fillStyle = "#ffffff"
  ctx.font = `400 32px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
  ctx.textBaseline = "top"
  const descEndY = wrapText(
    ctx,
    descripcion,
    descPadding,
    descTextY,
    descMaxWidth,
    lineHeight,
    8
  )

  // =====================
  // 5. FOOTER SECTION
  // =====================
  const footerY = CANVAS_HEIGHT - 180
  const url = `${siteUrl}/publicacion/${publicacion.id}`

  // Separator line
  ctx.strokeStyle = "rgba(255,255,255,0.15)"
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(padding, footerY)
  ctx.lineTo(CANVAS_WIDTH - padding, footerY)
  ctx.stroke()

  // Site name / branding
  ctx.fillStyle = COLORS.primary
  ctx.font = `bold 34px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
  ctx.textBaseline = "top"
  ctx.textAlign = "center"
  ctx.fillText("🐾 encontratumascota.com.ar", CANVAS_WIDTH / 2, footerY + 30)

  // URL below
  ctx.fillStyle = "rgba(255,255,255,0.5)"
  ctx.font = `400 26px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
  ctx.fillText(url, CANVAS_WIDTH / 2, footerY + 80)

  // "Comparti para ayudar" call to action
  ctx.fillStyle = "rgba(255,255,255,0.35)"
  ctx.font = `italic 24px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
  ctx.fillText("Compartí para ayudar a reunirlos ❤️", CANVAS_WIDTH / 2, footerY + 120)

  ctx.textAlign = "start"

  // Convert to blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error("Failed to generate image"))
      },
      "image/png",
      1.0
    )
  })
}

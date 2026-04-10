import type { Publicacion } from "./types";
import { getPublicacionInfo } from "./publicacion-utils";

// 9:16 aspect ratio for Instagram Stories/Reels
const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1920;

const COLORS = {
  salmon: "#FF8A65",
  pink: "#FFF0EC",
  white: "#FAFAFA",
  textWhite: "#FF8A65",
  urgentBg: "#F44336",
  urgentText: "#ffffff",
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawBadge(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  options: {
    bgColor?: string;
    textColor?: string;
    fontSize?: number;
  } = {},
): number {
  const {
    bgColor = COLORS.pink,
    textColor = COLORS.textWhite,
    fontSize = 40,
  } = options;

  ctx.font = `600 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
  const textWidth = ctx.measureText(text).width;
  const paddingX = 22;
  const paddingY = 12;
  const badgeW = textWidth + paddingX * 2;
  const badgeH = fontSize + paddingY * 2;

  ctx.shadowColor = "rgba(0,0,0,0.15)";
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 2;
  ctx.fillStyle = bgColor;
  roundRect(ctx, x, y, badgeW, badgeH, badgeH / 2);
  ctx.fill();

  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  ctx.fillStyle = textColor;
  ctx.textBaseline = "middle";
  ctx.fillText(text, x + paddingX, y + badgeH / 2);

  return badgeW;
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number = Infinity,
): number {
  const words = text.split(" ");
  let line = "";
  let lineCount = 0;
  let currentY = y;

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + " ";
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && i > 0) {
      lineCount++;
      if (lineCount > maxLines) {
        const truncated = line.trim();
        ctx.fillText(truncated.slice(0, -3) + "...", x, currentY);
        return currentY + lineHeight;
      }
      ctx.fillText(line.trim(), x, currentY);
      line = words[i] + " ";
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }

  lineCount++;
  if (lineCount <= maxLines) {
    ctx.fillText(line.trim(), x, currentY);
  }

  return currentY + lineHeight;
}

export async function generateShareImage(
  publicacion: Publicacion,
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  const ctx = canvas.getContext("2d")!;

  const info = getPublicacionInfo(publicacion);

  // =====================
  // 1. PINK BACKGROUND (entire canvas)
  // =====================
  ctx.fillStyle = COLORS.pink;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // =====================
  // 2. PET IMAGE — 1:1 square
  // =====================
  const topSpacer = 200;
  const imageSize = 1080;
  const imageY = topSpacer;

  try {
    const petImage = await loadImage(publicacion.mascota.imagenUrl);
    const imgRatio = petImage.width / petImage.height;
    let sx = 0,
      sy = 0,
      sw = petImage.width,
      sh = petImage.height;

    if (imgRatio > 1) {
      sw = petImage.height;
      sx = (petImage.width - sw) / 2;
    } else {
      sh = petImage.width;
      sy = (petImage.height - sh) / 2;
    }
    ctx.drawImage(petImage, sx, sy, sw, sh, 0, imageY, imageSize, imageSize);
  } catch {
    ctx.fillStyle = "#e0e0e0";
    ctx.fillRect(0, imageY, imageSize, imageSize);
    ctx.fillStyle = "#999";
    ctx.font = "bold 48px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Sin imagen", imageSize / 2, imageY + imageSize / 2);
    ctx.textAlign = "start";
  }

  // =====================
  // 3. GRADIENTS FOR BADGE READABILITY
  // =====================
  const topGrad = ctx.createLinearGradient(
    0,
    imageY,
    0,
    imageY + imageSize * 0.3,
  );
  topGrad.addColorStop(0, "rgba(0,0,0,0.45)");
  topGrad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = topGrad;
  ctx.fillRect(0, imageY, imageSize, imageSize * 0.3);

  const bottomGrad = ctx.createLinearGradient(
    0,
    imageY + imageSize * 0.6,
    0,
    imageY + imageSize,
  );
  bottomGrad.addColorStop(0, "rgba(0,0,0,0)");
  bottomGrad.addColorStop(1, "rgba(0,0,0,0.55)");
  ctx.fillStyle = bottomGrad;
  ctx.fillRect(0, imageY + imageSize * 0.6, imageSize, imageSize * 0.4);

  // =====================
  // 4. BADGES ON IMAGE
  // =====================
  const badgePad = 30;

  // TOP-LEFT: Tipo
  drawBadge(ctx, info.tipo, badgePad, imageY + badgePad);

  // TOP-CENTER: fecha/edad
  if (info.edadOFecha) {
    const fechaBadgeWidth = ctx.measureText(info.edadOFecha).width + 44;
    drawBadge(
      ctx,
      info.edadOFecha,
      imageSize / 2 - fechaBadgeWidth / 2,
      imageY + badgePad,
    );
  }

  // BOTTOM-LEFT: raza + ubicación
  let bottomBadgeY = imageY + imageSize - badgePad;

  if (info.esMestizo) {
    if (info.padreRaza) {
      bottomBadgeY -= 62 + 10;
      drawBadge(ctx, info.padreRaza, badgePad, bottomBadgeY);
    }
    if (info.madreRaza) {
      bottomBadgeY -= 62 + 10;
      drawBadge(ctx, info.madreRaza, badgePad, bottomBadgeY);
    }
  } else {
    bottomBadgeY -= 62 + 10;
    drawBadge(ctx, info.raza, badgePad, bottomBadgeY);
  }

  // Ubicación solo para perdidos/encontrados
  if (!info.esAdopcion) {
    bottomBadgeY -= 62 + 10;
    drawBadge(ctx, `📍 ${info.ubicacionCorta}`, badgePad, bottomBadgeY);
  }

  // Tránsito urgente
  if (info.transitoUrgente) {
    bottomBadgeY -= 62 + 10;
    drawBadge(ctx, "⚠️ Tránsito urgente", badgePad, bottomBadgeY, {
      bgColor: COLORS.urgentBg,
      textColor: COLORS.urgentText,
    });
  }

  // =====================
  // 5. TEXT SECTION (pink background, white text)
  // =====================
  const textSectionY = imageY + imageSize + 20;
  ctx.fillStyle = COLORS.pink;
  ctx.fillRect(0, textSectionY, CANVAS_WIDTH, CANVAS_HEIGHT - textSectionY);

  const descPadding = 48;
  const descMaxWidth = CANVAS_WIDTH - descPadding * 2;
  const lineHeight = 52;
  const textFontSize = 40;

  let currentY = textSectionY + 40;

  // 1. Categoría en negrita
  ctx.fillStyle = COLORS.textWhite;
  ctx.font = `700 ${textFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
  ctx.textBaseline = "top";
  ctx.textAlign = "start";
  ctx.fillText(info.categoria, descPadding, currentY);
  currentY += 52;

  // 2. Color
  if (info.color) {
    ctx.font = `400 ${textFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
    ctx.fillText(info.color, descPadding, currentY);
    currentY += 52;
  }

  // 3. Descripción en cursiva
  ctx.font = `italic ${textFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
  wrapText(
    ctx,
    info.descripcion,
    descPadding,
    currentY,
    descMaxWidth,
    lineHeight,
    6,
  );

  // =====================
  // 6. ENCONTRATUMASCOTA.AR (salmon bg, white text)
  // =====================
  const domainText = "EncontraTuMascota.ar";
  const domainRectHeight = 80;
  const domainRectMargin = topSpacer;
  const domainRectY = CANVAS_HEIGHT - domainRectHeight - domainRectMargin;
  const domainRectX = descPadding;
  const domainRectWidth = CANVAS_WIDTH - descPadding * 2;

  ctx.fillStyle = COLORS.salmon;
  roundRect(
    ctx,
    domainRectX,
    domainRectY,
    domainRectWidth,
    domainRectHeight,
    domainRectHeight / 2,
  );
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.font = `600 ${textFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(
    domainText,
    CANVAS_WIDTH / 2,
    domainRectY + domainRectHeight / 2,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to generate image"));
      },
      "image/jpeg",
      0.85,
    );
  });
}

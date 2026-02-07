const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '..', 'public', 'icons');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

async function generateIcons() {
  for (const size of sizes) {
    const padding = Math.floor(size * 0.12);
    const innerSize = size - padding * 2;
    
    // Create SVG with green background and paw print
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <rect width="${size}" height="${size}" rx="${Math.floor(size * 0.2)}" fill="#16a34a"/>
      <text x="${size/2}" y="${size/2 + size*0.08}" text-anchor="middle" font-size="${innerSize}" dominant-baseline="middle">🐾</text>
    </svg>`;

    await sharp(Buffer.from(svg))
      .resize(size, size)
      .png()
      .toFile(path.join(iconsDir, `icon-${size}x${size}.png`));
    
    console.log(`Generated icon-${size}x${size}.png`);
  }
  console.log('Done!');
}

generateIcons().catch(console.error);

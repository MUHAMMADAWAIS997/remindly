const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const OUT = path.join(__dirname, '..', 'assets', 'images');

// Bell icon SVG path (Material Design notifications, 24×24 viewBox)
const BELL_PATH = 'M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z';

function bellSvg({ size, bellColor, bgColor, padding = 0.18 }) {
  const inner = size * (1 - padding * 2);
  // Scale bell from 24×24 viewBox to `inner` px, centered
  const offset = size * padding;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  ${bgColor ? `<rect width="${size}" height="${size}" rx="${size * 0.22}" fill="${bgColor}"/>` : ''}
  <g transform="translate(${offset},${offset}) scale(${inner / 24})">
    <path d="${BELL_PATH}" fill="${bellColor}"/>
  </g>
</svg>`;
}

function bellSvgRound({ size, bellColor, bgColor, padding = 0.2 }) {
  const inner = size * (1 - padding * 2);
  const offset = size * padding;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  ${bgColor ? `<circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="${bgColor}"/>` : ''}
  <g transform="translate(${offset},${offset}) scale(${inner / 24})">
    <path d="${BELL_PATH}" fill="${bellColor}"/>
  </g>
</svg>`;
}

async function generate(filename, svgStr) {
  const outPath = path.join(OUT, filename);
  await sharp(Buffer.from(svgStr)).png().toFile(outPath);
  console.log(`✓ ${filename}`);
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });

  // Main app icon: rounded-rect indigo bg + white bell (1024×1024)
  await generate('icon.png', bellSvg({ size: 1024, bellColor: '#FFFFFF', bgColor: '#6366F1', padding: 0.2 }));

  // Android foreground: bell on transparent, within 66% safe zone (padding ~17%)
  await generate('android-icon-foreground.png', bellSvg({ size: 1024, bellColor: '#FFFFFF', bgColor: null, padding: 0.17 }));

  // Android background: solid indigo square
  await generate('android-icon-background.png',
    `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024"><rect width="1024" height="1024" fill="#6366F1"/></svg>`
  );

  // Android monochrome: white bell on transparent (system colorizes it)
  await generate('android-icon-monochrome.png', bellSvg({ size: 1024, bellColor: '#FFFFFF', bgColor: null, padding: 0.17 }));

  // Notification icon: 96×96, white bell on transparent
  await generate('notification-icon.png', bellSvg({ size: 96, bellColor: '#FFFFFF', bgColor: null, padding: 0.1 }));

  // Splash icon: white bell on transparent (splash bg is set in app.json)
  await generate('splash-icon.png', bellSvg({ size: 288, bellColor: '#FFFFFF', bgColor: null, padding: 0.05 }));

  // Favicon: 64×64
  await generate('favicon.png', bellSvgRound({ size: 64, bellColor: '#FFFFFF', bgColor: '#6366F1', padding: 0.2 }));

  console.log('\nAll icons generated.');
}

main().catch((err) => { console.error(err); process.exit(1); });

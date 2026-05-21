// Icon generation script for SPY ON THE RISE
// Run once: node scripts/gen-icons.js
// Requires: jimp (dev dependency)

const Jimp = require('jimp');
const path = require('path');

const PUBLIC = path.join(__dirname, '..', 'public');
const CRIMSON = 0x7A1515FF;

async function makeIcon(size, outFile) {
  const img = new Jimp(size, size, CRIMSON);

  // Rounded corners: mark corners transparent
  const r = Math.round(size * 0.125);
  for (let y = 0; y < r; y++) {
    for (let x = 0; x < r; x++) {
      const dist = Math.sqrt((r - x) ** 2 + (r - y) ** 2);
      if (dist > r) {
        img.setPixelColor(0x00000000, x, y);
        img.setPixelColor(0x00000000, size - 1 - x, y);
        img.setPixelColor(0x00000000, x, size - 1 - y);
        img.setPixelColor(0x00000000, size - 1 - x, size - 1 - y);
      }
    }
  }

  // Pick font based on size
  let fontName;
  if (size <= 32)       fontName = Jimp.FONT_SANS_16_WHITE;
  else if (size <= 192) fontName = Jimp.FONT_SANS_64_WHITE;
  else                  fontName = Jimp.FONT_SANS_128_WHITE;

  const font = await Jimp.loadFont(fontName);
  const tw = Jimp.measureText(font, 'SR');
  const th = Jimp.measureTextHeight(font, 'SR', size);

  // Vertical center adjusted upward slightly to allow ornament above
  const ty = Math.floor(size * 0.52 - th / 2);
  const tx = Math.floor((size - tw) / 2);

  // Draw diamond ornament (ASCII period used as placeholder ornament dot)
  if (size >= 64) {
    const dotFont = size <= 192 ? Jimp.FONT_SANS_16_WHITE : Jimp.FONT_SANS_32_WHITE;
    const df = await Jimp.loadFont(dotFont);
    const dw = Jimp.measureText(df, '*');
    const dy = Math.floor(size * 0.28 - Jimp.measureTextHeight(df, '*', size) / 2);
    img.print(df, Math.floor((size - dw) / 2), dy, '*');
  }

  img.print(font, tx, ty, 'SR');

  await img.writeAsync(path.join(PUBLIC, outFile));
  console.log('Created', outFile, `${size}x${size}`);
}

async function main() {
  await makeIcon(32,  'favicon-32x32.png');
  await makeIcon(180, 'apple-touch-icon.png');
  await makeIcon(192, 'icon-192.png');
  await makeIcon(512, 'icon-512.png');

  // Copy 32x32 PNG as favicon.ico (browsers accept PNG at .ico for 32px)
  const src = await Jimp.read(path.join(PUBLIC, 'favicon-32x32.png'));
  await src.writeAsync(path.join(PUBLIC, 'favicon.ico'));
  console.log('Created favicon.ico (32x32 PNG)');
}

main().catch(e => { console.error(e); process.exit(1); });

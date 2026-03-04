/**
 * Generate iOS splash screen PNGs from the app icon SVG.
 * Each splash screen: warm background (#fffbeb) with centered cross icon.
 *
 * Usage: node scripts/generate-splash.js
 * Output: assets/splash/*.png
 */

import sharp from 'sharp';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUT = resolve(ROOT, 'assets', 'splash');

const BG_COLOR = '#fffbeb';
const ICON_RATIO = 0.2; // Icon takes 20% of the shortest dimension

// iOS device splash screen sizes (portrait only)
const SIZES = [
  { w: 750,  h: 1334, name: '750x1334' },   // iPhone SE, 6/7/8
  { w: 1242, h: 2208, name: '1242x2208' },   // iPhone 6+/7+/8+
  { w: 1125, h: 2436, name: '1125x2436' },   // iPhone X/XS/11 Pro, 12/13 mini
  { w: 828,  h: 1792, name: '828x1792' },     // iPhone XR/11
  { w: 1242, h: 2688, name: '1242x2688' },    // iPhone XS Max/11 Pro Max
  { w: 1170, h: 2532, name: '1170x2532' },    // iPhone 12/13/14
  { w: 1284, h: 2778, name: '1284x2778' },    // iPhone 12/13 Pro Max
  { w: 1179, h: 2556, name: '1179x2556' },    // iPhone 14/15/16 Pro
  { w: 1290, h: 2796, name: '1290x2796' },    // iPhone 14/15/16 Pro Max
  { w: 1536, h: 2048, name: '1536x2048' },    // iPad mini / iPad 9.7"
  { w: 1668, h: 2388, name: '1668x2388' },    // iPad Pro 11"
  { w: 2048, h: 2732, name: '2048x2732' },    // iPad Pro 12.9"
];

function makeSplashSvg(width, height) {
  const iconSize = Math.round(Math.min(width, height) * ICON_RATIO);
  const cx = width / 2;
  const cy = height / 2;
  const strokeW = Math.round(iconSize * 36 / 512);
  const vLen = Math.round(iconSize * 272 / 512);
  const hLen = Math.round(iconSize * 192 / 512);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="${BG_COLOR}"/>
  <g transform="translate(${cx}, ${cy})">
    <line x1="0" y1="${-vLen / 2}" x2="0" y2="${vLen / 2}" stroke="#92400e" stroke-width="${strokeW}" stroke-linecap="round" opacity="0.6"/>
    <line x1="${-hLen / 2}" y1="${-vLen * 0.1}" x2="${hLen / 2}" y2="${-vLen * 0.1}" stroke="#92400e" stroke-width="${strokeW}" stroke-linecap="round" opacity="0.6"/>
  </g>
</svg>`;
}

mkdirSync(OUT, { recursive: true });

console.log('Generating iOS splash screens...');

for (const { w, h, name } of SIZES) {
  const svg = Buffer.from(makeSplashSvg(w, h));
  await sharp(svg).png({ quality: 80, compressionLevel: 9 }).toFile(resolve(OUT, `${name}.png`));
  console.log(`  ${name}.png`);
}

console.log(`\nDone — ${SIZES.length} splash screens in assets/splash/`);

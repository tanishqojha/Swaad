/**
 * Rasterises the Stitch "Swaad Icon Only" brand mark
 * (assets/stitch/brand/swaad-icon-only.svg) into the PNGs Expo needs for the
 * app icon — universal, Android adaptive foreground, and Android monochrome.
 *
 * Re-run whenever the brand mark changes:  node scripts/gen-brand-icons.mjs
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import sharp from 'sharp';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const src = resolve(root, 'assets/stitch/brand/swaad-icon-only.svg');
const iconSvg = readFileSync(src);

const CANVAS = 1024;
const CREAM = '#FDFAE8'; // Swaad light-theme surface, also the adaptive-icon background

/** Centre an N-px raster of `svg` on a CANVAS-px square (transparent or filled). */
async function compose(svg, markPx, out, background) {
  const mark = await sharp(svg, { density: 384 }).resize(markPx, markPx).png().toBuffer();
  let base = sharp({
    create: {
      width: CANVAS,
      height: CANVAS,
      channels: 4,
      background: background ?? { r: 0, g: 0, b: 0, alpha: 0 },
    },
  }).composite([{ input: mark, gravity: 'center' }]);
  // Opaque icons (iOS rejects an alpha channel); transparent for adaptive layers.
  if (background) base = base.flatten({ background }).removeAlpha();
  await base.png().toFile(resolve(root, out));
  console.log('wrote', out);
}

// Monochrome glyph: the grain/teardrop motif only, solid black (Android tints it).
const monoSvg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
  <path d="M40 18C28 27 23 41 28 52C30.5 57 37 61 44.5 59C54 54 56.5 42 51.5 31C47 24 40 18 40 18Z" fill="#000"/>
  <path d="M35 46C37.5 39 42 34 49 32" stroke="#000" stroke-width="3.5" stroke-linecap="round" fill="none"/>
  <circle cx="56" cy="25" r="5.5" fill="#000"/>
</svg>`);

// The mark's green circle is 90% of its own viewBox, so mark-px 910 => circle ~80% of canvas.
await compose(iconSvg, 910, 'assets/icon.png', CREAM);
// Adaptive foreground: circle ~70% of canvas, inside the 66% safe zone, transparent.
await compose(iconSvg, 796, 'assets/android-icon-foreground.png');
await compose(monoSvg, 660, 'assets/android-icon-monochrome.png');

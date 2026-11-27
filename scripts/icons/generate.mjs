// Rasterises public/brand-mark.svg into the favicon and home-screen icons.
// Run from the Blog root:  npm --prefix scripts/icons install && npm --prefix scripts/icons run generate
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';
import pngToIco from 'png-to-ico';

const publicDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../public');
const svg = await readFile(path.join(publicDir, 'brand-mark.svg'), 'utf8');

// Home-screen icons are full-bleed: iOS and Android round the corners themselves,
// so the tile's own rounding would leave dark slivers in the corners.
const roundedTile = '<rect id="tile" width="32" height="32" rx="8"';
if (!svg.includes(roundedTile)) {
  throw new Error(`brand-mark.svg no longer contains ${roundedTile}; update generate.mjs`);
}
const squareSvg = svg.replace(roundedTile, '<rect id="tile" width="32" height="32" rx="0"');

const render = (source, size) =>
  sharp(Buffer.from(source), { density: (72 * size) / 32 })
    .resize(size, size)
    .png()
    .toBuffer();

for (const size of [192, 512]) {
  await writeFile(path.join(publicDir, `logo${size}.png`), await render(squareSvg, size));
}

const icoSizes = [16, 24, 32, 64];
const icoLayers = await Promise.all(icoSizes.map((size) => render(svg, size)));
await writeFile(path.join(publicDir, 'favicon.ico'), await pngToIco(icoLayers));

console.log(`Wrote logo192.png, logo512.png and favicon.ico (${icoSizes.join('/')}) to ${publicDir}`);

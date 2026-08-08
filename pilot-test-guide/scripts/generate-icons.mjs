import sharp from 'sharp';
import pngToIco from 'png-to-ico';
import { writeFile, copyFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const svgPath = path.join(root, 'build', 'icon.svg');
const buildDir = path.join(root, 'build');

const icoSizes = [16, 24, 32, 48, 64, 128, 256];

const icoPngs = [];
for (const s of icoSizes) {
  icoPngs.push(await sharp(svgPath).resize(s, s).png().toBuffer());
}

await writeFile(path.join(buildDir, 'icon.png'), await sharp(svgPath).resize(512, 512).png().toBuffer());

const ico = await pngToIco(icoPngs);
await writeFile(path.join(buildDir, 'icon.ico'), ico);
await writeFile(path.join(root, 'electron', 'icon.ico'), ico);

await copyFile(svgPath, path.join(root, 'public', 'favicon.svg'));

console.log('Icons generated: build/icon.png, build/icon.ico, electron/icon.ico, public/favicon.svg');

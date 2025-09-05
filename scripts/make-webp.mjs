// Create .webp versions for images in public/images/product_photos
// Usage: node scripts/make-webp.mjs
// Requires: sharp (npm i -D sharp) OR cwebp binary in PATH

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const photosDir = path.resolve(__dirname, '../public/images/product_photos');

function exists(p) { try { fs.accessSync(p); return true; } catch { return false; } }

async function convertWithSharp(src, dst) {
  let sharp;
  try {
    sharp = (await import('sharp')).default;
  } catch (e) {
    return false;
  }
  await sharp(src).webp({ quality: 82 }).toFile(dst);
  return true;
}

function convertWithCwebp(src, dst) {
  return new Promise((resolve, reject) => {
    const ps = spawn('cwebp', ['-q', '82', src, '-o', dst], { stdio: 'inherit' });
    ps.on('exit', code => code === 0 ? resolve(true) : resolve(false));
    ps.on('error', () => resolve(false));
  });
}

async function main() {
  if (!exists(photosDir)) {
    console.error('Directory not found:', photosDir);
    process.exit(1);
  }
  const files = fs.readdirSync(photosDir).filter(f => /\.(jpe?g|png)$/i.test(f));
  if (files.length === 0) {
    console.log('No JPG/PNG files found in', photosDir);
    return;
  }
  let made = 0, skipped = 0, failed = 0;
  for (const f of files) {
    const src = path.join(photosDir, f);
    const dst = path.join(photosDir, f.replace(/\.(jpe?g|png)$/i, '.webp'));
    if (exists(dst)) { skipped++; continue; }
    let ok = await convertWithSharp(src, dst);
    if (!ok) ok = await convertWithCwebp(src, dst);
    if (ok) { made++; } else { failed++; }
  }
  console.log(`Done. webp created: ${made}, skipped: ${skipped}, failed: ${failed}`);
  if (failed > 0) process.exit(1);
}

main().catch(err => { console.error(err); process.exit(1); });


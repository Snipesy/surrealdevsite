#!/usr/bin/env node
// Makes small WebP thumbnails of post covers for the post lists, and records every image's
// size in src/data/media-sizes.json (committed) so the build can add width/height to <img>
// even where media/ isn't present, like Cloudflare's build.
// media/images/3f9a1c2b7e40.png → media/thumbs/images/3f9a1c2b7e40.webp
// Runs before `npm run dev` and `npm run media push`; skips thumbnails that are already up to date
// and covers that aren't in media/ (e.g. a fresh clone, where they come from the bucket).
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const POSTS = 'src/content/posts';
const WIDTH = 640;

const files = (await fs.readdir(POSTS, { recursive: true })).filter((f) => f.endsWith('.md'));
let made = 0;
for (const f of files) {
  const src = (await fs.readFile(path.join(POSTS, f), 'utf8')).match(/^cover:\s*"?([^"\n]+)"?\s*$/m)?.[1];
  if (!src || !src.startsWith('/') || src.endsWith('.svg')) continue; // SVGs are already small
  const input = path.join('media', src);
  const output = path.join('media/thumbs', src.replace(/\.[^./]+$/, '.webp'));
  try {
    const [i, o] = await Promise.all([fs.stat(input).catch(() => null), fs.stat(output).catch(() => null)]);
    if (!i) continue;
    if (o && o.mtimeMs >= i.mtimeMs) continue;
    await fs.mkdir(path.dirname(output), { recursive: true });
    await sharp(input).rotate().resize({ width: WIDTH, withoutEnlargement: true }).webp({ quality: 78 }).toFile(output);
    made++;
  } catch (e) {
    console.warn(`thumbs: skipped ${src} (${e.message})`);
  }
}
if (made) console.log(`thumbs: made ${made} thumbnail(s)`);

// Image sizes, keyed by URL path (/images/x.png). Only rewritten when media/ is here.
const IMAGES = 'media/images';
const names = await fs.readdir(IMAGES).catch(() => null);
if (names) {
  const sizes = {};
  for (const name of names.filter((n) => /\.(png|jpe?g|gif|webp|svg)$/i.test(n)).sort()) {
    try {
      const m = await sharp(path.join(IMAGES, name)).metadata();
      const turned = (m.orientation ?? 1) >= 5; // EXIF rotation swaps width and height
      if (m.width && m.height) sizes[`/images/${name}`] = turned ? [m.height, m.width] : [m.width, m.height];
    } catch {}
  }
  const out = 'src/data/media-sizes.json';
  const json = JSON.stringify(sizes, null, 0).replace(/],/g, '],\n') + '\n';
  if ((await fs.readFile(out, 'utf8').catch(() => '')) !== json) await fs.writeFile(out, json);
}

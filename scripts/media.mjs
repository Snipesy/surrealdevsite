#!/usr/bin/env node
// Uploads media/ to the R2 bucket (see README: "Media").
//
//   npm run media                 show what would be uploaded (nothing is sent)
//   npm run media -- --yes        upload new and changed files
//   npm run media -- strip FILE...  remove EXIF metadata (GPS, camera serials) from photos in place
//
// Never deletes anything from the bucket. Files whose content already matches the bucket are skipped.
// Credentials come from .env (see .env.example); use an R2 token limited to this one bucket.
import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import sharp from 'sharp';
import { S3Client, ListObjectsV2Command, PutObjectCommand } from '@aws-sdk/client-s3';
import { MEDIA_DIR, MEDIA_PREFIXES, contentType } from '../src/integrations/media.mjs';
import { PHOTO, locationIn } from './lib/location.mjs';

const args = process.argv.slice(2);
const SKIP = /(^|\/)(\.DS_Store|Thumbs\.db|\..*)$/;

if (args[0] === 'strip') {
  for (const file of args.slice(1)) await strip(file);
  process.exit(0);
}

try {
  process.loadEnvFile('.env');
} catch {}
const env = (k) => process.env[k] || fail(`Missing ${k}. Copy .env.example to .env and fill it in.`);
const bucket = env('R2_BUCKET');
const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${env('R2_ACCOUNT_ID')}.${process.env.R2_JURISDICTION ? `${process.env.R2_JURISDICTION}.` : ''}r2.cloudflarestorage.com`,
  credentials: { accessKeyId: env('R2_ACCESS_KEY_ID'), secretAccessKey: env('R2_SECRET_ACCESS_KEY') },
});
const upload = args.includes('--yes');

// Local files. Keys mirror URL paths, e.g. media/images/a.png → images/a.png → MEDIA_URL/images/a.png
const allowedTop = MEDIA_PREFIXES.map((p) => p.slice(1, -1));
const local = (await walk(MEDIA_DIR))
  .map((f) => ({ file: f, key: path.relative(MEDIA_DIR, f).split(path.sep).join('/') }))
  .filter(({ key }) => !SKIP.test(key));
const stray = local.filter(({ key }) => !allowedTop.includes(key.split('/')[0]));
if (stray.length) fail(`These aren't under ${allowedTop.map((t) => `media/${t}/`).join(', ')} so the site can't link to them:\n  ${stray.map((s) => s.file).join('\n  ')}`);

// Refuse to publish photos or videos that carry a location (or that can't be checked)
const located = [];
for (const { file } of local) {
  const why = await locationIn(file);
  if (why) located.push(`${file} (${why})`);
}
if (located.length) {
  fail(
    `These files contain, or may contain, location data:\n  ${located.join('\n  ')}\n` +
      `Photos: npm run media -- strip <file>. HEIC: convert to JPEG first. Videos: re-export without location, e.g.\n` +
      `  ffmpeg -i in.mp4 -map_metadata -1 -c copy out.mp4`
  );
}

// What's already in the bucket. R2's ETag is the MD5 for single-part uploads (what this script does);
// files uploaded in parts by other tools have an "md5-N" ETag, which is compared by size instead.
const remote = new Map();
for (let token; ; ) {
  const page = await s3.send(new ListObjectsV2Command({ Bucket: bucket, ContinuationToken: token })).catch((e) => {
    if (e.name === 'NoSuchBucket') fail(`Bucket "${bucket}" doesn't exist in account ${process.env.R2_ACCOUNT_ID}. Check R2_BUCKET in .env (an EU-jurisdiction bucket also needs R2_JURISDICTION=eu).`);
    if (e.$metadata?.httpStatusCode === 403) fail(`R2 refused the credentials for bucket "${bucket}". Check the token's keys and that it has Object Read & Write on this bucket.`);
    throw e;
  });
  for (const o of page.Contents || []) remote.set(o.Key, { etag: o.ETag?.replaceAll('"', ''), size: o.Size });
  if (!page.IsTruncated) break;
  token = page.NextContinuationToken;
}

const todo = [];
const sizeOnly = [];
for (const item of local) {
  const size = (await fs.stat(item.file)).size;
  const r = remote.get(item.key);
  if (r?.etag?.includes('-')) {
    if (r.size === size) {
      sizeOnly.push(item.key);
      continue;
    }
  } else if (r && r.etag === (await md5(item.file))) continue;
  todo.push({ ...item, size, isNew: !r });
}

const mb = (n) => `${(n / 1048576).toFixed(1)} MB`;
console.log(`${local.length} local files, ${remote.size} in bucket "${bucket}", ${todo.length} to upload (${mb(todo.reduce((s, t) => s + t.size, 0))})`);
for (const t of todo) console.log(`  ${t.isNew ? '+' : '~'} ${t.key} (${mb(t.size)})`);
if (sizeOnly.length) console.log(`${sizeOnly.length} file(s) were uploaded by another tool; same size, so assumed unchanged.`);
const orphans = [...remote.keys()].filter((k) => !local.some((l) => l.key === k));
if (orphans.length) console.log(`${orphans.length} file(s) are in the bucket but not in media/; left alone.`);

if (!todo.length) process.exit(0);
if (!upload) {
  console.log('\nDry run. Re-run with --yes to upload.');
  process.exit(0);
}
for (const t of todo) {
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: t.key,
      Body: await fs.readFile(t.file), // read one at a time, not all up front
      ContentType: contentType(t.file),
      // Files can be replaced under the same name, so don't cache forever
      CacheControl: 'public, max-age=86400',
    })
  );
  console.log(`  ✓ ${t.key}`);
}
console.log('Done.');

// ─────────
async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
  return (await Promise.all(entries.map((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)])))).flat();
}

async function md5(file) {
  const hash = createHash('md5');
  for await (const chunk of (await fs.open(file)).createReadStream()) hash.update(chunk);
  return hash.digest('hex');
}

async function strip(file) {
  if (!PHOTO.test(file)) return console.log(`skip ${file} (not a photo)`);
  const { format } = await sharp(file).metadata();
  if (!['jpeg', 'png', 'webp', 'tiff'].includes(format)) return console.log(`skip ${file} (${format}: convert it to JPEG first)`);
  // sharp drops metadata unless asked to keep it. rotate() bakes in the orientation; keepIccProfile()
  // keeps colours right (e.g. Display P3 iPhone photos). PNGs stay lossless: a quality setting would
  // switch on palette quantisation and cut them to 256 colours.
  const lossy = format === 'jpeg' || format === 'webp' ? { quality: 92 } : {};
  const out = await sharp(file).rotate().keepIccProfile().toFormat(format, lossy).toBuffer();
  await fs.writeFile(file, out);
  console.log(`stripped ${file}`);
}

function fail(msg) {
  console.error(msg);
  process.exit(1);
}

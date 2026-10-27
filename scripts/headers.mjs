// Appends the Content-Security-Policy to dist/_headers after the build. Run last by `npm run build`,
// after pagefind, so every inline <script> in dist/ is hashed and the policy needs no 'unsafe-inline'
// for scripts. Styles keep 'unsafe-inline': Shiki code blocks and the Pagefind UI use style attributes.
//
// Allowed third parties: Turnstile (contact form), YouTube embeds, the media bucket, and the
// Cloudflare Web Analytics beacon that Cloudflare injects into HTML responses.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { MEDIA_URL } from '../src/integrations/media.mjs';

const dist = 'dist';
const headersFile = path.join(dist, '_headers');

const hashes = new Set();
for (const file of fs.readdirSync(dist, { recursive: true }).filter((f) => f.endsWith('.html'))) {
  const html = fs.readFileSync(path.join(dist, file), 'utf8');
  for (const [, attrs, body] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
    // External scripts are covered by host rules; JSON-LD is data and never runs
    if (/\ssrc=/.test(attrs) || /ld\+json/.test(attrs)) continue;
    hashes.add(`'sha256-${crypto.createHash('sha256').update(body).digest('base64')}'`);
  }
}

const csp = [
  "default-src 'self'",
  // 'wasm-unsafe-eval' is for Pagefind's search index
  `script-src 'self' 'wasm-unsafe-eval' https://challenges.cloudflare.com https://static.cloudflareinsights.com ${[...hashes].sort().join(' ')}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: ${MEDIA_URL}`,
  `media-src 'self' ${MEDIA_URL}`,
  // Vite inlines font files under 4 KB into the CSS as data: URIs (one JetBrains Mono subset)
  "font-src 'self' data:",
  "connect-src 'self' https://cloudflareinsights.com",
  'frame-src https://challenges.cloudflare.com https://www.youtube-nocookie.com https://www.youtube.com',
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  'upgrade-insecure-requests',
].join('; ');

// A path rule given twice keeps only the last one, so the CSP goes into the existing /* block (from public/_headers)
const existing = fs.existsSync(headersFile) ? fs.readFileSync(headersFile, 'utf8') : '';
const line = `  Content-Security-Policy: ${csp}\n`;
const merged = /^\/\*\n/m.test(existing) ? existing.replace(/^\/\*\n/m, `/*\n${line}`) : `${existing.replace(/\s*$/, '\n')}\n/*\n${line}`;
fs.writeFileSync(headersFile, merged);
console.log(`headers: CSP written to ${headersFile} (${hashes.size} inline script hash${hashes.size === 1 ? '' : 'es'})`);

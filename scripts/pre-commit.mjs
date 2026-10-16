#!/usr/bin/env node
// Git pre-commit hook (installed by `npm install`, see "prepare" in package.json).
// Blocks commits that would publish secrets, location data, or media that belongs in the bucket,
// and posts/pages with broken frontmatter or accessibility problems (scripts/check-content.mjs).
// To skip it for one commit: git commit --no-verify
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { locationIn, PHOTO, VIDEO } from './lib/location.mjs';
import { checkContent } from './check-content.mjs';

const MAX_BYTES = 2 * 1024 * 1024;

// Files that must never be committed
const FORBIDDEN = [
  [/(^|\/)\.env(\..+)?$/, 'environment file with secrets'],
  [/(^|\/)\.dev\.vars$/, 'local secrets for wrangler'],
  [/\.(pem|key|p12|pfx)$/i, 'private key'],
  [/^media\//, 'media goes in the R2 bucket (npm run media), not git'],
];
const ALLOWED = [/(^|\/)\.env\.example$/, /(^|\/)\.dev\.vars\.example$/];

// Things that look like credentials in file contents
const SECRETS = [
  [/\b0x4[A-Za-z0-9_-]{30,}\b/, 'Turnstile secret key'],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, 'private key'],
  [/\b[\w.~-]{3}\dQ~[\w.~-]{31,34}\b/, 'Microsoft Entra client secret'],
  [/\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/, 'AWS access key'],
  // A secret variable with a value (empty values and Cloudflare's public 1x000... test keys are fine)
  [/^[ \t]*(?:R2_SECRET_ACCESS_KEY|R2_ACCESS_KEY_ID|MS_CLIENT_SECRET|TURNSTILE_SECRET_KEY|CLOUDFLARE_API_TOKEN)[ \t]*=[ \t]*(?![1-3]x0{20,})[^\s#]{8,}/m, 'filled-in secret variable'],
];

const git = (...args) => execFileSync('git', args, { maxBuffer: 1 << 28 });
const staged = git('diff', '--cached', '--name-only', '--diff-filter=ACMR', '-z').toString().split('\0').filter(Boolean);

const problems = [];
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'precommit-'));
try {
  for (const file of staged) {
    if (!ALLOWED.some((re) => re.test(file))) {
      const hit = FORBIDDEN.find(([re]) => re.test(file));
      if (hit) {
        problems.push(`${file}: ${hit[1]}`);
        continue;
      }
    }
    const blob = git('show', `:${file}`); // the staged version, not the working copy
    if (blob.length > MAX_BYTES) problems.push(`${file}: ${(blob.length / 1048576).toFixed(1)} MB; large files belong in the media bucket`);

    if (PHOTO.test(file) || VIDEO.test(file)) {
      const copy = path.join(tmp, `f${path.extname(file)}`);
      fs.writeFileSync(copy, blob);
      const why = await locationIn(copy);
      if (why) problems.push(`${file}: ${why}`);
      continue;
    }
    if (blob.includes(0)) continue; // other binary files
    const text = blob.toString('utf8');
    for (const [re, what] of SECRETS) if (re.test(text)) problems.push(`${file}: looks like it contains a ${what}`);
    if (/^src\/content\/.+\.md$/.test(file)) for (const p of checkContent(text)) problems.push(`${file}: ${p}`);
  }
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}

if (problems.length) {
  console.error(`\npre-commit: not committing.\n  ${problems.join('\n  ')}\n\nFix these, or commit with --no-verify if you're sure.\n`);
  process.exit(1);
}

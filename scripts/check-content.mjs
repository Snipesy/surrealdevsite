#!/usr/bin/env node
// Checks posts and pages for problems a build won't catch: broken frontmatter and accessibility.
//
//   npm run check                  check everything in src/content
//   node scripts/check-content.mjs FILE...
//
// Also run on staged Markdown by the pre-commit hook (scripts/pre-commit.mjs).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

/** Problems in one Markdown file, as "line N: message" strings. */
export function checkContent(text) {
  const problems = [];
  const fm = text.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!fm) return ['line 1: missing frontmatter (--- ... ---)'];
  try {
    const data = YAML.parse(fm[1]) ?? {};
    if (!data.title) problems.push('frontmatter: missing title');
  } catch (e) {
    // A straight " inside a "double-quoted" value is the usual cause
    problems.push(`frontmatter: not valid YAML (${e.message.split('\n')[0]})`);
  }

  const offset = fm[0].split('\n').length - 1;
  const lines = text.slice(fm[0].length).split('\n');
  let fence = null;
  let prevLevel = 1; // the page title is the h1
  lines.forEach((line, i) => {
    const at = `line ${i + 1 + offset}`;
    const f = line.match(/^\s*(`{3,}|~{3,})/);
    if (f) {
      if (!fence) fence = f[1];
      else if (line.trim().startsWith(fence)) fence = null;
      return;
    }
    if (fence) return;
    const code = line.replace(/`[^`]*`/g, ''); // ignore inline code

    // Headings: one h1 per page (the title), and no skipped levels, so screen reader users can navigate by them
    const h = code.match(/^(#{1,6})\s/) ?? code.match(/<h([1-6])[\s>]/i);
    if (h) {
      const level = h[1].startsWith('#') ? h[1].length : Number(h[1]);
      if (level === 1) problems.push(`${at}: top-level heading in the body; the page title is already the h1, use ## instead`);
      else if (level > prevLevel + 1) problems.push(`${at}: heading skips from h${prevLevel} to h${level}`);
      if (/^#{1,6}\s+!\[/.test(code)) problems.push(`${at}: image inside a heading; its description would be read as the heading`);
      prevLevel = level;
    }

    // Images need a description, unless explicitly decorative: <img alt="" role="presentation">
    for (const m of code.matchAll(/!\[([^\]]*)\]\(([^)\s]+)/g)) {
      if (!m[1].trim()) problems.push(`${at}: image without alt text: ${m[2]}`);
    }
    for (const m of code.matchAll(/<img\b[^>]*>/gi)) {
      const tag = m[0];
      const alt = tag.match(/\salt\s*=\s*(["'])(.*?)\1/i);
      const decorative = /role\s*=\s*["']?(presentation|none)|aria-hidden\s*=\s*["']?true/i.test(tag);
      if (!alt) problems.push(`${at}: <img> without an alt attribute`);
      else if (!alt[2].trim() && !decorative) problems.push(`${at}: <img alt=""> is only for decorative images; describe it, or add role="presentation"`);
    }

    // Links need text, or screen readers just read the URL
    for (const m of code.matchAll(/(^|[^!])\[\s*\]\(([^)]*)\)/g)) problems.push(`${at}: link without text: ${m[2]}`);
    for (const m of code.matchAll(/<a\b[^>]*>\s*<\/a>/gi)) problems.push(`${at}: empty <a> link`);

    // Embedded frames need a title
    for (const m of code.matchAll(/<iframe\b[^>]*>/gi)) {
      if (!/\stitle\s*=\s*["'][^"']+/.test(m[0])) problems.push(`${at}: <iframe> without a title`);
    }
  });
  return problems;
}

// CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const files = args.length
    ? args
    : fs.readdirSync('src/content', { recursive: true }).filter((f) => f.endsWith('.md')).map((f) => path.join('src/content', f));
  let count = 0;
  for (const file of files) {
    for (const p of checkContent(fs.readFileSync(file, 'utf8'))) {
      console.error(`${file}: ${p}`);
      count++;
    }
  }
  if (count) {
    console.error(`\n${count} problem(s) in ${files.length} file(s).`);
    process.exit(1);
  }
  console.log(`check: ${files.length} file(s) OK`);
}

// Images, videos and downloads live in an R2 bucket, not in git (see README: "Media").
//
// Content refers to them by path (/images/..., /thumbs/...), with the files
// kept locally under media/ for uploading.
//   npm run build: those paths in the built HTML/XML are rewritten to MEDIA_URL (the bucket's domain).
//   npm run dev:   they're served from media/ if the file is there, else redirected to MEDIA_URL,
//                  so a fresh clone works without downloading anything.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const MEDIA_DIR = 'media';
export const MEDIA_PREFIXES = ['/images/', '/thumbs/'];
export const MEDIA_URL = (process.env.MEDIA_URL || 'https://media.surrealdev.com').replace(/\/$/, '');

const isMedia = (p) => typeof p === 'string' && MEDIA_PREFIXES.some((pre) => p.startsWith(pre));
const prefixAlt = MEDIA_PREFIXES.map((p) => p.replace(/\//g, '\\/')).join('|');

// Image sizes recorded by scripts/thumbs.mjs
const sizes = (() => {
  try {
    return JSON.parse(fs.readFileSync('src/data/media-sizes.json', 'utf8'));
  } catch {
    return {};
  }
})();

/**
 * Content images: add width/height (so the page doesn't jump while they load) and lazy loading.
 * The cover at the top of a post is the main image, so it loads eagerly with high priority.
 */
function sizeImages(html) {
  return html.replace(/<img\b[^>]*>/g, (tag) => {
    const src = tag.match(/\ssrc="([^"]+)"/)?.[1];
    // Sizes are keyed by path; drop a #light/#dark marker (see README: "Light and dark images")
    const key = src && MEDIA_PREFIXES.some((p) => src.startsWith(p)) ? decodeURI(src.split('#')[0]) : null;
    if (!key || key.startsWith('/thumbs/')) return tag;
    let out = tag;
    const size = sizes[key];
    if (size && !/\swidth=/.test(out)) out = out.replace(/<img\b/, `<img width="${size[0]}" height="${size[1]}"`);
    if (/class="cover"/.test(out)) {
      if (!/fetchpriority=/.test(out)) out = out.replace(/<img\b/, '<img fetchpriority="high"');
    } else if (!/\sloading=/.test(out)) {
      out = out.replace(/<img\b/, '<img loading="lazy" decoding="async"');
    }
    return out;
  });
}

/** After a build: point media paths in every HTML/XML file at the bucket. */
async function rewriteDist(distDir, site) {
  const own = site ? site.origin.replace(/[.\/]/g, (c) => '\\' + c) : null;
  const path_ = `(?:${own ?? ''})?(${prefixAlt})`;
  // At the start of attribute values (src="/images/...", content="https://surrealdev.com/images/...")
  // and in CSS url(...), including HTML-escaped quotes
  const re = new RegExp(`(=["']|url\\((?:["']|&quot;|&#39;)?|"image":")${path_}`, 'g');
  // Every candidate in a srcset ("/a.png 1x, /images/b.png 2x")
  const srcsetRe = /(srcset=)(["'])(.*?)\2/gs;
  const candidateRe = new RegExp(`(^|,\\s*)${path_}`, 'g');
  const rewrite = (html) =>
    html
      .replace(srcsetRe, (_m, attr, q, v) => attr + q + v.replace(candidateRe, (_c, lead, pre) => lead + MEDIA_URL + pre) + q)
      .replace(re, (_m, lead, pre) => lead + MEDIA_URL + pre);
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
  let n = 0;
  for (const file of walk(distDir)) {
    if (!/\.(html|xml)$/.test(file)) continue;
    const before = fs.readFileSync(file, 'utf8');
    const after = rewrite(file.endsWith('.html') ? sizeImages(before) : before);
    if (after !== before) fs.writeFileSync(file, after), n++;
  }
  return n;
}

const TYPES = {
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp',
  '.svg': 'image/svg+xml', '.mp4': 'video/mp4', '.m4v': 'video/mp4', '.webm': 'video/webm', '.zip': 'application/zip',
  '.pdf': 'application/pdf',
};
export const contentType = (file) => TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream';

/** Dev server: serve media/ locally, fall back to the bucket. */
function devMiddleware(root) {
  const dir = path.resolve(root, MEDIA_DIR);
  return (req, res, next) => {
    const url = (req.url || '').split('?')[0];
    if (!isMedia(url)) return next();
    let file;
    try {
      file = path.join(dir, decodeURIComponent(url));
    } catch {
      return next();
    }
    if (!file.startsWith(dir + path.sep)) return next();
    if (fs.existsSync(file) && fs.statSync(file).isFile()) {
      res.setHeader('Content-Type', contentType(file));
      return fs.createReadStream(file).pipe(res);
    }
    res.statusCode = 302;
    res.setHeader('Location', MEDIA_URL + url);
    res.end();
  };
}

export default function media() {
  let site, root;
  return {
    name: 'media',
    hooks: {
      'astro:config:setup': ({ config }) => {
        root = fileURLToPath(config.root);
      },
      'astro:server:setup': ({ server }) => {
        server.middlewares.use(devMiddleware(root));
      },
      'astro:config:done': ({ config }) => {
        site = config.site ? new URL(config.site) : null;
      },
      'astro:build:done': async ({ dir, logger }) => {
        const n = await rewriteDist(fileURLToPath(dir), site);
        logger.info(`media links point at ${MEDIA_URL} (${n} files)`);
      },
    },
  };
}

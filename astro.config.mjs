import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import media from './src/integrations/media.mjs';
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

// Last-modified dates for the sitemap, from each post's and page's frontmatter (URL = file name)
const lastmod = new Map();
for (const dir of ['src/content/posts', 'src/content/pages']) {
  for (const file of fs.readdirSync(dir, { recursive: true }).filter((f) => f.endsWith('.md'))) {
    const fm = YAML.parse(fs.readFileSync(path.join(dir, file), 'utf8').match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '') ?? {};
    const date = fm.updated ?? fm.date;
    if (date) lastmod.set(`/${path.basename(file, '.md')}/`, new Date(date).toISOString());
  }
}

export default defineConfig({
  site: 'https://surrealdev.com',
  // WordPress URLs end in a slash (/the-abcs-of-global-b/), so keep them that way.
  trailingSlash: 'always',
  integrations: [
    sitemap({
      // Leave out search and the month/page listings, which just repeat the posts
      filter: (url) => !/\/(search|page\/\d+|\d{4}\/\d{2})\/$/.test(new URL(url).pathname),
      serialize: (item) => ({ ...item, lastmod: lastmod.get(new URL(item.url).pathname) }),
    }),
    media(),
  ],
  markdown: {
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark-dimmed' },
      wrap: false,
    },
  },
});

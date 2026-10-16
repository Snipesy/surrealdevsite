import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const posts = defineCollection({
  // Posts live in year folders (posts/2026/my-post.md); the URL is the file name only: /my-post/
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/posts',
    generateId: ({ entry }) => entry.split('/').pop()!.replace(/\.md$/, ''),
  }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    // Category slugs; names and URLs live in src/data/categories.json
    categories: z.array(z.string()).default([]),
    excerpt: z.string().optional(),
    cover: z.string().optional(),
    // Description of the cover, when it shows more than the title does (e.g. a comic)
    coverAlt: z.string().default(''),
    draft: z.boolean().default(false),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date().optional(),
    updated: z.coerce.date().optional(),
    excerpt: z.string().optional(),
    // Hide from search/sitemap-style listings if needed
    hidden: z.boolean().default(false),
    // Optional form shown after the page text; submissions go to functions/api/form.js
    form: z
      .object({
        submit: z.string().default('Submit'),
        fields: z.array(
          z.object({
            name: z.string().regex(/^[a-z][\w-]*$/),
            label: z.string(),
            type: z.enum(['text', 'email', 'textarea', 'select', 'checkbox']).default('text'),
            required: z.boolean().default(false),
            options: z.array(z.string()).optional(), // select only
            help: z.string().optional(), // shown under the field
          })
        ),
        note: z.string().optional(), // shown above the submit button
      })
      .optional(),
  }),
});

export const collections = { posts, pages };

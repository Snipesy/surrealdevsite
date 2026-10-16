import { getCollection, type CollectionEntry } from 'astro:content';
import categoryData from '../data/categories.json';

export type Post = CollectionEntry<'posts'>;
export type Category = { slug: string; name: string; path: string };

export const categories: Category[] = categoryData;

export function categoryBySlug(slug: string): Category {
  return (
    categories.find((c) => c.slug === slug) ?? { slug, name: titleCase(slug), path: slug }
  );
}

export function categoryUrl(slug: string) {
  return `/category/${categoryBySlug(slug).path}/`;
}

export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection('posts', ({ data }) => !data.draft);
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export function postUrl(post: Post) {
  return `/${post.id}/`;
}

export function excerptOf(post: Post, max = 260) {
  if (post.data.excerpt) return post.data.excerpt;
  const text = (post.body ?? '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`|-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > max ? text.slice(0, max).replace(/\s+\S*$/, '') + '...' : text;
}

export function readingMinutes(post: Post) {
  const words = (post.body ?? '').split(/\s+/).length;
  return Math.max(1, Math.round(words / 230));
}

export function formatDate(d: Date, style: 'short' | 'long' = 'long') {
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: style === 'long' ? 'long' : 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export function isoDay(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function monthKey(d: Date) {
  return `${d.getUTCFullYear()}/${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

export function monthLabel(key: string) {
  const [y, m] = key.split('/').map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function titleCase(s: string) {
  return s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Small list-view version of a cover, made by scripts/thumbs.mjs. */
export function thumbUrl(cover: string) {
  return cover.endsWith('.svg') || !cover.startsWith('/') ? cover : `/thumbs${cover.replace(/\.[^./]+$/, '.webp')}`;
}

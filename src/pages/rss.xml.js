import rss from '@astrojs/rss';
import { getPosts, excerptOf, categoryBySlug } from '../lib/posts';
import { SITE } from '../site';

export async function GET(context) {
  const posts = await getPosts();
  return rss({
    title: SITE.title,
    description: SITE.tagline,
    site: context.site,
    items: posts.slice(0, 30).map((p) => ({
      title: p.data.title,
      pubDate: p.data.date,
      description: excerptOf(p),
      link: `/${p.id}/`,
      categories: p.data.categories.map((c) => categoryBySlug(c).name),
      author: SITE.author,
    })),
  });
}

import rss from '@astrojs/rss';
import writeups from '../data/writeups.json';

export async function GET(context) {
  return rss({
    title: 'Satvik Nagpal — Writeups',
    description: 'Technical articles on graphics programming, optimization, and engine systems.',
    site: context.site,
    items: writeups
      .filter(w => !w.draft)
      .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
      .map(w => ({
        title: w.title,
        pubDate: new Date(w.pubDate),
        description: w.description,
        link: `/writeups/${w.slug}/`,
      })),
  });
}

import { getAllArticlesForSitemap } from "@/lib/contentful";

export const GET = async () => {
  const baseUrl = 'https://asbible.com';

  const staticPages = [
    { url: '', priority: 1, changefreq: 'monthly' },
    { url: '/bible', priority: 0.5, changefreq: 'monthly' },
    { url: '/blog', priority: 0.9, changefreq: 'weekly' },
    { url: '/chat', priority: 0.5, changefreq: 'monthly' },
    { url: '/2026每日读经表', priority: 0.6, changefreq: 'yearly' },
  ];

  const allArticles = await getAllArticlesForSitemap(500);

  const urls = [
    ...staticPages.map((page) => ({
      loc: `${baseUrl}${page.url}`,
      priority: page.priority,
      changefreq: page.changefreq,
      lastmod: new Date().toISOString().split('T')[0],
    })),
    ...allArticles.map((article) => ({
      loc: `${baseUrl}/blog/${encodeURIComponent(article.slug)}`,
      priority: 0.8,
      changefreq: 'weekly',
      lastmod: article.publishedDate ? new Date(article.publishedDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    })),
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${urls
        .map((url) => `
            <url>
              <loc>${url.loc}</loc>
              <lastmod>${url.lastmod}</lastmod>
              <changefreq>${url.changefreq}</changefreq>
              <priority>${url.priority}</priority>
            </url>
          `)
        .join('')}
    </urlset>
  `;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
    },
  });
};

import { getAllArticles } from "@/lib/contentful"; // Import from your content fetching library

export const GET = async (req) => {
  const baseUrl = 'https://asbible.com'; // Your actual domain

  // Static pages (replace as necessary)
  const staticPages = [
    '',
    '/bible',
    '/blog',
    '/chat',
  ];

  // Fetch all articles (with pagination logic)
  let allArticles = []; // Accumulate all articles here
  let skip = 0;         // Start at 0 to get the first page of results
  const limit = 10;     // Contentful limit for fetching articles per request
  let hasMoreArticles = true; // Flag to indicate if more articles exist

  // Continue fetching articles until none are left
  while (hasMoreArticles) {
    const articlesBatch = await getAllArticles(limit, skip); // Fetch articles from Contentful
    allArticles = [...allArticles, ...articlesBatch];         // Append fetched articles to the accumulated array
    skip += articlesBatch.length;                             // Move the skip value forward by the number of articles fetched

    // Stop fetching if fewer than 'limit' articles are returned (means no more articles to fetch)
    if (articlesBatch.length < limit) {
      hasMoreArticles = false;
    }
  }

  // Create a list of URLs for static and dynamic (blog) pages
  const urls = [
    ...staticPages.map((page) => `${baseUrl}${page}`),                  // Static pages
    ...allArticles.map(
      (article) =>
        `${baseUrl}/blog/${encodeURIComponent(article.slug)}`
    ),
  ];

  // Generate sitemap XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${urls
        .map((url) => {
          return `
            <url>
              <loc>${url}</loc>
              <changefreq>weekly</changefreq>
              <priority>0.8</priority>
            </url>
          `;
        })
        .join('')}
    </urlset>
  `;

  // Return the sitemap XML response
  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
};

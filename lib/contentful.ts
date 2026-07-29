const ARTICLE_GRAPHQL_FIELDS = `
  sys {
    id
  }
  title
  slug
  excerpt
  content {
    json
    links {
      assets {
        block {
          sys {
            id
          }
          url
          description
        }
      }
    }
  }
  publishedDate
  coverImage {
    url
  }
`;

export interface Article {
  sys: {
    id: string;
  };
  title: string;
  slug: string;
  excerpt?: string;
  content: {
    json: unknown;
    links: {
      assets: {
        block: {
          sys: {
            id: string;
          };
          url: string;
          description: string;
        }[];
      };
    };
  };
  publishedDate?: string;
  coverImage?: {
    url: string;
  } | null;
}

function hasContentfulEnv(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID &&
    process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN
  );
}

async function fetchGraphQL(
  query: string,
  preview: boolean,
  variables?: Record<string, unknown>
): Promise<unknown> {
  if (!hasContentfulEnv()) {
    console.warn(
      'Contentful: set NEXT_PUBLIC_CONTENTFUL_SPACE_ID and NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN'
    );
    return { data: { blogCollection: { items: [] } } };
  }

  const token = preview
    ? process.env.NEXT_PUBLIC_CONTENTFUL_PREVIEW_ACCESS_TOKEN ||
      process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN
    : process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN;

  const response = await fetch(
    `https://graphql.contentful.com/content/v1/spaces/${process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query, variables: variables ?? {} }),
      next: { tags: ['articles'] },
    }
  );

  return response.json();
}

const ARTICLE_PREVIEW_GRAPHQL_FIELDS = `
  sys {
    id
  }
  title
  slug
  excerpt
  publishedDate
  coverImage {
    url
  }
`;

function extractArticleEntries(fetchResponse: unknown): Article[] {
  const fr = fetchResponse as {
    errors?: { message: string }[];
    data?: { blogCollection?: { items?: Article[] } };
  };
  if (fr.errors?.length) {
    console.error(
      'Contentful GraphQL:',
      fr.errors.map((e) => e.message).join('; ')
    );
  }
  return fr.data?.blogCollection?.items ?? [];
}

export async function getAllArticles(
  limit = 12,
  skip = 0,
  isDraftMode = false
): Promise<Article[]> {
  const query = `query AllArticles($limit: Int!, $skip: Int!) {
    blogCollection(
      where: { slug_exists: true }
      order: publishedDate_DESC
      limit: $limit
      skip: $skip
      preview: ${isDraftMode ? 'true' : 'false'}
    ) {
      items {
        ${ARTICLE_PREVIEW_GRAPHQL_FIELDS}
      }
    }
  }`;

  const raw = await fetchGraphQL(query, isDraftMode, { limit, skip });
  return extractArticleEntries(raw);
}

/**
 * Allow Unicode letters (e.g. Hungarian titles). Block path injection and control chars.
 * Set BLOG_SLUG_ASCII_ONLY=true to reject non-ASCII slugs (404).
 */
function isValidContentfulSlug(slug: string): boolean {
  if (slug.length === 0 || slug.length > 500) return false;
  if (/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(slug)) return false;
  if (slug.includes('/') || slug.includes('\\')) return false;
  if (slug.includes('..')) return false;
  if (process.env.BLOG_SLUG_ASCII_ONLY === 'true') {
    if (!/^[\x20-\x7E]+$/.test(slug)) return false;
  }
  return true;
}

export async function getArticle(
  slug: string,
  isDraftMode = false
): Promise<Article | null> {
  const normalized = slug.normalize('NFC');
  if (!isValidContentfulSlug(normalized)) {
    return null;
  }

  const query = `query ArticleBySlug($slug: String!) {
    blogCollection(
      where: { slug: $slug }
      limit: 1
      preview: ${isDraftMode ? 'true' : 'false'}
    ) {
      items {
        ${ARTICLE_GRAPHQL_FIELDS}
      }
    }
  }`;

  const raw = await fetchGraphQL(query, isDraftMode, { slug: normalized });
  const article = extractArticleEntries(raw)[0];
  if (!article?.content?.json) return null;

  return {
    ...article,
    content: article.content.json,
  } as Article;
}

const SITEMAP_GRAPHQL_FIELDS = `
  slug
  publishedDate
`;

interface SitemapArticle {
  slug: string;
  publishedDate?: string;
}

export async function getAllArticlesForSitemap(
  limit = 100
): Promise<SitemapArticle[]> {
  const query = `query AllArticlesForSitemap($limit: Int!) {
    blogCollection(
      where: { slug_exists: true }
      order: publishedDate_DESC
      limit: $limit
    ) {
      items {
        ${SITEMAP_GRAPHQL_FIELDS}
      }
    }
  }`;

  const raw = await fetchGraphQL(query, false, { limit });
  const fr = raw as {
    errors?: { message: string }[];
    data?: { blogCollection?: { items?: SitemapArticle[] } };
  };
  if (fr.errors?.length) {
    console.error('Contentful GraphQL:', fr.errors.map((e) => e.message).join('; '));
  }
  return fr.data?.blogCollection?.items ?? [];
}

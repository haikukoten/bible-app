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
  limit = 10,
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
        ${ARTICLE_GRAPHQL_FIELDS}
      }
    }
  }`;

  const raw = await fetchGraphQL(query, isDraftMode, { limit, skip });
  return extractArticleEntries(raw);
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/i;

export async function getArticle(
  slug: string,
  isDraftMode = false
): Promise<Article | null> {
  if (!SLUG_PATTERN.test(slug) || slug.length > 200) {
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

  const raw = await fetchGraphQL(query, isDraftMode, { slug });
  const article = extractArticleEntries(raw)[0];
  if (!article?.content?.json) return null;

  return {
    ...article,
    content: article.content.json,
  } as Article;
}

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
  excerpt?: string; // Optional
  content: {
    json: any;
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
  publishedDate?: string; // Optional, depending on content model use
  coverImage: {
    url: string;
  };
}

async function fetchGraphQL(query: string, preview = false): Promise<any> {
  const response = await fetch(
    `https://graphql.contentful.com/content/v1/spaces/${process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${
          preview
            ? process.env.NEXT_PUBLIC_CONTENTFUL_PREVIEW_ACCESS_TOKEN
            : process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN
        }`,
      },
      body: JSON.stringify({ query }),
      next: { tags: ["articles"] },
    }
  );

  return await response.json();
}

function extractArticleEntries(fetchResponse: any): Article[] {
  return fetchResponse?.data?.blogCollection?.items || [];
}

export async function getAllArticles(
  limit = 10, // Default limit per request
  skip = 0,   // Default skip for pagination
  isDraftMode = false
): Promise<Article[]> {
  const query = `query {
    blogCollection(where: { slug_exists: true }, order: publishedDate_DESC, limit: ${limit}, skip: ${skip}, preview: ${
      isDraftMode ? "true" : "false"
    }) {
      items {
        ${ARTICLE_GRAPHQL_FIELDS}
      }
    }
  }`;

  const articles = await fetchGraphQL(query, isDraftMode);
  return extractArticleEntries(articles);
}

export async function getArticle(
  slug: string,
  isDraftMode = false
): Promise<Article | null> {
  const query = `query {
    blogCollection(where: { slug: "${slug}" }, limit: 1, preview: ${
      isDraftMode ? "true" : "false"
    }) {
      items {
        ${ARTICLE_GRAPHQL_FIELDS}
      }
    }
  }`;

  const article = extractArticleEntries(await fetchGraphQL(query, isDraftMode))[0];
  return article ? { ...article, content: article.content.json } : null;
}

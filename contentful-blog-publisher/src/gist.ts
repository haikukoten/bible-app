/**
 * Creates a GitHub Gist that stores the article brief / image prompt (the “gist” used for the cover image).
 */

export type GistResult = {
  htmlUrl: string;
  id: string;
};

export async function createArticleGist(params: {
  title: string;
  description: string;
  body: string;
}): Promise<GistResult | null> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.warn(
      '[gist] GITHUB_TOKEN not set — skipping Gist (add token to .env to enable)'
    );
    return null;
  }

  const filename = `article-brief-${Date.now()}.txt`;
  const res = await fetch('https://api.github.com/gists', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      description: params.description.slice(0, 255),
      public: process.env.GIST_PUBLIC === 'true',
      files: {
        [filename]: {
          content: params.body,
        },
      },
    }),
  });

  const data = (await res.json()) as {
    id?: string;
    html_url?: string;
    message?: string;
  };

  if (!res.ok) {
    throw new Error(
      `GitHub Gist API failed: ${res.status} ${data.message ?? JSON.stringify(data)}`
    );
  }

  if (!data.id || !data.html_url) {
    throw new Error('GitHub Gist response missing id or html_url');
  }

  return { id: data.id, htmlUrl: data.html_url };
}

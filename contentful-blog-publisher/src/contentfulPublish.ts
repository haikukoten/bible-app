import { createRequire } from 'module';
import { Readable } from 'stream';
import type { Document } from '@contentful/rich-text-types';

/** CJS entry — ESM named import fails under tsx/Node 22 for this package. */
const require = createRequire(import.meta.url);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { createClient } = require('contentful-management') as { createClient: (p: { accessToken: string }) => any };

const locale = () => process.env.CONTENTFUL_LOCALE ?? 'en-US';

/** Blog `excerpt` is a Short text field (255 char max in Contentful). */
export function truncateContentfulExcerpt(text: string, maxLen = 255): string {
  const t = text.trim();
  if (t.length <= maxLen) return t;
  const ellipsis = '…';
  const budget = maxLen - ellipsis.length;
  let cut = t.slice(0, budget);
  const lastSpace = cut.lastIndexOf(' ');
  if (lastSpace > budget * 0.45) cut = cut.slice(0, lastSpace);
  return cut.trimEnd() + ellipsis;
}

export async function publishBlogPost(params: {
  title: string;
  slug: string;
  excerpt: string;
  content: Document;
  coverImageBuffer: Buffer;
  coverMimeType: string;
  gistUrl: string;
}): Promise<{ entryId: string }> {
  const token = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
  const spaceId = process.env.CONTENTFUL_SPACE_ID;
  const envId = process.env.CONTENTFUL_ENVIRONMENT_ID ?? 'master';
  const contentTypeId = process.env.CONTENTFUL_BLOG_CONTENT_TYPE_ID ?? 'blog';

  if (!token) throw new Error('CONTENTFUL_MANAGEMENT_TOKEN is required');
  if (!spaceId) throw new Error('CONTENTFUL_SPACE_ID is required');

  const client = createClient({ accessToken: token });

  let space;
  try {
    space = await client.getSpace(spaceId);
  } catch (e: unknown) {
    const ne = e as { name?: string; status?: number };
    const msg = e instanceof Error ? e.message : '';
    if (
      ne.name === 'AccessTokenInvalid' ||
      ne.status === 403 ||
      msg.includes('AccessTokenInvalid') ||
      msg.includes('could not be found or is invalid')
    ) {
      throw new Error(
        'Contentful 403: invalid token or wrong type. Create a Content **Management** API token in Contentful → Settings → API keys → Content management tokens and set CONTENTFUL_MANAGEMENT_TOKEN. The Content **Delivery** API token (NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN on the site) cannot publish entries or upload assets.'
      );
    }
    throw e;
  }

  const environment = await space.getEnvironment(envId);

  const ext =
    params.coverMimeType.includes('png')
      ? 'png'
      : params.coverMimeType.includes('jpeg') || params.coverMimeType.includes('jpg')
        ? 'jpg'
        : 'png';
  const fileName = `cover-${Date.now()}.${ext}`;
  const loc = locale();

  const asset = await environment.createAssetFromFiles({
    fields: {
      title: { [loc]: params.title },
      description: {
        [loc]: `Cover for "${params.title}". Gist brief: ${params.gistUrl}`,
      },
      file: {
        [loc]: {
          contentType: params.coverMimeType || 'image/png',
          fileName,
          file: Readable.from(params.coverImageBuffer),
        },
      },
    },
  });

  const processed = await asset.processForAllLocales({
    processingCheckRetries: 15,
    processingCheckWait: 2000,
  });
  await processed.publish();

  const assetId = processed.sys.id;

  const publishedDate = new Date().toISOString();

  const entry = await environment.createEntry(contentTypeId, {
    fields: {
      title: { [loc]: params.title },
      slug: { [loc]: params.slug },
      excerpt: { [loc]: truncateContentfulExcerpt(params.excerpt) },
      content: { [loc]: params.content },
      publishedDate: { [loc]: publishedDate },
      coverImage: {
        [loc]: {
          sys: {
            type: 'Link',
            linkType: 'Asset',
            id: assetId,
          },
        },
      },
    },
  });

  const published = await entry.publish();
  return { entryId: published.sys.id };
}

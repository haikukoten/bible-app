import './loadEnv.js';
import { loadPublisherConfig } from './config.js';
import {
  generateArticleBrief,
  generateArticleBody,
  generateCoverImageBuffer,
} from './openai.js';
import { createArticleGist } from './gist.js';
import { blocksToDocument, type BodyBlock } from './richText.js';
import { publishBlogPost } from './contentfulPublish.js';
import { loadTopics, type BlogTopic } from './topics.js';
import { addInternalLinksToDocument } from './internalLinker.js';

/** Unicode-friendly slug (matches Contentful + Next URL encoding). */
export function uniqueSlugFromTitle(title: string): string {
  const base = title
    .normalize('NFC')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{N}\-_]+/gu, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  const suffix = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
  return `${base || 'post'}-${suffix}`;
}

export type PipelineResult = { nextTopicIndex: number };

/** How many articles to publish per scheduled cycle (default 2). */
export function postsPerRunFromEnv(): number {
  const v = process.env.POSTS_PER_RUN;
  const n = v !== undefined ? parseInt(v, 10) : 2;
  return Number.isFinite(n) && n >= 1 ? Math.min(n, 50) : 2;
}

export async function runPublishPipeline(options?: {
  topicIndex?: number;
  /** Overrides `POSTS_PER_RUN` for this invocation. */
  postsPerRun?: number;
}): Promise<PipelineResult> {
  const editorial = await loadPublisherConfig();
  const topics = await loadTopics();
  const startIndex = options?.topicIndex ?? 0;
  const count = options?.postsPerRun ?? postsPerRunFromEnv();

  for (let i = 0; i < count; i++) {
    const topicIndex =
      topics.length > 0 ? (startIndex + i) % topics.length : startIndex;
    await publishOneArticle(editorial, topics, topicIndex, i + 1, count);
  }

  const nextTopicIndex =
    topics.length > 0 ? (startIndex + count) % topics.length : startIndex;

  console.log('[pipeline] Batch complete. Next topic index:', nextTopicIndex);

  return { nextTopicIndex };
}

async function publishOneArticle(
  editorial: string,
  topics: BlogTopic[],
  topicIndex: number,
  batchPosition: number,
  batchTotal: number
): Promise<void> {
  let topic: BlogTopic | undefined;
  if (topics.length > 0) {
    topic = topics[topicIndex % topics.length];
    console.log(
      `[pipeline] Post ${batchPosition}/${batchTotal} — topic ${(topicIndex % topics.length) + 1}/${topics.length}: "${topic.keyword}" (${topic.language})`
    );
  } else {
    console.log(
      `[pipeline] Post ${batchPosition}/${batchTotal} — no topics.txt (or empty) — using config.txt only.`
    );
  }

  console.log('[pipeline] Generating editorial brief (OpenAI)…');
  const brief = await generateArticleBrief(editorial, topic);

  console.log('[pipeline] Creating GitHub Gist with brief…');
  const gist = await createArticleGist({
    title: brief.title,
    description: `Blog brief: ${brief.title}`,
    body: brief.gistBody,
  });
  const gistUrl = gist?.htmlUrl ?? '(no gist — set GITHUB_TOKEN)';
  console.log('[pipeline] Gist:', gistUrl);

  console.log('[pipeline] Generating cover image (OpenAI Images)…');
  const { buffer: imageBuffer, mimeType } = await generateCoverImageBuffer({
    excerpt: brief.excerpt,
    title: brief.title,
  });

  console.log('[pipeline] Writing article body (OpenAI)…');
  const body = await generateArticleBody(editorial, brief, topic);

  const blocks: BodyBlock[] = body.blocks.map((b) => {
    if (b.type === 'paragraph') return { type: 'paragraph', text: b.text };
    if (b.type === 'heading-2') return { type: 'heading-2', text: b.text };
    if (b.type === 'heading-3') return { type: 'heading-3', text: b.text };
    return { type: 'paragraph', text: String(b) };
  });

  let document = blocksToDocument(blocks);
  const slug = uniqueSlugFromTitle(brief.title);

  console.log('[pipeline] Adding internal links in-memory before publishing...');
  try {
    document = await addInternalLinksToDocument(document, slug, 4);
  } catch (error) {
    console.error('[pipeline] Error during in-memory internal linking:', error);
  }

  console.log('[pipeline] Publishing to Contentful…');
  const { entryId } = await publishBlogPost({
    title: brief.title,
    slug,
    excerpt: body.excerpt,
    content: document,
    coverImageBuffer: imageBuffer,
    coverMimeType: mimeType,
    gistUrl,
  });

  console.log('[pipeline] Published entry:', entryId, 'slug:', slug);
}


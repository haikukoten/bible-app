const OPENAI_CHAT = 'https://api.openai.com/v1/chat/completions';
const OPENAI_IMAGES = 'https://api.openai.com/v1/images/generations';

const textModel = () => process.env.OPENAI_TEXT_MODEL ?? 'gpt-4o-mini';
const imageModel = () => process.env.OPENAI_IMAGE_MODEL ?? 'dall-e-3';

function apiKey(): string {
  const k = process.env.OPENAI_API_KEY;
  if (!k) throw new Error('OPENAI_API_KEY is required');
  return k;
}

async function chatJson(
  system: string,
  user: string,
  temperature: number,
  maxTokens: number
): Promise<string> {
  const res = await fetch(OPENAI_CHAT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: textModel(),
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      response_format: { type: 'json_object' },
      temperature,
      // Newer chat models reject `max_tokens`; use completion limit instead.
      max_completion_tokens: maxTokens,
    }),
  });

  const data = (await res.json()) as {
    error?: { message?: string };
    choices?: { message?: { content?: string } }[];
  };

  if (!res.ok) {
    throw new Error(
      `OpenAI chat ${res.status}: ${data.error?.message ?? JSON.stringify(data)}`
    );
  }

  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error('OpenAI returned empty content');
  return text;
}

export type TopicContext = {
  keyword: string;
  language: string;
};

export type ArticleBrief = {
  title: string;
  excerpt: string;
  gistBody: string;
};

export type ArticleBodyJson = {
  excerpt: string;
  blocks: Array<{
    type: 'paragraph' | 'heading-2' | 'heading-3';
    text: string;
  }>;
};

const JSON_SYSTEM =
  'You follow instructions and respond with a single valid JSON object only, no markdown fences.';

export async function generateArticleBrief(
  editorialConfig: string,
  topic?: TopicContext
): Promise<ArticleBrief> {
  const topicBlock = topic
    ? `
Scheduled topic for this post (required):
- Primary keyword / theme: ${topic.keyword}
- Article language: ${topic.language} — plan a post that centers on this keyword; titles, excerpt, and gist outline must be written in ${topic.language} (not English unless language is English).
`
    : '';

  const user = `You are an editorial planner for a faith / Bible-focused blog.

The site owner provided this editorial brief (topics, tone, audience, length, SEO notes, anything else):
---
${editorialConfig}
---
${topicBlock}
Return a single JSON object with keys:
- "title": string — compelling article title
- "excerpt": string — 2–3 sentences for the listing card (plain text). **Hard limit: 255 characters max** (CMS field). Rich mood/themes; stay under the cap.
- "gistBody": string — markdown for a GitHub Gist: title, the excerpt, a bullet outline, and 5–8 section headings you will expand in the full long-form article.

Keep the tone consistent with the brief. Avoid harmful or hateful content.`;

  const raw = await chatJson(JSON_SYSTEM, user, 0.85, 8192);
  const parsed = JSON.parse(raw) as ArticleBrief;
  if (!parsed.title || !parsed.excerpt || !parsed.gistBody) {
    throw new Error('Article brief JSON missing required fields');
  }
  return parsed;
}

export async function generateArticleBody(
  editorialConfig: string,
  brief: ArticleBrief,
  topic?: TopicContext
): Promise<ArticleBodyJson> {
  const langRule = topic
    ? `Write the entire article in ${topic.language}: title-aligned content, headings, and paragraphs. The primary theme must reflect: "${topic.keyword}".`
    : '';

  const user = `You are writing a blog article for a faith / Bible-focused site. Write like a thoughtful human editor: natural rhythm, varied sentence length, concrete detail where it helps, and a warm but not preachy voice. Avoid generic AI cadence—no stock openers ("In today's world…"), no filler transitions ("Furthermore," every paragraph), no cliché closers ("In conclusion…"). Do not label sections with meta phrases like "Introduction" or "Summary" unless the brief asks for it.

Editorial brief from the owner:
---
${editorialConfig}
---

Planned article:
Title: ${brief.title}
Excerpt (for card — stay aligned with this promise): ${brief.excerpt}
${langRule}

Length: the full body must be approximately **700–1200 words** in the article language (if the language uses different counting, match that length in a comparable way). Under-length is not acceptable—expand with real substance: examples, careful explanation, one or two vivid images or analogies, and honest reflection—not padding.

Write the full article. Return a single JSON object with:
- "excerpt": string — polished excerpt for the listing (can match or refine the planned excerpt). **Must be ≤ 255 characters** (including spaces).
- "blocks": array of blocks in reading order. Each block is either:
  - { "type": "heading-2", "text": "..." } for major sections
  - { "type": "heading-3", "text": "..." } for subsections when needed
  - { "type": "paragraph", "text": "..." } for body paragraphs

Rules:
- Use at least **8 paragraphs** and at least **4 heading-2** sections (add heading-3 where natural). Structure the piece so the word count is achievable without repetition.
- No HTML. Plain text inside each "text" field.
- Tone must match the editorial brief.
- Be substantive and respectful; cite general biblical themes without inventing verse text—if you quote Scripture, paraphrase unless the exact wording is widely known (e.g. short phrases), or speak in general terms.
- Do not include markdown symbols inside text fields except what belongs in prose.`;

  const raw = await chatJson(JSON_SYSTEM, user, 0.78, 16384);
  const parsed = JSON.parse(raw) as ArticleBodyJson;
  if (!parsed.excerpt || !Array.isArray(parsed.blocks)) {
    throw new Error('Article body JSON missing excerpt or blocks');
  }
  return parsed;
}

/**
 * Cover image via OpenAI Images API (default: dall-e-3).
 * Prompt is built from the article excerpt so the visual matches the card copy.
 */
export async function generateCoverImageBuffer(params: {
  excerpt: string;
  title?: string;
}): Promise<{ buffer: Buffer; mimeType: string }> {
  const excerpt = params.excerpt.trim();
  const titleHint = params.title?.trim()
    ? `Context (do not render as text in the image): ${params.title.trim()}\n\n`
    : '';
  const fullPrompt = `${titleHint}Blog cover illustration, editorial style, warm and respectful. Absolutely no text, letters, numbers, logos, or watermarks in the image.

Interpret the themes, mood, and atmosphere of this article excerpt as a single cohesive scene or symbolic composition (abstract or concrete—your choice), suitable for a faith-focused blog:

${excerpt}`;

  const allowedSizes = ['1024x1024', '1792x1024', '1024x1792'] as const;
  const envSize = process.env.OPENAI_IMAGE_SIZE;
  const size = allowedSizes.includes(envSize as (typeof allowedSizes)[number])
    ? (envSize as (typeof allowedSizes)[number])
    : '1024x1024';

  const res = await fetch(OPENAI_IMAGES, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: imageModel(),
      prompt: fullPrompt.slice(0, 4000),
      n: 1,
      size,
      response_format: 'b64_json',
    }),
  });

  const data = (await res.json()) as {
    error?: { message?: string };
    data?: Array<{ b64_json?: string }>;
  };

  if (!res.ok) {
    throw new Error(
      `OpenAI images ${res.status}: ${data.error?.message ?? JSON.stringify(data)}`
    );
  }

  const b64 = data.data?.[0]?.b64_json;
  if (!b64) {
    throw new Error('OpenAI images: no b64_json in response');
  }

  return {
    buffer: Buffer.from(b64, 'base64'),
    mimeType: 'image/png',
  };
}

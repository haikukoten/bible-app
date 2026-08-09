const MINIMAX_CHAT = 'https://api.minimax.io/v1/chat/completions';
const OPENAI_IMAGES = 'https://api.openai.com/v1/images/generations';

const textModel = () => process.env.MINIMAX_TEXT_MODEL ?? 'MiniMax-M3';
const imageModel = () => process.env.OPENAI_IMAGE_MODEL ?? 'dall-e-3';

function apiKey(): string {
  const k = process.env.MINIMAX_API_KEY;
  if (!k) throw new Error('MINIMAX_API_KEY is required');
  return k;
}

async function chatJson(
  system: string,
  user: string,
  temperature: number,
  maxTokens: number
): Promise<string> {
  const res = await fetch(MINIMAX_CHAT, {
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

  let text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error('OpenAI returned empty content');
  
  // MiniMax-M3 injects <think> tags; remove them to parse JSON cleanly
  text = text.replace(/<think>[\s\S]*?<\/think>\s*/i, '');
  
  // Extract JSON block in case there's any other text
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    text = jsonMatch[0];
  }

  return text;
}

export type TopicContext = {
  keyword: string;
  language: string;
};

export type ArticleBrief = {
  title: string;
  excerpt: string;
  image_prompt: string;
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
- "image_prompt": string — a purely physical, literal visual description of a scene representing the article (e.g., "A shepherd resting under a large oak tree in a sunlit valley"). DO NOT include any text, typography, symbols, or mention abstract concepts/scriptures.
- "gistBody": string — markdown for a GitHub Gist: title, the excerpt, a bullet outline, and 5–8 section headings you will expand in the full long-form article.

Keep the tone consistent with the brief. Avoid harmful or hateful content.`;

  const raw = await chatJson(JSON_SYSTEM, user, 0.85, 8192);
  const parsed = JSON.parse(raw) as ArticleBrief;
  if (!parsed.title || !parsed.excerpt || !parsed.gistBody || !parsed.image_prompt) {
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

Length: the full body must be approximately **700–1200 words** in the article language (for logographic languages like Chinese, Japanese, and Korean, this means **1500–2000 characters**). Under-length is not acceptable—expand with real substance: examples, careful explanation, one or two vivid images or analogies, and honest reflection—not padding.

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
 * Cover image via BFL FLUX API (default: flux-2-pro).
 * Prompt is built from the article excerpt so the visual matches the card copy.
 */
export async function generateCoverImageBuffer(params: {
  imagePrompt: string;
}): Promise<{ buffer: Buffer; mimeType: string }> {
  const bflKey = process.env.BFL_API_KEY;
  if (!bflKey) throw new Error('BFL_API_KEY is required for image generation');

  const cleanPrompt = params.imagePrompt.trim();
    
  const artStyles = [
    "Soft watercolor painting, natural textures, gentle brushstrokes, ethereal lighting",
    "Classic oil painting style, rich earth tones, chiaroscuro lighting, highly textured",
    "Cinematic nature photography, golden hour lighting, hyper-realistic, soft depth of field",
    "Vintage woodblock print illustration, intricate linework, muted organic colors",
    "Minimalist landscape illustration, clean vector art, warm pastel color palette, negative space",
    "Stained glass window style illustration, vibrant backlit colors, intricate geometric lead lines",
    "Textured charcoal sketch with soft pastel color accents, intimate and raw"
  ];
  const randomStyle = artStyles[Math.floor(Math.random() * artStyles.length)];

  const fullPrompt = `A highly detailed, purely visual and evocative scene: ${cleanPrompt}. Art Style: ${randomStyle}. Composition: Clean, warm, and respectful. Mood: Serene, inspiring, grounded.`;

  const envSize = process.env.OPENAI_IMAGE_SIZE || process.env.BFL_IMAGE_SIZE || '1024x1024';
  const [widthStr, heightStr] = envSize.split('x');
  const width = parseInt(widthStr, 10) || 1024;
  const height = parseInt(heightStr, 10) || 1024;

  const model = process.env.BFL_IMAGE_MODEL || 'flux-2-klein-9b';
  const BFL_URL = `https://api.bfl.ai/v1/${model}`;

  console.log(`[pipeline] Requesting image from BFL (${model})...`);

  const req = await fetch(BFL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-key': bflKey,
    },
    body: JSON.stringify({
      prompt: fullPrompt.slice(0, 4000),
      width,
      height,
    }),
  });

  const data = await req.json() as any;
  if (!req.ok) {
    throw new Error(`BFL image generation error ${req.status}: ${JSON.stringify(data)}`);
  }

  const taskId = data.id;
  const pollingUrl = data.polling_url || `https://api.bfl.ai/v1/get_result?id=${taskId}`;
  
  if (!taskId) {
    throw new Error('BFL API did not return a task ID');
  }

  // Poll for result
  let status = 'Pending';
  let sampleUrl = '';
  const maxAttempts = 120; // 2 minutes max
  let attempts = 0;

  while (attempts < maxAttempts) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    attempts++;

    const pollReq = await fetch(pollingUrl, {
      method: 'GET',
      headers: {
        'x-key': bflKey,
        'Accept': 'application/json'
      },
    });

    const pollData = await pollReq.json() as any;
    if (!pollReq.ok) {
      throw new Error(`BFL polling error ${pollReq.status}: ${JSON.stringify(pollData)}`);
    }

    status = pollData.status;
    
    if (status === 'Ready') {
      sampleUrl = pollData.result?.sample;
      break;
    } else if (status === 'Error' || status === 'Failed') {
      throw new Error(`BFL generation failed: ${JSON.stringify(pollData)}`);
    } else if (status === 'Request Moderated' || status === 'Content Moderated') {
      throw new Error(`BFL generation blocked by moderation: ${status}`);
    }
  }

  if (status !== 'Ready' || !sampleUrl) {
    throw new Error('BFL image generation timed out or failed to return a sample URL');
  }

  // Fetch the actual image buffer
  const imgRes = await fetch(sampleUrl);
  if (!imgRes.ok) {
    throw new Error(`Failed to download BFL image from ${sampleUrl}: ${imgRes.status}`);
  }

  const arrayBuffer = await imgRes.arrayBuffer();
  const mimeType = imgRes.headers.get('content-type') || 'image/jpeg';

  return {
    buffer: Buffer.from(arrayBuffer),
    mimeType,
  };
}

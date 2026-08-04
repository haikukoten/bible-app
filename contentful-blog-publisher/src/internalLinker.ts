import './loadEnv.js';
import { createRequire } from 'module';
import type { Document, Node, Text, Block, Inline, Paragraph } from '@contentful/rich-text-types';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { pipeline, env } from '@xenova/transformers';

// Use remote models (cached locally by default)
env.allowLocalModels = false;

const require = createRequire(import.meta.url);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { createClient } = require('contentful-management') as { createClient: (p: { accessToken: string }) => any };

const MINIMAX_CHAT = 'https://api.minimax.io/v1/chat/completions';
const textModel = () => process.env.MINIMAX_TEXT_MODEL ?? 'MiniMax-M3';
const locale = () => process.env.CONTENTFUL_LOCALE ?? 'en-US';

function apiKey(): string {
  const k = process.env.MINIMAX_API_KEY;
  if (!k) throw new Error('MINIMAX_API_KEY is required');
  return k;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EMBEDDINGS_FILE = path.join(__dirname, '../data/embeddings.json');

export type ArticleEmbedding = {
  slug: string;
  title: string;
  excerpt: string;
  embedding: number[];
};

export async function loadEmbeddings(): Promise<ArticleEmbedding[]> {
  try {
    const data = await fs.readFile(EMBEDDINGS_FILE, 'utf-8');
    return JSON.parse(data) as ArticleEmbedding[];
  } catch (err: any) {
    if (err.code === 'ENOENT') return [];
    console.error('[internalLinker] Error loading embeddings:', err);
    return [];
  }
}

export async function saveEmbeddings(data: ArticleEmbedding[]) {
  await fs.writeFile(EMBEDDINGS_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

let extractorInstance: any = null;
async function getExtractor() {
  if (!extractorInstance) {
    console.log('[internalLinker] Loading local AI embeddings model (Xenova/all-MiniLM-L6-v2)...');
    extractorInstance = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return extractorInstance;
}

async function getEmbedding(text: string): Promise<number[]> {
  const ex = await getExtractor();
  // Mean pooling and normalize for cosine similarity
  const output = await ex(text.substring(0, 4000), { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}

export async function addEmbeddingToStore(title: string, excerpt: string, slug: string) {
  const text = `${title}\n\n${excerpt}`;
  console.log(`[internalLinker] Generating local AI embedding for: ${slug}`);
  const embedding = await getEmbedding(text);
  
  const store = await loadEmbeddings();
  const filtered = store.filter(e => e.slug !== slug);
  filtered.push({ slug, title, excerpt, embedding });
  await saveEmbeddings(filtered);
  console.log(`[internalLinker] Saved embedding for ${slug}. Total index size: ${filtered.length}`);
}

function cosineSimilarity(vecA: number[], vecB: number[]): number {
  let dotProduct = 0, normA = 0, normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Extract pure text from Contentful Document
function extractTextFromDocument(doc: Document): string {
  let text = '';
  const traverse = (node: any) => {
    if (node.nodeType === 'text') {
      text += node.value;
    } else if (node.content) {
      for (const child of node.content) traverse(child);
      if (['paragraph', 'heading-1', 'heading-2', 'heading-3', 'heading-4', 'heading-5', 'heading-6'].includes(node.nodeType)) {
        text += '\n\n';
      }
    }
  };
  traverse(doc);
  return text.trim();
}

// Call MiniMax to get linking suggestions
async function getLinkingSuggestions(articleText: string, availableSlugs: string[], maxLinks = 4): Promise<Array<{ exact_text: string; slug: string }>> {
  if (!availableSlugs.length) return [];
  
  const systemPrompt = 'You follow instructions and respond with a single valid JSON object only, no markdown fences.';
  
  const userPrompt = `You are an SEO internal linking assistant. I have an article and a list of highly relevant available article slugs.
Your task is to identify up to ${maxLinks} exact phrases in the article text that conceptually relate to the available slugs, so they can be hyperlinked.

Available slugs:
${availableSlugs.join('\n')}

Article text:
---
${articleText.substring(0, 4000)}
---

Rules:
1. Return a JSON object with a single key "links" which is an array of objects: { "exact_text": "...", "slug": "..." }.
2. "exact_text" MUST be an exact, case-sensitive substring from the article text. Do not modify the words or punctuation. Keep it short (2-5 words).
3. "slug" MUST be exactly one of the slugs from the available list.
4. Provide a maximum of ${maxLinks} links. Return fewer if there are no good matches.
5. If no relevant links are found, return { "links": [] }.
6. Do not evaluate every slug in your thoughts. Just find a few good matches quickly and output the final JSON.
7. You follow instructions and respond with a single valid JSON object only, no markdown fences.`;

  console.log(`[internalLinker] Asking MiniMax for up to ${maxLinks} links...`);
  const res = await fetch(MINIMAX_CHAT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: textModel(),
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1, // Low temp for more accurate extraction
      max_completion_tokens: 8192,
    }),
  });

  const data = await res.json() as any;
  if (!res.ok) {
    console.error(`[internalLinker] MiniMax error: ${data.error?.message || JSON.stringify(data)}`);
    return [];
  }

  let rawText = data.choices?.[0]?.message?.content?.trim() || '';
  let text = rawText;
  
  // Remove think block
  text = text.replace(/<think>[\s\S]*?<\/think>\s*/i, '');
  
  // Also remove trailing thoughts if tag wasn't closed
  if (text.includes('<think>')) {
      const parts = text.split('</think>');
      if (parts.length > 1) {
          text = parts.slice(1).join('</think>').trim();
      } else {
          console.error('[internalLinker] MiniMax output seems to be just thoughts without </think>.');
          return [];
      }
  }

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) text = jsonMatch[0];

  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed.links) ? parsed.links : [];
  } catch (err) {
    console.error('[internalLinker] Failed to parse MiniMax JSON:', text);
    return [];
  }
}

// Inject links into Contentful Document
function injectLinksIntoDocument(doc: Document, suggestions: Array<{ exact_text: string; slug: string }>): Document {
  // Deep clone to avoid mutating original references incorrectly if they are shared
  const newDoc = JSON.parse(JSON.stringify(doc)) as Document;

  const replaceInTextNode = (textNode: any, suggestion: { exact_text: string; slug: string }) => {
    const idx = textNode.value.indexOf(suggestion.exact_text);
    if (idx === -1) return [textNode]; // Not found

    const beforeText = textNode.value.substring(0, idx);
    const afterText = textNode.value.substring(idx + suggestion.exact_text.length);

    const result = [];
    if (beforeText) result.push({ ...textNode, value: beforeText });
    
    result.push({
      nodeType: 'hyperlink',
      data: { uri: `/blog/${suggestion.slug}` },
      content: [{ ...textNode, value: suggestion.exact_text, marks: textNode.marks || [] }]
    });

    if (afterText) {
      result.push({ ...textNode, value: afterText });
    }

    return result;
  };

  const processContent = (contentList: any[]) => {
    const newContent = [];
    for (const node of contentList) {
      if (node.nodeType === 'text') {
        let currentNodes = [node];
        // Apply each suggestion one by one
        for (const sug of suggestions) {
          const processedNodes = [];
          for (const cn of currentNodes) {
            if (cn.nodeType === 'text') {
              processedNodes.push(...replaceInTextNode(cn, sug));
            } else {
              processedNodes.push(cn);
            }
          }
          currentNodes = processedNodes;
        }
        newContent.push(...currentNodes);
      } else if (node.nodeType === 'hyperlink' || node.nodeType.startsWith('entry-hyperlink') || node.nodeType.startsWith('asset-hyperlink')) {
        // Do not process content inside existing hyperlinks to prevent nesting
        newContent.push(node);
      } else if (node.content) {
        // Recursively process children
        node.content = processContent(node.content);
        newContent.push(node);
      } else {
        newContent.push(node);
      }
    }
    return newContent;
  };

  newDoc.content = processContent(newDoc.content);
  return newDoc;
}

export async function addInternalLinksToDocument(doc: Document, currentSlug: string, maxLinks = 4): Promise<Document> {
  console.log(`[internalLinker] Processing in-memory document for internal links via RAG...`);
  const articleText = extractTextFromDocument(doc);
  
  const embeddingsStore = await loadEmbeddings();
  const availableDocs = embeddingsStore.filter(s => s.slug !== currentSlug);

  if (availableDocs.length === 0) {
    console.log('[internalLinker] No available slugs in vector store.');
    return doc;
  }

  // Generate embedding for current text
  console.log('[internalLinker] Generating embedding for current article text...');
  const queryEmbedding = await getEmbedding(articleText);

  // Rank slugs
  const ranked = availableDocs.map(item => ({
    slug: item.slug,
    score: cosineSimilarity(queryEmbedding, item.embedding)
  })).sort((a, b) => b.score - a.score);

  // Take top 5
  const topMatches = ranked.slice(0, 5).map(r => r.slug);
  console.log(`[internalLinker] Top semantic matches: ${topMatches.join(', ')}`);

  const suggestions = await getLinkingSuggestions(articleText, topMatches, maxLinks);
  
  if (suggestions.length === 0) {
    console.log('[internalLinker] MiniMax returned no linking suggestions.');
    return doc;
  }

  console.log(`[internalLinker] Received ${suggestions.length} suggestions.`);
  
  return injectLinksIntoDocument(doc, suggestions);
}

export async function processArticleForInternalLinking(entryId: string, maxLinks = 4) {
  const token = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
  const spaceId = process.env.CONTENTFUL_SPACE_ID;
  const envId = process.env.CONTENTFUL_ENVIRONMENT_ID ?? 'master';
  
  if (!token) throw new Error('CONTENTFUL_MANAGEMENT_TOKEN is required');
  if (!spaceId) throw new Error('CONTENTFUL_SPACE_ID is required');

  const client = createClient({ accessToken: token });
  const space = await client.getSpace(spaceId);
  const environment = await space.getEnvironment(envId);
  
  console.log(`[internalLinker] Processing entry: ${entryId}`);
  const entry = await environment.getEntry(entryId);
  const loc = locale();

  if (!entry.fields.content || !entry.fields.content[loc]) {
    console.log(`[internalLinker] No content found for entry: ${entryId}`);
    return;
  }

  const doc = entry.fields.content[loc] as Document;
  
  const updatedDoc = await addInternalLinksToDocument(doc, (entry.fields.slug[loc] as string) || '', maxLinks);
  
  // Update entry
  entry.fields.content[loc] = updatedDoc;
  const updatedEntry = await entry.update();
  
  // Publish
  await updatedEntry.publish();
  console.log(`[internalLinker] Successfully updated and published entry: ${entryId} with internal links.`);
}

export async function processLatestArticlesForInternalLinking(limit = 3, maxLinks = 4) {
  const token = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
  const spaceId = process.env.CONTENTFUL_SPACE_ID;
  const envId = process.env.CONTENTFUL_ENVIRONMENT_ID ?? 'master';
  
  const client = createClient({ accessToken: token });
  const space = await client.getSpace(spaceId);
  const environment = await space.getEnvironment(envId);
  const contentTypeId = process.env.CONTENTFUL_BLOG_CONTENT_TYPE_ID ?? 'blog';

  console.log(`[internalLinker] Fetching latest ${limit} entries...`);
  const entries = await environment.getEntries({
    content_type: contentTypeId,
    limit,
    order: '-sys.createdAt'
  });

  for (const item of entries.items) {
    await processArticleForInternalLinking(item.sys.id, maxLinks);
  }
}

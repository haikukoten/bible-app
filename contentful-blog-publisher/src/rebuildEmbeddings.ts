import './loadEnv.js';
import { createRequire } from 'module';
import { addEmbeddingToStore } from './internalLinker.js';

const require = createRequire(import.meta.url);
const { createClient } = require('contentful-management');

async function run() {
  console.log('[rebuildEmbeddings] Initializing vector store for existing articles...');
  
  const token = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
  const spaceId = process.env.CONTENTFUL_SPACE_ID;
  const envId = process.env.CONTENTFUL_ENVIRONMENT_ID ?? 'master';
  
  if (!token || !spaceId) {
    throw new Error('CONTENTFUL_MANAGEMENT_TOKEN and CONTENTFUL_SPACE_ID are required.');
  }

  const client = createClient({ accessToken: token });
  const space = await client.getSpace(spaceId);
  const environment = await space.getEnvironment(envId);
  const contentTypeId = process.env.CONTENTFUL_BLOG_CONTENT_TYPE_ID ?? 'blog';

  const entries = await environment.getEntries({
    content_type: contentTypeId,
    limit: 1000,
  });

  console.log(`[rebuildEmbeddings] Found ${entries.items.length} articles to index.`);

  const locale = process.env.CONTENTFUL_LOCALE ?? 'en-US';

  for (let i = 0; i < entries.items.length; i++) {
    const item = entries.items[i];
    const fields = item.fields;
    
    if (!fields.title || !fields.excerpt || !fields.slug) {
      console.log(`[rebuildEmbeddings] Skipping entry ${item.sys.id} (missing required fields)`);
      continue;
    }

    const title = fields.title[locale];
    const excerpt = fields.excerpt[locale];
    const slug = fields.slug[locale];

    if (!title || !excerpt || !slug) continue;

    console.log(`[rebuildEmbeddings] (${i+1}/${entries.items.length}) Indexing: ${slug}`);
    try {
      await addEmbeddingToStore(title, excerpt, slug);
    } catch (e: any) {
      console.error(`[rebuildEmbeddings] Failed to embed ${slug}:`, e.message);
    }
  }

  console.log('[rebuildEmbeddings] Rebuild complete.');
}

run().catch(console.error);

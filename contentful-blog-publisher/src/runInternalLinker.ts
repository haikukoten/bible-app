import { processLatestArticlesForInternalLinking } from './internalLinker.js';

async function run() {
  const args = process.argv.slice(2);
  const limit = args.includes('--all') ? 100 : (parseInt(args[0]) || 3);
  const maxLinks = 4; // User requested 3-5

  console.log(`Starting internal linker for ${limit} articles, max ${maxLinks} links per article...`);
  await processLatestArticlesForInternalLinking(limit, maxLinks);
  console.log('Finished internal linking.');
}

run().catch(err => {
  console.error('Failed to run internal linker:', err);
  process.exit(1);
});

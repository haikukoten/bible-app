import './loadEnv.js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { createClient } = require('contentful-management') as {
  createClient: (p: { accessToken: string }) => {
    getSpace: (id: string) => Promise<{ name: string; getEnvironment: (id: string) => Promise<{ sys: { id: string } }> }>;
  };
};

async function main() {
  const token = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
  const spaceId = process.env.CONTENTFUL_SPACE_ID;
  const envId = process.env.CONTENTFUL_ENVIRONMENT_ID ?? 'master';

  if (!token) {
    console.error('CONTENTFUL_MANAGEMENT_TOKEN is missing.');
    process.exit(1);
  }
  if (!spaceId) {
    console.error('CONTENTFUL_SPACE_ID is missing.');
    process.exit(1);
  }

  const hint =
    token.startsWith('CFPAT-')
      ? ''
      : '\nNote: Management tokens usually start with CFPAT-. If yours does not, double-check you copied from Content management tokens, not Content delivery / Preview.';

  try {
    const client = createClient({ accessToken: token });
    const space = await client.getSpace(spaceId);
    const env = await space.getEnvironment(envId);
    console.log(`OK: space "${space.name}" (${spaceId}), environment "${env.sys.id}".`);
    process.exit(0);
  } catch (e: unknown) {
    const ne = e as { name?: string; status?: number; message?: string };
    const msg = e instanceof Error ? e.message : String(e);
    console.error('Contentful Management API failed:', ne.status ?? '', ne.name ?? '', msg);
    console.error(
      'Fix: Contentful → Settings → CMA tokens → create token with access to this space; set CONTENTFUL_MANAGEMENT_TOKEN. Do not use the Delivery API key.' + hint
    );
    process.exit(1);
  }
}

main();

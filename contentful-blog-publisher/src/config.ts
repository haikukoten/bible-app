import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function loadPublisherConfig(
  configPath?: string
): Promise<string> {
  const p =
    configPath ??
    path.join(process.cwd(), 'config.txt');
  try {
    const raw = await fs.readFile(p, 'utf-8');
    if (!raw.trim()) {
      throw new Error(`Config file is empty: ${p}`);
    }
    return raw.trim();
  } catch (e) {
    const err = e as NodeJS.ErrnoException;
    if (err.code === 'ENOENT') {
      throw new Error(
        `Missing config.txt. Copy config.example.txt to config.txt and fill in your editorial brief (topics, tone, audience, length). Path tried: ${p}`
      );
    }
    throw e;
  }
}

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export type BlogTopic = {
  /** Primary keyword / theme for this run */
  keyword: string;
  /** Human-readable language name for Gemini (e.g. Hungarian, English) */
  language: string;
};

/**
 * One topic per line: `keyword|language`
 * Lines starting with # and empty lines are ignored.
 * Example: `Malakiás próféta|Hungarian`
 */
export async function loadTopics(
  topicsPath?: string
): Promise<BlogTopic[]> {
  const p =
    topicsPath ??
    process.env.TOPICS_FILE ??
    path.join(process.cwd(), 'topics.txt');
  let raw: string;
  try {
    raw = await fs.readFile(p, 'utf-8');
  } catch (e) {
    const err = e as NodeJS.ErrnoException;
    if (err.code === 'ENOENT') {
      return [];
    }
    throw e;
  }

  const out: BlogTopic[] = [];
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const pipe = trimmed.indexOf('|');
    if (pipe === -1) {
      out.push({ keyword: trimmed, language: 'English' });
      continue;
    }
    const keyword = trimmed.slice(0, pipe).trim();
    const language = trimmed.slice(pipe + 1).trim();
    if (keyword && language) {
      out.push({ keyword, language });
    }
  }
  return out;
}

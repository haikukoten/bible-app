import fs from 'fs/promises';
import path from 'path';
import { ALLOWED_BIBLE_VERSION_ABBREVS } from '@/lib/bibleBooks';

export type BibleBookJson = { abbrev: string; chapters: string[][] };

const bibleCache = new Map<string, BibleBookJson[]>();

const BOOK_ABBREV_PATTERN = /^[a-z0-9]+$/i;

export function isAllowedVersion(version: string): boolean {
  return ALLOWED_BIBLE_VERSION_ABBREVS.has(version);
}

export function isValidBookAbbrev(book: string): boolean {
  return BOOK_ABBREV_PATTERN.test(book);
}

export async function loadVersion(version: string): Promise<BibleBookJson[]> {
  const cached = bibleCache.get(version);
  if (cached) return cached;

  const filePath = path.join(process.cwd(), 'public', 'json', `${version}.json`);
  const raw = await fs.readFile(filePath, 'utf-8');
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error('Invalid bible JSON: expected array of books');
  }
  bibleCache.set(version, parsed as BibleBookJson[]);
  return parsed as BibleBookJson[];
}

/**
 * Returns verse strings for a chapter, or null if version/book/chapter is invalid or missing.
 */
export async function getChapterVerses(
  version: string,
  bookAbbrev: string,
  chapterOneBased: number
): Promise<string[] | null> {
  if (!isAllowedVersion(version) || !isValidBookAbbrev(bookAbbrev)) {
    return null;
  }

  if (
    !Number.isInteger(chapterOneBased) ||
    chapterOneBased < 1 ||
    chapterOneBased > 200
  ) {
    return null;
  }

  const books = await loadVersion(version);
  const book = books.find(
    (b) => b.abbrev.toLowerCase() === bookAbbrev.toLowerCase()
  );
  if (!book || !Array.isArray(book.chapters)) {
    return null;
  }

  const idx = chapterOneBased - 1;
  const chapter = book.chapters[idx];
  if (!Array.isArray(chapter)) {
    return null;
  }

  return chapter;
}

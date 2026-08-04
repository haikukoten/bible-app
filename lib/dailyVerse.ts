import fs from 'fs/promises';
import path from 'path';
import { loadVersion } from '@/lib/bibleJson';
import { books } from '@/lib/bibleBooks';

export type DailyVersePayload = {
  verse: string;
  book: string;
  chapter: number;
  verse_number: number;
};

async function generateVerse(date: string): Promise<DailyVersePayload | null> {
  try {
    const versionData = await loadVersion('en_kjv');
    if (!versionData || versionData.length === 0) return null;

    // Pick a random book
    const randomBook = versionData[Math.floor(Math.random() * versionData.length)];
    const bookMeta = books.find(b => b.abbrev.toLowerCase() === randomBook.abbrev.toLowerCase());
    const bookName = bookMeta ? bookMeta.name : randomBook.abbrev;

    // Pick a random chapter
    const randomChapterIndex = Math.floor(Math.random() * randomBook.chapters.length);
    const chapterVerses = randomBook.chapters[randomChapterIndex];
    if (!chapterVerses || chapterVerses.length === 0) return null;

    // Pick a random verse
    const randomVerseIndex = Math.floor(Math.random() * chapterVerses.length);
    const verseText = chapterVerses[randomVerseIndex];

    return {
      verse: verseText,
      book: bookName,
      chapter: randomChapterIndex + 1,
      verse_number: randomVerseIndex + 1,
    };
  } catch (err) {
    console.error('Failed to generate local random verse:', err);
    return null;
  }
}

export async function getDailyVerse(): Promise<DailyVersePayload | null> {
  const filePath = path.join(process.cwd(), 'public', 'dailyVerse.json');
  let needsUpdate = false;
  let currentData: DailyVersePayload | null = null;
  const todayDate = new Date().toISOString().split('T')[0];

  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    currentData = JSON.parse(fileContent);
  } catch {
    // File doesn't exist or is invalid
  }

  try {
    const stats = await fs.stat(filePath);
    const fileDate = stats.mtime.toISOString().split('T')[0];
    
    if (fileDate !== todayDate) {
      needsUpdate = true;
    }
  } catch {
    needsUpdate = true;
  }

  if (!needsUpdate && currentData) {
    return currentData;
  }

  // Generate new verse if needed
  try {
    const verse = await generateVerse(todayDate);
    if (!verse) {
      return currentData;
    }

    await fs.writeFile(filePath, JSON.stringify(verse, null, 2), 'utf-8');
    return verse;
  } catch (error) {
    console.error('getDailyVerse:', error);
    return currentData;
  }
}

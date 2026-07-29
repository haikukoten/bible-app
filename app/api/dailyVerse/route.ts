import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { NextRequest } from 'next/server';
import { loadVersion } from '@/lib/bibleJson';
import { books } from '@/lib/bibleBooks';

export const dynamic = 'force-dynamic';

type DailyVersePayload = {
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

function authorize(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = request.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return false;
  const token = auth.slice(7);
  return token.length > 0 && token === secret;
}

export async function POST(request: NextRequest) {
  if (!authorize(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }


  const date = new Date().toISOString().split('T')[0];

  try {
    const verse = await generateVerse(date);
    if (!verse) {
      return NextResponse.json(
        { error: 'Could not generate daily verse.' },
        { status: 502 }
      );
    }

    const filePath = path.join(process.cwd(), 'public', 'dailyVerse.json');
    await fs.writeFile(filePath, JSON.stringify(verse, null, 2), 'utf-8');

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('dailyVerse POST:', error);
    return NextResponse.json(
      { error: 'Failed to write daily verse.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  const filePath = path.join(process.cwd(), 'public', 'dailyVerse.json');
  let needsUpdate = false;
  let currentData = null;
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
    return NextResponse.json(currentData, {
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  }

  // Generate new verse if needed

  try {
    const verse = await generateVerse(todayDate);
    if (!verse) {
      if (currentData) return NextResponse.json(currentData, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
      return NextResponse.json({ error: 'Could not generate daily verse.' }, { status: 502 });
    }

    await fs.writeFile(filePath, JSON.stringify(verse, null, 2), 'utf-8');
    return NextResponse.json(verse, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
  } catch (error) {
    console.error('dailyVerse GET:', error);
    if (currentData) return NextResponse.json(currentData, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
    return NextResponse.json({ error: 'Failed to write daily verse.' }, { status: 500 });
  }
}

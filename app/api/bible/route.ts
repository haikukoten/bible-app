import { NextResponse } from 'next/server';
import {
  getChapterVerses,
  isAllowedVersion,
  isValidBookAbbrev,
} from '@/lib/bibleJson';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const version = searchParams.get('version');
  const book = searchParams.get('book');
  const chapterParam = searchParams.get('chapter');

  if (!version || !book || !chapterParam) {
    return NextResponse.json(
      { error: 'Missing version, book, or chapter' },
      { status: 400 }
    );
  }

  if (!isAllowedVersion(version)) {
    return NextResponse.json({ error: 'Unknown Bible version' }, { status: 400 });
  }

  if (!isValidBookAbbrev(book)) {
    return NextResponse.json({ error: 'Invalid book parameter' }, { status: 400 });
  }

  const chapterNum = parseInt(chapterParam, 10);
  if (Number.isNaN(chapterNum)) {
    return NextResponse.json({ error: 'Invalid chapter' }, { status: 400 });
  }

  try {
    const verses = await getChapterVerses(version, book, chapterNum);
    if (!verses) {
      return NextResponse.json(
        { error: 'Chapter not found for this version and book.' },
        { status: 404 }
      );
    }

    return NextResponse.json(verses, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
      },
    });
  } catch (error) {
    console.error('Error loading Bible chapter:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

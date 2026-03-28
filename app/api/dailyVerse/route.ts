import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { NextRequest } from 'next/server';

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

type DailyVersePayload = {
  verse: string;
  book: string;
  chapter: number;
  verse_number: number;
};

function parseDailyVerse(raw: unknown): DailyVersePayload | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.verse !== 'string' || typeof o.book !== 'string') return null;
  const chapter = Number(o.chapter);
  const verse_number = Number(o.verse_number);
  if (!Number.isFinite(chapter) || !Number.isFinite(verse_number)) return null;
  return { verse: o.verse, book: o.book, chapter, verse_number };
}

async function generateVerse(date: string): Promise<DailyVersePayload | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;

  const res = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `You output only valid JSON (no markdown). Current date: ${date}. Suggest one short inspirational Bible verse: include exact verse text, book name, chapter and verse numbers as integers. Base the choice loosely on the calendar date; do not mention any historical event in the output.`,
        },
        {
          role: 'user',
          content: `Return a JSON object with keys: verse (string), book (string), chapter (number), verse_number (number).`,
        },
      ],
      max_tokens: 400,
      temperature: 0.6,
    }),
  });

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };

  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return null;
  }

  return parseDailyVerse(parsed);
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

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: 'OpenAI is not configured.' },
      { status: 503 }
    );
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
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}

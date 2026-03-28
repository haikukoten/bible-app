import { NextResponse } from 'next/server';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const MAX_MESSAGES = 40;
const MAX_MESSAGE_CHARS = 4000;
const MAX_TOTAL_CHARS = 32000;
const RATE_WINDOW_MS = 15 * 60 * 1000;
const RATE_MAX = 30;

type ChatRole = 'user' | 'assistant' | 'system';

type ChatMessage = { role: ChatRole; content: string };

const rateBuckets = new Map<string, { count: number; windowStart: number }>();

function getClientId(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') ?? 'unknown';
}

function allowRate(clientId: string): boolean {
  const now = Date.now();
  let b = rateBuckets.get(clientId);
  if (!b || now - b.windowStart > RATE_WINDOW_MS) {
    b = { count: 0, windowStart: now };
    rateBuckets.set(clientId, b);
  }
  if (b.count >= RATE_MAX) return false;
  b.count += 1;
  if (rateBuckets.size > 50_000) {
    rateBuckets.clear();
  }
  return true;
}

function validateMessages(raw: unknown): ChatMessage[] | null {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > MAX_MESSAGES) {
    return null;
  }
  let total = 0;
  const out: ChatMessage[] = [];
  for (const m of raw) {
    if (!m || typeof m !== 'object') return null;
    const role = (m as { role?: unknown }).role;
    const content = (m as { content?: unknown }).content;
    if (role !== 'user' && role !== 'assistant' && role !== 'system') {
      return null;
    }
    if (typeof content !== 'string') return null;
    if (content.length > MAX_MESSAGE_CHARS) return null;
    total += content.length;
    if (total > MAX_TOTAL_CHARS) return null;
    out.push({ role, content });
  }
  return out;
}

export async function POST(req: Request) {
  if (!OPENAI_API_KEY) {
    return NextResponse.json(
      { error: 'Chat is not configured.' },
      { status: 503 }
    );
  }

  if (!allowRate(getClientId(req))) {
    return NextResponse.json(
      { error: 'Too many requests. Try again later.' },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const messages = validateMessages(
    (body as { messages?: unknown })?.messages
  );
  if (!messages) {
    return NextResponse.json({ error: 'Invalid messages' }, { status: 400 });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
      error?: { message?: string };
    };

    if (response.ok && data.choices?.[0]?.message?.content != null) {
      return NextResponse.json(
        { message: data.choices[0].message.content },
        { status: 200 }
      );
    }

    console.error('OpenAI error:', response.status, data.error?.message);
    return NextResponse.json(
      { error: 'Assistant is temporarily unavailable.' },
      { status: 502 }
    );
  } catch (error) {
    console.error('Chat proxy error:', error);
    return NextResponse.json(
      { error: 'Assistant is temporarily unavailable.' },
      { status: 502 }
    );
  }
}

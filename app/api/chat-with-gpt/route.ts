import { NextResponse } from 'next/server';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(req: Request) {
  const { messages } = await req.json();

  if (!OPENAI_API_KEY) {
    return NextResponse.json({ error: 'Missing OpenAI API key' }, { status: 500 });
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

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json({ message: data.choices[0].message.content }, { status: 200 });
    } else {
      return NextResponse.json({ error: data }, { status: response.status });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching from OpenAI API' }, { status: 500 });
  }
}

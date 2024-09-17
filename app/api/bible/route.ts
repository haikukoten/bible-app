// app/api/bible/route.ts
import { NextResponse } from 'next/server';
import Redis from 'ioredis';

// Initialize Redis connection
const redis = new Redis();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const version = searchParams.get('version');
  const book = searchParams.get('book');
  const chapter = searchParams.get('chapter');

  // Validate query parameters
  if (!version || !book || !chapter) {
    return NextResponse.json(
      { error: 'Missing version, book, or chapter' },
      { status: 400 }
    );
  }

  try {
    // Construct the Redis key
    const redisKey = `bible:${version}:${book}:${chapter}`;

    // Fetch the data from Redis
    const chapterData = await redis.get(redisKey);

    if (!chapterData) {
      return NextResponse.json(
        { error: 'Bible data not found for the requested version, book, and chapter.' },
        { status: 404 }
      );
    }

    // Return the chapter data as JSON
    return NextResponse.json(JSON.parse(chapterData));
  } catch (error) {
    console.error('Error fetching Bible data from Redis:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

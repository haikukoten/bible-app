import { books } from '@/lib/bibleBooks';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import Image from "next/image";  // Import the Image component
import { getAllArticles } from "@/lib/contentful";
import Redis from 'ioredis';

// Initialize Redis client
const redis = new Redis(6379, 'localhost'); // Connect to Redis running on localhost:6379

// Cache key for storing the daily verse
const DAILY_VERSE_KEY = 'dailyVerse';
const CACHE_DURATION = 24 * 60 * 60; // 24 hours in seconds

// Get a random verse from Redis
async function getDailyVerse(): Promise<{ book: string; chapter: number; verse: number; text: string } | null> {
  try {
    // Check if a daily verse is already cached in Redis
    const cachedVerse = await redis.get(DAILY_VERSE_KEY);
    if (cachedVerse) {
      return JSON.parse(cachedVerse); // Return cached daily verse if it exists
    }

    // Function to fetch and cache a new random verse
    const fetchAndCacheVerse = async (): Promise<{ book: string; chapter: number; verse: number; text: string } | null> => {
      const allBookAbbrevs = books.map((book) => book.abbrev);
      const randomBookAbbrev = allBookAbbrevs[Math.floor(Math.random() * allBookAbbrevs.length)];
      const selectedBook = books.find((book) => book.abbrev === randomBookAbbrev);
      if (!selectedBook) return null;

      const randomChapter = Math.floor(Math.random() * selectedBook.chapters) + 1;
      const redisKey = `bible:en_kjv:${randomBookAbbrev}:${randomChapter}`;
      const chapterData = await redis.get(redisKey);

      if (chapterData) {
        const verses = JSON.parse(chapterData);
        const randomVerseIndex = Math.floor(Math.random() * verses.length);
        const verseText = verses[randomVerseIndex];

        const dailyVerse = {
          book: selectedBook.name,
          chapter: randomChapter,
          verse: randomVerseIndex + 1,
          text: verseText,
        };

        // Cache the daily verse in Redis for 24 hours
        await redis.set(DAILY_VERSE_KEY, JSON.stringify(dailyVerse), 'EX', CACHE_DURATION);

        return dailyVerse;
      }

      return null;
    };

    // Fetch and cache a new verse if not cached
    return await fetchAndCacheVerse();
  } catch (error) {
    console.error("Error fetching daily verse:", error);
    return null;
  }
}

export default async function Home() {
  // Fetch latest posts from Contentful
  const allPostsData = await getAllArticles(4, 0, false); // Fetch 4 latest posts

  // Fetch the daily verse (cached in Redis)
  const dailyVerse = await getDailyVerse();

  return (
    <>
      {/* Page Content */}
      <section className="w-full py-8 md:py-16 lg:py-20 xl:py-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Welcome to asBible
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                Explore the scriptures, read our blog, and find daily inspiration.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Verse of the Day */}
      <section className="w-full py-8 md:py-16 lg:py-20 bg-gray-100 dark:bg-gray-800">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Verse of the Day</h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Find daily inspiration in God&apos;s word.
              </p>
            </div>
            <Card className="w-full max-w-3xl">
              <CardHeader>
                <CardTitle>Today&apos;s Verse</CardTitle>
              </CardHeader>
              <CardContent>
                {dailyVerse ? (
                  <>
                    <p className="text-2xl font-serif italic">&quot;{dailyVerse.text}&quot;</p>
                    <p className="text-right font-semibold">
                      - {dailyVerse.book} {dailyVerse.chapter}:{dailyVerse.verse}
                    </p>
                  </>
                ) : (
                  <p className="text-2xl font-serif italic">Unable to load today&apos;s verse.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Latest Blog Posts */}
      <section className="w-full py-6 md:py-12 lg:py-16 bg-white dark:bg-gray-900">
        <div className="container px-4 md:px-6 max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tighter text-center sm:text-4xl md:text-5xl lg:text-6xl mb-8">
            Latest Blog Posts
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {allPostsData.map((post) => (
              <Card key={post.sys.id} className="flex flex-col justify-between h-full">
                <div>
                  <CardHeader>
                    <CardTitle>{post.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Check if cover image exists and render it */}
                    {post.coverImage?.url && (
                      <Image
                        src={post.coverImage.url}
                        alt={post.title}
                        width={350}
                        height={200}
                        className="rounded-lg object-cover w-full"
                      />
                    )}
                    <p className="text-gray-500 dark:text-gray-400 mt-4">{post.excerpt}</p>
                  </CardContent>
                </div>
                <CardFooter className="flex justify-between mt-auto">
                  <Link href={`/blog/${post.slug}`} passHref>
                    <Button variant="outline">Read More</Button>
                  </Link>
                  {post.publishedDate && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(post.publishedDate).toLocaleDateString()}
                    </p>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

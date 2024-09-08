import { books } from '@/lib/bibleBooks';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import Image from "next/image";  // Import the Image component
import { getAllArticles } from "@/lib/contentful";

// Get the daily verse based on current date
function getDailyVerse() {
  try {
    const bibleData = require('../public/json/en_kjv.json'); // Load the JSON file

    const currentDate = new Date();
    const dayOfYear = Math.floor(
      (currentDate.getTime() - new Date(currentDate.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24
    );

    const totalVerses = bibleData.reduce((total: number, book: any) => {
      return total + book.chapters.reduce((chapterSum: number, chapter: string[]) => chapterSum + chapter.length, 0);
    }, 0);

    let verseIndex = dayOfYear % totalVerses;
    let verseCount = 0;

    for (const book of bibleData) {
      for (let chapterIndex = 0; chapterIndex < book.chapters.length; chapterIndex++) {
        const chapter = book.chapters[chapterIndex];
        for (let verseIndexInChapter = 0; verseIndexInChapter < chapter.length; verseIndexInChapter++) {
          if (verseCount === verseIndex) {
            const foundBook = books.find((b) => b.abbrev === book.abbrev);
            const bookName = foundBook ? foundBook.name : "Unknown Book";

            return {
              book: bookName,
              chapter: chapterIndex + 1,
              verse: verseIndexInChapter + 1,
              text: chapter[verseIndexInChapter],
            };
          }
          verseCount++;
        }
      }
    }

    return null;
  } catch (error) {
    console.error("Error reading Bible data:", error);
    return null;
  }
}

export default async function Home() {
  // Fetch latest posts from Contentful
  const allPostsData = await getAllArticles(4, false); // Fetch 4 latest posts
  const dailyVerse = getDailyVerse(); // Get the daily verse

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
                Find daily inspiration in God's word.
              </p>
            </div>
            <Card className="w-full max-w-3xl">
              <CardHeader>
                <CardTitle>Today's Verse</CardTitle>
              </CardHeader>
              <CardContent>
                {dailyVerse ? (
                  <>
                    <p className="text-2xl font-serif italic">"{dailyVerse.text}"</p>
                    <p className="text-right font-semibold">
                      - {dailyVerse.book} {dailyVerse.chapter}:{dailyVerse.verse}
                    </p>
                  </>
                ) : (
                  <p className="text-2xl font-serif italic">Unable to load today's verse.</p>
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
              <Card key={post.sys.id}>
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
                <CardFooter className="flex justify-between">
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

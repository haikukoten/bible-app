import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import Image from "next/image";
import { getAllArticles } from "@/lib/contentful";
import { blogPostHref } from "@/lib/blogPath";
import dynamic from 'next/dynamic';

// Import DailyVerse dynamically to disable SSR (as it uses client-side hooks)
const DailyVerse = dynamic(() => import('@/components/DailyVerse'), { ssr: false });

export const revalidate = 60;

export default async function Home() {
  // Fetch latest posts from Contentful
  const allPostsData = await getAllArticles(4, 0, false); // Fetch 4 latest posts

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
            <DailyVerse /> {/* Use DailyVerse component here */}
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
                  <Link href={blogPostHref(post.slug)} passHref>
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

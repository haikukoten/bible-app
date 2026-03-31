"use client";

import { getAllArticles, Article } from "@/lib/contentful"; // Article is now exported
import { blogPostHref } from "@/lib/blogPath";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export default function BlogPage() {
  // State to store blog posts
  const [allPostsData, setAllPostsData] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        let allPosts: Article[] = [];
        let limit = 10;
        let morePostsAvailable = true;
        let skip = 0;

        while (morePostsAvailable) {
          const postsBatch = await getAllArticles(limit, skip, false);
          if (postsBatch.length > 0) {
            allPosts = [...allPosts, ...postsBatch];
            skip += postsBatch.length;
          }

          morePostsAvailable = postsBatch.length === limit;
        }

        setAllPostsData(allPosts);
      } catch (err) {
        console.error("Error fetching articles:", err);
        setError("Failed to fetch articles.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, []);

  if (isLoading) {
    return <div>Loading articles...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-6 md:p-24 bg-white">
      <section className="w-full pt-12">
        <div className="mx-auto container space-y-6 md:space-y-12 px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Welcome to the Blog
              </h1>
              <p className="max-w-[900px] text-zinc-500 text-sm md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-zinc-400">
                Explore thought-provoking articles on faith, spirituality, and more.
              </p>
            </div>
          </div>
          <div className="space-y-6 md:space-y-12">
            {allPostsData.length > 0 ? (
              <div className="grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3">
                {allPostsData.map((post) => (
                  <article key={post.sys.id} className="h-full flex flex-col rounded-lg shadow-lg overflow-hidden">
                    {post.coverImage?.url && (
                      <Image
                        alt={post.title}
                        className="object-cover w-full aspect-[4/3]"
                        height="263"
                        src={post.coverImage.url}
                        width="350"
                      />
                    )}
                    <div className="flex-1 p-4 md:p-6">
                      <Link href={blogPostHref(post.slug)}>
                        <h3 className="text-xl md:text-2xl font-bold leading-tight text-zinc-900 dark:text-zinc-50 py-2 md:py-4">
                          {post.title}
                        </h3>
                      </Link>
                      <p className="text-sm md:text-base text-zinc-500 mt-2 md:mt-4 mb-1 md:mb-2 dark:text-zinc-400">
                        {post.excerpt}
                      </p>
                      {post.publishedDate && (
                        <p className="text-xs md:text-sm text-zinc-600 mt-1 md:mt-2 mb-1 md:mb-2 font-bold dark:text-zinc-400">
                          Published on: {new Date(post.publishedDate).toLocaleDateString()}
                        </p>
                      )}
                      <div className="flex justify-end">
                        <Link href={blogPostHref(post.slug)}>
                          <Button variant="outline" className="text-xs md:text-sm">Read More →</Button>
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p>No articles found.</p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

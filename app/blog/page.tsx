"use client";

import { getAllArticles } from "@/lib/contentful";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export default function BlogPage() {
  // State to store blog posts
  const [allPostsData, setAllPostsData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        // Fetch blog posts from Contentful
        const posts = await getAllArticles(3, false); // Fetch only published articles
        console.log("Fetched articles:", posts); // Debug log to ensure articles are fetched
        setAllPostsData(posts);
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
    <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-white">
      <section className="w-full pt-12">
        <div className="mx-auto container space-y-12 px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                Welcome to the Blog
              </h1>
              <p className="max-w-[900px] text-zinc-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-zinc-400">
                Explore thought-provoking articles on faith, spirituality, and more.
              </p>
            </div>
          </div>
          <div className="space-y-12">
            {allPostsData.length > 0 ? (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {allPostsData.map((post) => (
                  <article key={post.sys.id} className="h-full flex flex-col rounded-lg shadow-lg overflow-hidden">
                    {/* Render the cover image if it exists */}
                    {post.coverImage?.url && (
                      <Image
                        alt={post.title}
                        className="aspect-[4/3] object-cover w-full"
                        height="263"
                        src={post.coverImage.url}
                        width="350"
                      />
                    )}
                    <div className="flex-1 p-6">
                      {/* Post title with link */}
                      <Link href={`/blog/${post.slug}`}>
                        <h3 className="text-2xl font-bold leading-tight text-zinc-900 dark:text-zinc-50 py-4">
                          {post.title}
                        </h3>
                      </Link>
                      {/* Excerpt from the article */}
                      <p className="max-w-none text-zinc-500 mt-4 mb-2 text-sm dark:text-zinc-400">
                        {post.excerpt}
                      </p>
                      {/* Published date */}
                      {post.publishedDate && (
                        <p className="max-w-none text-zinc-600 mt-2 mb-2 text-sm font-bold dark:text-zinc-400">
                          Published on: {new Date(post.publishedDate).toLocaleDateString()}
                        </p>
                      )}
                      {/* Read more link */}
                      <div className="flex justify-end">
                        <Link href={`/blog/${post.slug}`}>
                          <Button variant="outline">Read More →</Button>
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

import { getAllArticles } from "@/lib/contentful";
import { blogPostHref } from "@/lib/blogPath";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | asBible",
  description: "Explore thought-provoking articles on faith, spirituality, and more.",
};

export const revalidate = 60; // Revalidate every 60 seconds if new posts are added

export default async function BlogPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page, 10) : 1;
  const currentPage = isNaN(page) || page < 1 ? 1 : page;
  const limit = 12;
  const skip = (currentPage - 1) * limit;

  // Fetch limit + 1 to quickly determine if there is a next page
  const postsBatch = await getAllArticles(limit + 1, skip, false);
  
  const hasNextPage = postsBatch.length > limit;
  const allPostsData = postsBatch.slice(0, limit);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-6 md:p-24">
      <section className="w-full pt-12">
        <div className="mx-auto container space-y-6 md:space-y-12 px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Welcome to the Blog
              </h1>
              <p className="max-w-[900px] text-sm md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
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
                    <div className="flex-1 p-4 md:p-6 flex flex-col">
                      <Link href={blogPostHref(post.slug)}>
                        <h3 className="text-xl md:text-2xl font-bold leading-tight text-zinc-900 dark:text-zinc-50 py-2 md:py-4">
                          {post.title}
                        </h3>
                      </Link>
                      <p className="text-sm md:text-base mt-2 md:mt-4 mb-1 md:mb-2 border-b pb-2 flex-grow">
                        {post.excerpt}
                      </p>
                      {post.publishedDate && (
                        <p className="text-xs md:text-sm mt-1 md:mt-2 mb-1 md:mb-2 font-bold">
                          Published on: {new Date(post.publishedDate).toLocaleDateString()}
                        </p>
                      )}
                      <div className="flex justify-end mt-4">
                        <Link href={blogPostHref(post.slug)}>
                          <Button variant="outline" className="text-xs md:text-sm">Read More →</Button>
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="text-center py-10">No articles found.</p>
            )}

            {/* Pagination Controls */}
            <div className="flex justify-center items-center gap-4 mt-12">
              <Link
                href={currentPage > 1 ? `/blog?page=${currentPage - 1}` : "#"}
                aria-disabled={currentPage <= 1}
                className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
              >
                <Button variant="outline" disabled={currentPage <= 1}>
                  ← Previous
                </Button>
              </Link>
              
              <span className="text-sm font-medium">Page {currentPage}</span>
              
              <Link
                href={hasNextPage ? `/blog?page=${currentPage + 1}` : "#"}
                aria-disabled={!hasNextPage}
                className={!hasNextPage ? "pointer-events-none opacity-50" : ""}
              >
                <Button variant="outline" disabled={!hasNextPage}>
                  Next →
                </Button>
              </Link>
            </div>
            
          </div>
        </div>
      </section>
    </main>
  );
}

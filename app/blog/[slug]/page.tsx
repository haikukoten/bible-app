import React, { ReactNode } from "react";
import { Metadata, ResolvingMetadata } from "next";
import { getArticle, getAllArticles } from "@/lib/contentful";
import { blogPostHref } from "@/lib/blogPath";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";
import { BLOCKS, MARKS, Document } from "@contentful/rich-text-types";
import CapiViewTracker from "@/components/CapiViewTracker";
import SubscribeForm from "@/components/SubscribeForm";
import ShareButtons from "@/components/ShareButtons";

// Custom rendering options for Contentful rich text
const options = {
  renderMark: {
    [MARKS.BOLD]: (text: ReactNode) => <strong className="font-bold">{text}</strong>,
    [MARKS.ITALIC]: (text: ReactNode) => <em className="italic">{text}</em>,
    [MARKS.UNDERLINE]: (text: ReactNode) => <u>{text}</u>,
    [MARKS.CODE]: (text: ReactNode) => (
      <code className="font-mono p-1">{text}</code>
    ),
  },
  renderNode: {
    [BLOCKS.PARAGRAPH]: (node: any, children: ReactNode | ReactNode[]) => {
      const paragraphText = Array.isArray(children)
        ? children.map((child: ReactNode, index: number) => {
            if (typeof child === "string") {
              return child.split("\n").map((part, partIndex) => (
                <React.Fragment key={partIndex}>
                  {part}
                  {partIndex < child.split("\n").length - 1 && <br />}
                </React.Fragment>
              ));
            }
            return child;
          })
        : children;

      return <p className="mb-6 text-xl leading-relaxed">{paragraphText}</p>;
    },
    [BLOCKS.HEADING_1]: (node: any, children: ReactNode) => (
      <h1 className="text-3xl md:text-4xl font-bold mb-4">{children}</h1>
    ),
    [BLOCKS.HEADING_2]: (node: any, children: ReactNode) => (
      <h2 className="text-2xl md:text-3xl font-bold mb-3">{children}</h2>
    ),
    [BLOCKS.HEADING_3]: (node: any, children: ReactNode) => (
      <h3 className="text-xl md:text-2xl font-bold mb-2">{children}</h3>
    ),
    [BLOCKS.HEADING_4]: (node: any, children: ReactNode) => (
      <h4 className="text-lg md:text-xl font-bold mb-1">{children}</h4>
    ),
    [BLOCKS.UL_LIST]: (node: any, children: ReactNode) => (
      <ul className="list-disc pl-5 mb-6 text-xl leading-relaxed">{children}</ul>
    ),
    [BLOCKS.OL_LIST]: (node: any, children: ReactNode) => (
      <ol className="list-decimal pl-5 mb-6 text-xl leading-relaxed">{children}</ol>
    ),
    [BLOCKS.LIST_ITEM]: (node: any, children: ReactNode) => <li>{children}</li>,
    [BLOCKS.QUOTE]: (node: any, children: ReactNode) => (
      <blockquote className="border-l-4 pl-4 italic my-4">{children}</blockquote>
    ),
    [BLOCKS.EMBEDDED_ASSET]: (node: any) => {
      const { url, description } = node.data.target.fields;
      return (
        <Image
          src={getAbsoluteUrl(url)}
          alt={description || "Embedded asset"}
          width={500}
          height={300}
          className="w-full rounded-lg my-4"
        />
      );
    },
  },
};

// Function to handle image URLs that are relative
function getAbsoluteUrl(url: string) {
  if (url.startsWith("//")) {
    return `https:${url}`;
  } else if (url.startsWith("/")) {
    return `https://images.ctfassets.net${url}`;
  } else if (!url.startsWith("http")) {
    return `https://${url}`;
  }
  return url;
}

// Static params generation
export async function generateStaticParams() {
  const allArticles = await getAllArticles();
  return allArticles.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata(
  { params }: { params: { slug: string } },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const slugParam = decodeURIComponent(params.slug).normalize("NFC");
  const article = await getArticle(slugParam);

  if (!article) {
    return {
      title: "Article Not Found",
    };
  }

  const title = article.title || "asBible | Read Bible Blog";
  const description = article.excerpt || "Read insightful Bible blogs on asBible.";
  const url = `https://asbible.com/blog/${slugParam}`;
  const coverImageUrl = article.coverImage?.url ? getAbsoluteUrl(article.coverImage.url) : null;
  const images = coverImageUrl ? [coverImageUrl] : [];

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: "article",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images,
    },
  };
}

// BlogPostPage component to render individual article
export default async function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const slugParam = decodeURIComponent(params.slug).normalize("NFC");

  // Fetch article based on slug
  const article = await getArticle(slugParam);

  if (!article) {
    notFound();
  }

  // Get all articles to determine prev/next article
  const allArticles = await getAllArticles();

  // Find the current article index (Unicode-safe compare)
  const currentIndex = allArticles.findIndex(
    (a) => a.slug.normalize("NFC") === slugParam
  );

  // Previous and Next articles
  const prevArticle = currentIndex > 0 ? allArticles[currentIndex - 1] : null;
  const nextArticle =
    currentIndex < allArticles.length - 1 ? allArticles[currentIndex + 1] : null;

  // Safely access coverImage URL from article object
  const coverImageUrl = article?.coverImage?.url;

  // Use article.content directly instead of json
  const content = article?.content as unknown as Document;

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-6 md:p-24">
      <section className="w-full max-w-3xl">
        <div className="space-y-12">
          {/* Go Back Button */}
          <div className="mt-8">
            <Link href="/blog">
              <Button variant="outline">← Go Back to Blog</Button>
            </Link>
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tighter sm:text-5xl">
              {article?.title}
            </h1>
            <p className="text-lg md:text-xl/relaxed xl:text-2xl/relaxed text-muted-foreground">
              {article?.excerpt}
            </p>
          </div>

          <div className="space-y-8 lg:space-y-10">
            {/* Conditional rendering of cover image */}
            {coverImageUrl ? (
              <div>
                <Image
                  src={coverImageUrl}
                  alt={article.title || "Article Image"}
                  width={1200}
                  height={630}
                  className="rounded-xl w-full"
                  priority
                />
              </div>
            ) : (
              <p>No cover image available.</p>
            )}

            <div className="flex justify-center">
              <SubscribeForm />
            </div>

            {/* Article content with Floating Share Buttons */}
            <div className="flex flex-col md:flex-row gap-6 relative mt-8">
              {/* Floating Share Buttons - Desktop */}
              <div className="hidden md:block w-12 flex-shrink-0">
                <div className="sticky top-24 pt-2">
                  <ShareButtons title={article?.title || "Article"} />
                </div>
              </div>



              <div className="flex-1 min-w-0">
                <div className="prose max-w-none space-y-4 md:space-y-6">
                  {/* Check if content exists */}
                  {content ? (
                    documentToReactComponents(content, options)
                  ) : (
                    <p>No content available.</p>
                  )}
                </div>
              </div>

              {/* Share Buttons - Mobile (Sticky Bottom Bar) */}
              <div className="md:hidden sticky bottom-6 z-50 flex justify-center w-full pointer-events-none">
                <div className="pointer-events-auto">
                  <ShareButtons title={article?.title || "Article"} horizontal />
                </div>
              </div>
            </div>

            <div className="flex justify-center border-t pt-8 mt-8">
              <SubscribeForm />
            </div>

            {/* Previous and Next buttons */}
            <div className="mt-8 flex justify-between">
              <Link href={prevArticle ? blogPostHref(prevArticle.slug) : "#"}>
                <Button
                  variant="outline"
                  disabled={!prevArticle}
                  className="mr-2"
                >
                  ← Previous
                </Button>
              </Link>

              <Link href={nextArticle ? blogPostHref(nextArticle.slug) : "#"}>
                <Button variant="outline" disabled={!nextArticle}>
                  Next →
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      <CapiViewTracker />
    </main>
  );
}

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft } from 'lucide-react';
import { getPostData, getPostSlugs } from '@/lib/posts';
import { Metadata } from 'next';

// Define types for the slug parameter
interface Params {
  params: {
    slug: string;
  };
}

// Fetch post data dynamically based on the slug
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const postData = await getPostData(params.slug);

  if (!postData) {
    return {
      title: 'Post not found',
      description: 'The blog post you are looking for does not exist.',
    };
  }

  return {
    title: postData.title,
    description: postData.excerpt || postData.contentHtml.slice(0, 150),
    openGraph: {
      title: postData.title,
      description: postData.excerpt || postData.contentHtml.slice(0, 150),
      type: 'article',
      publishedTime: postData.date,
      url: `https://asbible.com/blog/${params.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: postData.title,
      description: postData.excerpt || postData.contentHtml.slice(0, 150),
    },
    alternates: {
      canonical: `https://asbible.com/blog/${params.slug}`,
    },
  };
}

// Fetch slugs dynamically for generating static paths
export async function generateStaticParams() {
  const slugs = getPostSlugs();
  return slugs.map((slug) => ({
    slug,
  }));
}

// Dynamic Blog Post Component
export default async function BlogPost({ params }: Params) {
  const postData = await getPostData(params.slug);

  if (!postData) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link href="/blog" passHref>
        <Button variant="outline" className="mb-4">
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Blog
        </Button>
      </Link>
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">{postData.title}</CardTitle>
          <p className="text-sm text-gray-500">{postData.date}</p>
        </CardHeader>
        <CardContent>
          <div
            className="prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: postData.contentHtml }}
          />
        </CardContent>
      </Card>
    </div>
  );
}

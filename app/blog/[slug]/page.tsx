import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft } from "lucide-react"
import { getPostData } from '@/lib/posts'

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const postData = await getPostData(params.slug)

  if (!postData) {
    notFound()
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
          <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: postData.contentHtml }} />
        </CardContent>
      </Card>
    </div>
  )
}
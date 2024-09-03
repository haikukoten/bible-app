import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft } from "lucide-react"
import { getVideoData } from '@/lib/videos'

export default async function VideoPage({ params }: { params: { id: string } }) {
  const videoData = await getVideoData(params.id)

  if (!videoData) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link href="/videos" passHref>
        <Button variant="outline" className="mb-4">
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Videos
        </Button>
      </Link>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{videoData.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-w-16 aspect-h-9 mb-4">
            <iframe
              src={`https://www.youtube.com/embed/${videoData.youtubeId}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>
          <h2 className="text-xl font-semibold mb-2">Description</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">{videoData.description}</p>
          <h2 className="text-xl font-semibold mb-2">Additional Content</h2>
          <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: videoData.contentHtml }} />
        </CardContent>
      </Card>
    </div>
  )
}
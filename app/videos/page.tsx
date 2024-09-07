import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { PlayCircle } from "lucide-react"
import { getSortedVideosData } from '@/lib/videos'
import { Metadata } from 'next'

// SEO Metadata
export const metadata: Metadata = {
  title: 'Inspiring Bible Videos',
  description: 'Watch and learn from our collection of insightful Bible study videos.',
  openGraph: {
    title: 'Inspiring Bible Videos',
    description: 'Watch and learn from our collection of insightful Bible study videos.',
    url: 'https://yourdomain.com/videos',
    type: 'website',
    images: [
      {
        url: '/path-to-thumbnail-image.jpg', // You can provide a default image for the page
        alt: 'Inspiring Bible Videos Thumbnail',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Inspiring Bible Videos',
    description: 'Watch and learn from our collection of insightful Bible study videos.',
    images: ['/path-to-thumbnail-image.jpg'], // Default image for Twitter cards
  },
  alternates: {
    canonical: 'https://yourdomain.com/videos',
  },
}

export default function VideosPage() {
  const allVideosData = getSortedVideosData()

  return (
    <>
      {/* Structured Data for SEO */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "VideoGallery",
          "name": "Inspiring Bible Videos",
          "description": "Watch and learn from our collection of insightful Bible study videos.",
          "url": "https://yourdomain.com/videos",
          "thumbnailUrl": "/path-to-thumbnail-image.jpg",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://yourdomain.com/videos?search={search_term_string}",
            "query-input": "required name=search_term_string"
          },
          "video": allVideosData.map(video => ({
            "@type": "VideoObject",
            "name": video.title,
            "description": video.description,
            "thumbnailUrl": video.thumbnail,
            "uploadDate": "2023-01-01T00:00:00Z",  // Update to the actual upload date
            "contentUrl": `https://yourdomain.com/videos/${video.id}`,
            "embedUrl": `https://www.youtube.com/embed/${video.youtubeId}`,
          })),
        })
      }} />

      {/* Page Content */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6 max-w-7xl mx-auto">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Inspiring Bible Videos
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                Watch and learn from our collection of insightful Bible study videos.
              </p>
            </div>
            <div className="w-full max-w-sm">
              <Input
                type="search"
                placeholder="Search videos..."
              />
            </div>
          </div>
        </div>
      </section>
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
        <div className="container px-4 md:px-6 max-w-7xl mx-auto">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {allVideosData.map((video) => (
              <Link href={`/videos/${video.id}`} key={video.id}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="p-0">
                    <img src={video.thumbnail} alt={video.title} className="w-full h-48 object-cover" />
                  </CardHeader>
                  <CardContent className="p-4">
                    <CardTitle className="text-lg font-semibold mb-2">{video.title}</CardTitle>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{video.description}</p>
                    <div className="flex items-center text-blue-500">
                      <PlayCircle className="mr-2 h-4 w-4" />
                      <span className="text-sm">Watch Video</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

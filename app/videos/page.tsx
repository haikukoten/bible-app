import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { PlayCircle } from "lucide-react"
import { getSortedVideosData } from '@/lib/videos'

export default function VideosPage() {
  const allVideosData = getSortedVideosData()

  return (
    <>
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
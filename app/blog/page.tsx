import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { getSortedPostsData } from '@/lib/posts'

export default function BlogPage() {
  const allPostsData = getSortedPostsData()

  return (
    <>
      <section className="w-full py-8 md:py-16 lg:py-20">
        <div className="container px-4 md:px-6 max-w-7xl mx-auto">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Our Blog
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                Explore thought-provoking articles on faith and spirituality.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="w-full py-6 md:py-12 lg:py-16 bg-gray-100 dark:bg-gray-800">
        <div className="container px-4 md:px-6 max-w-7xl mx-auto">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {allPostsData.map((post) => (
              <Card key={post.id}>
                <CardHeader>
                  <CardTitle>{post.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500 dark:text-gray-400">{post.excerpt}</p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Link href={`/blog/${post.id}`} passHref>
                    <Button variant="outline">Read More</Button>
                  </Link>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{post.date}</p>
                </CardFooter>
              </Card>
            ))}
          </div>
          <div className="flex justify-center mt-8 space-x-4">
            <Button variant="outline">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous Page
            </Button>
            <Button variant="outline">
              Next Page
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}

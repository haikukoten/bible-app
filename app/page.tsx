import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from 'next/link'

// Fetch posts directly from the _posts directory (server-side)
function getSortedPostsData() {
  const postsDirectory = path.join(process.cwd(), '_posts')
  const fileNames = fs.readdirSync(postsDirectory)
  const allPostsData = fileNames.map((fileName) => {
    const id = fileName.replace(/\.md$/, '')
    const fullPath = path.join(postsDirectory, fileName)
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const matterResult = matter(fileContents)

    return {
      id,
      ...(matterResult.data as { date: string; title: string; excerpt: string }),
    }
  })

  return allPostsData.sort((a, b) => {
    return new Date(a.date) < new Date(b.date) ? 1 : -1
  })
}

export default function Home() {
  const allPostsData = getSortedPostsData()

  return (
    <>
      <section className="w-full py-8 md:py-16 lg:py-20 xl:py-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Welcome to Our Bible Website
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                Explore the scriptures, read our blog, and find daily inspiration.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Verse of the Day */}
      <section className="w-full py-8 md:py-16 lg:py-20 bg-gray-100 dark:bg-gray-800">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Verse of the Day</h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Find daily inspiration in God's word.
              </p>
            </div>
            <Card className="w-full max-w-3xl">
              <CardHeader>
                <CardTitle>Today's Verse</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-serif italic">
                  For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life. - John 3:16
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Latest Blog Posts (moved out of the grey area) */}
      <section className="w-full py-6 md:py-12 lg:py-16 bg-white dark:bg-gray-900">
        <div className="container px-4 md:px-6 max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tighter text-center sm:text-4xl md:text-5xl lg:text-6xl mb-8">
            Latest Blog Posts
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {allPostsData.slice(0, 4).map((post) => (
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
        </div>
      </section>
    </>
  )
}

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'

const postsDirectory = path.join(process.cwd(), '_posts')

// Fetch and sort all blog posts based on date
export function getSortedPostsData() {
  // Get file names under /_posts
  const fileNames = fs.readdirSync(postsDirectory)
  
  const allPostsData = fileNames.map((fileName) => {
    // Remove ".md" from file name to get id
    const id = fileName.replace(/\.md$/, '')

    // Read markdown file as string
    const fullPath = path.join(postsDirectory, fileName)
    const fileContents = fs.readFileSync(fullPath, 'utf8')

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents)

    // Return the parsed data along with the post id
    return {
      id,
      ...(matterResult.data as { date: string; title: string; excerpt: string })
    }
  })

  // Sort posts by date in descending order
  return allPostsData.sort((a, b) => {
    return a.date < b.date ? 1 : -1
  })
}

// Fetch the content for a single post by id
export async function getPostData(id: string) {
  const fullPath = path.join(postsDirectory, `${id}.md`)
  const fileContents = fs.readFileSync(fullPath, 'utf8')

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents)

  // Use remark to convert markdown into HTML string
  const processedContent = await remark()
    .use(html)
    .process(matterResult.content)
  const contentHtml = processedContent.toString()

  // Return the data and the HTML content
  return {
    id,
    contentHtml,
    ...(matterResult.data as { date: string; title: string; excerpt: string })
  }
}

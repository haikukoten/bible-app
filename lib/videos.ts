import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'

const videosDirectory = path.join(process.cwd(), '_videos')

export function getSortedVideosData() {
  const fileNames = fs.readdirSync(videosDirectory)
  const allVideosData = fileNames.map((fileName) => {
    const id = fileName.replace(/\.md$/, '')
    const fullPath = path.join(videosDirectory, fileName)
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const matterResult = matter(fileContents)

    return {
      id,
      ...(matterResult.data as { title: string; description: string; thumbnail: string; youtubeId: string })
    }
  })

  return allVideosData.sort((a, b) => {
    if (a.title < b.title) {
      return -1
    } else {
      return 1
    }
  })
}

export async function getVideoData(id: string) {
  const fullPath = path.join(videosDirectory, `${id}.md`)
  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const matterResult = matter(fileContents)
  const processedContent = await remark()
    .use(html)
    .process(matterResult.content)
  const contentHtml = processedContent.toString()

  return {
    id,
    contentHtml,
    ...(matterResult.data as { title: string; description: string; thumbnail: string; youtubeId: string })
  }
}
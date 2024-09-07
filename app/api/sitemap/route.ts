import { getSortedPostsData } from '@/lib/posts'
import { getSortedVideosData } from '@/lib/videos'
import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Helper function to get static pages
const getStaticPages = () => {
  const pagesDirectory = path.join(process.cwd(), 'app')
  const staticFiles = fs.readdirSync(pagesDirectory)
  
  // Get only .tsx files that are not dynamic (ignore [slug], [id], etc.)
  const staticPages = staticFiles
    .filter((file) => !file.includes('[') && file.endsWith('.tsx')) // Ignore dynamic pages
    .map((file) => ({
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/${file.replace('.tsx', '')}`,
      lastMod: new Date().toISOString(),
    }))

  return staticPages
}

// Function to generate the XML sitemap
const generateSitemap = (pages: any[], posts: any[], videos: any[]) => {
  return `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${pages
      .map((page) => {
        return `
      <url>
        <loc>${page.url}</loc>
        <lastmod>${page.lastMod}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
      </url>
    `
      })
      .join('')}
    ${posts
      .map((post) => {
        return `
      <url>
        <loc>${process.env.NEXT_PUBLIC_SITE_URL}/blog/${post.id}</loc>
        <lastmod>${post.date}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.7</priority>
      </url>
    `
      })
      .join('')}
    ${videos
      .map((video) => {
        return `
      <url>
        <loc>${process.env.NEXT_PUBLIC_SITE_URL}/videos/${video.id}</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.7</priority>
      </url>
    `
      })
      .join('')}
  </urlset>
  `
}

// API Route to generate Sitemap
export async function GET() {
  // Fetch posts and videos data
  const allPostsData = getSortedPostsData()
  const allVideosData = getSortedVideosData()

  // Get static pages
  const staticPages = getStaticPages()

  // Generate the sitemap XML
  const sitemap = generateSitemap(staticPages, allPostsData, allVideosData)

  // Return the sitemap in XML format
  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  })
}

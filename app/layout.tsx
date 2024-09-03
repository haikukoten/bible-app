import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import { BookOpen } from 'lucide-react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Bible Website',
  description: 'Explore the scriptures, read our blog, find daily inspiration, and watch inspiring videos.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex flex-col min-h-screen bg-background">
          <header className="px-4 lg:px-6 h-14 flex items-center justify-between max-w-7xl mx-auto w-full">
            <Link className="flex items-center justify-center" href="/">
              <BookOpen className="h-6 w-6" />
              <span className="sr-only">Bible Website</span>
            </Link>
            <nav className="flex gap-4 sm:gap-6">
              <Link className="text-sm font-medium hover:underline underline-offset-4" href="/">
                Home
              </Link>
              <Link className="text-sm font-medium hover:underline underline-offset-4" href="/bible">
                Bible
              </Link>
              <Link className="text-sm font-medium hover:underline underline-offset-4" href="/blog">
                Blog
              </Link>
              <Link className="text-sm font-medium hover:underline underline-offset-4" href="/videos">
                Videos
              </Link>
            </nav>
          </header>
          <main className="flex-1 w-full max-w-7xl mx-auto">
            {children}
          </main>
          <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t max-w-7xl mx-auto">
            <p className="text-xs text-gray-500 dark:text-gray-400">© 2023 Bible Website. All rights reserved.</p>
            <nav className="sm:ml-auto flex gap-4 sm:gap-6">
              <Link className="text-xs hover:underline underline-offset-4" href="#">
                Terms of Service
              </Link>
              <Link className="text-xs hover:underline underline-offset-4" href="#">
                Privacy
              </Link>
            </nav>
          </footer>
        </div>
      </body>
    </html>
  )
}
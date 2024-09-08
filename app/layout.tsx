// app/layout.tsx
import './globals.css'
import { Inter } from 'next/font/google'
import ClientNavbar from '@/components/ClientNavbar' // Import the Client Navbar
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
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
          <ClientNavbar /> {/* Use the Client Component here */}
          <main className="flex-1 w-full max-w-7xl mx-auto">
            {children}
          </main>
          <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t max-w-7xl mx-auto">
            <p className="text-xs text-gray-500 dark:text-gray-400">© 2024 asBible. All rights reserved.</p>
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

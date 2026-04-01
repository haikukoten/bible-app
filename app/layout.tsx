// app/layout.tsx
import './globals.css';
import ClientNavbar from '@/components/ClientNavbar'; // Import the Client Navbar
import Link from 'next/link';
import Script from 'next/script'; // Import the Next.js Script component
// Inter font removed for raw 4chan aesthetic

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://asbible.com';

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: 'asBible | Read Bible',
  description: 'Explore the scriptures, read our blog, find daily inspiration, and watch inspiring videos.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-250XKLDNC4"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-250XKLDNC4');
          `}
        </Script>
      </head>
      <body>
        <div className="flex flex-col min-h-screen bg-background">
          <ClientNavbar /> {/* Use the Client Component here */}
          <main className="flex-1 w-full max-w-7xl mx-auto">
            {children}
          </main>
          <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t max-w-7xl mx-auto">
            <p className="text-xs">© 2024 asBible. All rights reserved.</p>
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
  );
}

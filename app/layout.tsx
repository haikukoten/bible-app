import './globals.css';
import ClientNavbar from '@/components/ClientNavbar'; // Import the Client Navbar
import Link from 'next/link';
import Script from 'next/script'; // Import the Next.js Script component
import CapiFormTracker from '@/components/CapiFormTracker';

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
        <meta name="google-adsense-account" content="ca-pub-2771580866311262" />
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
        {/* Meta Pixel Code */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1526511622820852');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=1526511622820852&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
      </head>
      <body className="min-h-screen">
        <CapiFormTracker />
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

import { Metadata } from 'next';
import Script from 'next/script';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://asbible.com';

export const metadata: Metadata = {
  title: 'Daily Verse | asBible',
  description: 'Check out today\'s daily verse on asBible!',
  openGraph: {
    title: 'Daily Verse | asBible',
    description: 'Check out today\'s daily verse on asBible!',
    url: `${siteUrl}/verse`,
    siteName: 'asBible',
    images: [
      {
        url: `${siteUrl}/api/verse-image.png`,
        width: 1080,
        height: 1080,
        alt: 'Daily Verse Image',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Daily Verse | asBible',
    description: 'Check out today\'s daily verse on asBible!',
    images: [`${siteUrl}/api/verse-image.png`],
  },
};

export default function VerseSharePage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Redirecting to asBible...</h1>
        <p className="text-gray-500">If you are not redirected automatically, <a href="/" className="text-blue-500 hover:underline">click here</a>.</p>
      </div>
      {/* 
        We use client-side redirect so bots (Facebook, Twitter) parsing the HTML 
        will stay on this page to read the OG tags, while real users are redirected.
      */}
      <Script id="redirect-script" strategy="afterInteractive">
        {`window.location.href = '/';`}
      </Script>
    </div>
  );
}

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'asBible | Read Bible Online',
  description: 'Read Bible online, select from different versions and explore the word of God.',
  openGraph: {
    title: 'asBible | Read Bible Online',
    description: 'Read Bible online, select from different versions and explore the word of God.',
    url: 'https://yourdomain.com/bible',
    type: 'website',
    images: [
      {
        url: '/path-to-thumbnail-image.jpg', // Provide a default image for Open Graph sharing
        alt: 'Bible Page Thumbnail',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'asBible | Read Bible Online',
    description: 'Read Bible online, select from different versions and explore the word of God.',
    images: ['/path-to-thumbnail-image.jpg'], // Default image for Twitter cards
  },
  alternates: {
    canonical: 'https://asbible.com/bible',
  },
};

export default function BibleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

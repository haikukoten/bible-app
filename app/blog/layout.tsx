import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'asBible | Read Bible Blog',
  description: 'Deepen your faith and understanding with asBible. Explore insightful Bible blogs, study guides, and resources for spiritual growth.',
  openGraph: {
    title: 'asBible | Read Bible Blog',
    description: 'Deepen your faith and understanding with asBible. Explore insightful Bible blogs, study guides, and resources for spiritual growth.',
    url: 'https://asbible.com/blog',
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
    title: 'asBible | Read Bible Blog',
    description: 'Deepen your faith and understanding with asBible. Explore insightful Bible blogs, study guides, and resources for spiritual growth.',
    images: ['/path-to-thumbnail-image.jpg'], // Default image for Twitter cards
  },
  alternates: {
    canonical: 'https://asbible.com/blog',
  },
};

export default function BibleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

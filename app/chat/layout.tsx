import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'asBible | Chat with Bible AI',
  description: 'Now you can chat with Bible with asBible AI Bible Chat. Get in-depth knowledge of Bible with the Bible Chat.',
  openGraph: {
    title: 'asBible | Chat with Bible AI',
    description: 'Now you can chat with Bible with asBible AI Bible Chat. Get in-depth knowledge of Bible with the Bible Chat.',
    url: 'https://asbible.com/bible',
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
    title: 'asBible | Chat with Bible AI',
    description: 'Now you can chat with Bible with asBible AI Bible Chat. Get in-depth knowledge of Bible with the Bible Chat.',
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

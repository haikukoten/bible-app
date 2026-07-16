import { ImageResponse } from 'next/og';
// Use edge runtime for fast response
export const runtime = 'edge';

// We use fetch to load the font instead of fs in edge runtime
const font = fetch(new URL('../../../public/fonts/Pacifico-Regular.ttf', import.meta.url)).then(
  (res) => res.arrayBuffer()
);

const BACKGROUND_GRADIENTS = [
  "linear-gradient(to right, #ffecd2, #fcb69f)",
  "linear-gradient(120deg, #a1c4fd, #c2e9fb)",
  "linear-gradient(120deg, #84fab0, #8fd3f4)",
  "linear-gradient(120deg, #fccb90, #d57eeb)",
  "linear-gradient(120deg, #e0c3fc, #8ec5fc)",
  "linear-gradient(to top, #cfd9df, #e2ebf0)",
  "linear-gradient(135deg, #fdfbfb, #ebedee)",
];

export async function GET(request: Request) {
  try {
    // Determine gradient based on today's date
    const today = new Date().toDateString();
    let hash = 0;
    for (let i = 0; i < today.length; i++) {
      hash = today.charCodeAt(i) + ((hash << 5) - hash);
    }
    const bgIndex = Math.abs(hash) % BACKGROUND_GRADIENTS.length;
    const bgGradient = BACKGROUND_GRADIENTS[bgIndex];

    // Fetch the daily verse
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://asbible.com';
    const verseRes = await fetch(`${siteUrl}/api/dailyVerse`, { next: { revalidate: 3600 } });
    let dailyVerse = { verse: "Be strong and courageous.", book: "Joshua", chapter: 1, verse_number: 9 };
    
    if (verseRes.ok) {
      dailyVerse = await verseRes.json();
    }

    const fontData = await font;

    return new ImageResponse(
      (
        <div
          style={{
            background: bgGradient,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: '"Pacifico"',
          }}
        >
          {/* Main Content Area */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '60px',
              textAlign: 'center',
              color: '#1f2937', // text-gray-800 equivalent
            }}
          >
            <p
              style={{
                fontSize: '64px',
                lineHeight: 1.4,
                margin: '0 0 24px 0',
              }}
            >
              &quot;{dailyVerse.verse}&quot;
            </p>
            <p
              style={{
                fontSize: '32px',
                fontFamily: 'sans-serif',
                fontWeight: 600,
                margin: 0,
              }}
            >
              {dailyVerse.book} {dailyVerse.chapter}:{dailyVerse.verse_number}
            </p>
          </div>

          {/* Footer Area */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              width: '100%',
              padding: '16px 0',
              background: 'rgba(0, 0, 0, 0.1)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <p
              style={{
                fontSize: '20px',
                color: 'rgba(31, 41, 55, 0.8)', // text-gray-800/80 equivalent
                margin: 0,
                fontFamily: 'sans-serif',
                fontWeight: 500,
                letterSpacing: '0.05em',
              }}
            >
              © asbible.com | asbible.com/daily-verse
            </p>
          </div>
        </div>
      ),
      {
        width: 1080,
        height: 1080, // 1:1 aspect ratio
        fonts: [
          {
            name: 'Pacifico',
            data: fontData,
            style: 'normal',
          },
        ],
      }
    );
  } catch (e: any) {
    console.error(e);
    return new Response('Failed to generate image', { status: 500 });
  }
}

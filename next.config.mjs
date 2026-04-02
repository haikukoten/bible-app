/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
];

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.ctfassets.net',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/2026每日读经表',
        destination: '/2026-daily-reading-plan',
      },
      {
        source: '/2026 每日读经表',
        destination: '/2026-daily-reading-plan',
      },
      {
        source: '/2026%E6%AF%8F%E6%97%A5%E8%AF%BB%E7%BB%8F%E8%A1%A8',
        destination: '/2026-daily-reading-plan',
      },
      {
        source: '/2026%20%E6%AF%8F%E6%97%A5%E8%AF%BB%E7%BB%8F%E8%A1%A8',
        destination: '/2026-daily-reading-plan',
      }
    ];
  },
};

export default nextConfig;
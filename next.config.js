/** @type {import("next").NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  async headers() {
    return [
      {
        // Password-recovery page: the URL carries one-time tokens, so never leak it via Referer and never cache it.
        source: '/reset-password',
        headers: [
          { key: 'Referrer-Policy', value: 'no-referrer' },
          { key: 'Cache-Control', value: 'no-store, max-age=0' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ],
      },
    ]
  },
  async redirects() {
    return [
      {
        source: '/privacy.html',
        destination: '/privacy',
        permanent: true,
      },
      {
        source: '/privacy-policy.html',
        destination: '/privacy',
        permanent: true,
      },
    ]
  },
}
module.exports = nextConfig

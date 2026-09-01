/** @type {import("next").NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
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

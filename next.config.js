/** @type {import("next").NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  generateBuildId: async () => {
    return Date.now().toString()
  },
  headers: async () => [{
    source: "/(.*)",
    headers: [{
      key: "Cache-Control",
      value: "no-cache, no-store, must-revalidate"
    }]
  }]
}
module.exports = nextConfig

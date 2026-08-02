/** @type {import("next").NextConfig} */
const nextConfig = {n  output: "export",
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
// force deploy Sun Jul 26 02:28:49 +03 2026

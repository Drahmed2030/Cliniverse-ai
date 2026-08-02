/** @type {import("next").NextConfig} */
const nextConfig = {
  output: "export",
  typescript: { ignoreBuildErrors: true },
  generateBuildId: async () => {
    return Date.now().toString()
  },
  images: { unoptimized: true }
}
module.exports = nextConfig

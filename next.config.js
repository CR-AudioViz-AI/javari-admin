/** @type {import("next").NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  reactStrictMode: false,
  experimental: {
    serverComponentsExternalPackages: ['cheerio', 'undici', 'csv-parse'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), 'cheerio', 'undici'];
    }
    return config;
  },
}
module.exports = nextConfig

/** @type {import("next").NextConfig} */
const nextConfig = {
  // 2026-08-29: required for @craudioviz/platform-sdk. The SDK ships raw
  // TypeScript and Next does not run node_modules through SWC by default, so
  // any import carrying a `type` re-export fails the build without this.
  transpilePackages: ["@craudioviz/platform-sdk"],
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  reactStrictMode: false,
  // 2026-08-30: RENAMED IN NEXT 15. experimental.serverComponentsExternalPackages
  // became the stable serverExternalPackages. The old key is ignored rather than
  // rejected, so cheerio, undici and csv-parse would have been silently bundled
  // into the server build instead of externalised — a config that looks present
  // and does nothing, which is the defect class this audit keeps removing.
  serverExternalPackages: ['cheerio', 'undici', 'csv-parse'],
  // 2026-08-30: this webpack hook now does TWO jobs. The existing server
  // externals are kept exactly as they were — replacing this function with the
  // edge-crypto fix alone would have silently dropped the cheerio and undici
  // externalisation that this app depends on.
  webpack: (config, { isServer, nextRuntime }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), 'cheerio', 'undici'];
    }
    // Next 15 compiles instrumentation.ts for the EDGE runtime as well as node,
    // pulling the vault env-shim's crypto import into an edge bundle. The
    // specifier must stay a BARE `crypto`: webpack rejects the `node:` scheme
    // before resolve.fallback is consulted, so node:crypto fails here too.
    if (nextRuntime === 'edge') {
      config.resolve = config.resolve || {};
      config.resolve.fallback = { ...(config.resolve.fallback || {}), crypto: false };
    }
    return config;
  },
}
module.exports = nextConfig

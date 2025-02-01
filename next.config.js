/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  // Allow larger model files
  webpack: (config) => {
    config.performance.maxAssetSize = 1024 * 1024 * 5; // 5MB
    config.performance.maxEntrypointSize = 1024 * 1024 * 5; // 5MB
    return config;
  },
  // Add Turbopack configuration
  experimental: {
    turbo: {
      resolveExtensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
      rules: {
        // Add any specific loader rules if needed
      },
    },
  },
  async headers() {
    return [
      {
        source: "/models/dqn_model/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;

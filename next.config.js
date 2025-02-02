/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  // Allow larger model files
  webpack: (config) => {
    config.performance.maxAssetSize = 1024 * 1024 * 5; // 5MB
    config.performance.maxEntrypointSize = 1024 * 1024 * 5; // 5MB
    return config;
  },
  // Add Turbopack configuration
  experimental: {
    optimizeCss: true,
    turbo: {
      rules: {
        // Prevent compilation of test files during production build
        '**/*.test.*': ['development', 'test'],
        '**/*.spec.*': ['development', 'test'],
      },
    },
  },
  // Cache headers for model files
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

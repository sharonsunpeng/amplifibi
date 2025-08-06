import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    // Disable static optimization for pages that use authentication
    staticPageGenerationTimeout: 0,
  },
  // Disable static generation for auth-dependent routes
  trailingSlash: false,
  output: 'standalone',
};

export default nextConfig;

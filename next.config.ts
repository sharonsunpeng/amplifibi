import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Additional build optimizations
  trailingSlash: false,
  poweredByHeader: false,
  serverExternalPackages: ['@prisma/client']
};

export default nextConfig;

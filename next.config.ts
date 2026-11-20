import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['@react-pdf/renderer'],
  experimental: {
    optimizePackageImports: ['@phosphor-icons/react'],
    serverActions: {
      allowedOrigins: ['localhost:3000', '*.devtunnels.ms'],
    },
  },
};

export default nextConfig;
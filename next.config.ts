import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverComponentsExternalPackages: ['NeteaseCloudMusicApi'],
  },
};

export default nextConfig;

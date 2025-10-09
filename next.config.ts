import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  expireTime: 3600,
  serverExternalPackages: ['NeteaseCloudMusicApi'],
  experimental: {
    serverActions: {
      allowedOrigins: [
        '*.vercel.app',
        'localhost:3000',
        '127.0.0.1:3000',
        'diana-audio.asoulofficial.cn.eu.org',
      ],
    },
  },
  images: {
    remotePatterns: [new URL('https://*.hdslb.com/**')],
  },
};

export default nextConfig;

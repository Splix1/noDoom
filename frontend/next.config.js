/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.bsky.app',
        pathname: '/img/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.frankerfacez.com',
        pathname: '/emoticon/**',
      }
    ],
    domains: ['cdn.bsky.app'],
  },
} 

module.exports = nextConfig; 
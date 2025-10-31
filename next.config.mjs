/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
  // Production optimizations
  output: 'standalone',
  serverExternalPackages: ['@prisma/client'],
}

export default nextConfig

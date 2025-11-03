/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    // Enable Next.js Image Optimization
    formats: ['image/avif', 'image/webp'],
    // Optimize images automatically
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Production optimizations
  output: 'standalone',
  serverExternalPackages: ['@prisma/client'],
}

export default nextConfig

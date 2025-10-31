import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || 'https://example.com'

  const routes = [
    '',
    '/products',
    '/processed-products',
    '/about',
    '/contact',
    '/faq',
    '/cart',
    '/checkout',
    '/loyalty',
    '/order-tracking',
    '/store-location-demo',
  ]

  const now = new Date()

  return routes.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: path === '' ? 1 : 0.7,
  }))
}



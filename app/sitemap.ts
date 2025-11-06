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
  ]

  return routes.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: path === '' ? 1 : 0.7,
  }))
}



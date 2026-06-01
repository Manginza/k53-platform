import type { MetadataRoute } from 'next'

const BASE = 'https://www.skdriving.co.za'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Keep private/transactional routes out of the index.
      disallow: ['/admin', '/api/', '/subscribe/'],
    },
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  }
}

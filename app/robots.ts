import type { MetadataRoute } from 'next'

const BASE = 'https://www.skdriving.co.za'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Keep private and transactional routes out of crawler indexes.
        disallow: ['/admin', '/api/', '/account', '/subscribe/', '/trainer/dashboard'],
      },
      { userAgent: 'Googlebot', allow: '/', disallow: ['/admin', '/api/', '/account', '/subscribe/', '/trainer/dashboard'] },
      { userAgent: 'OAI-SearchBot', allow: '/', disallow: ['/admin', '/api/', '/account', '/subscribe/', '/trainer/dashboard'] },
      { userAgent: 'ChatGPT-User', allow: '/', disallow: ['/admin', '/api/', '/account', '/subscribe/', '/trainer/dashboard'] },
      { userAgent: 'Claude-SearchBot', allow: '/', disallow: ['/admin', '/api/', '/account', '/subscribe/', '/trainer/dashboard'] },
      { userAgent: 'Claude-User', allow: '/', disallow: ['/admin', '/api/', '/account', '/subscribe/', '/trainer/dashboard'] },
      { userAgent: 'PerplexityBot', allow: '/', disallow: ['/admin', '/api/', '/account', '/subscribe/', '/trainer/dashboard'] },
      { userAgent: 'Perplexity-User', allow: '/', disallow: ['/admin', '/api/', '/account', '/subscribe/', '/trainer/dashboard'] },
      // Training crawlers are separate from search-time retrieval crawlers.
      { userAgent: 'GPTBot', disallow: '/' },
      { userAgent: 'ClaudeBot', disallow: '/' },
      { userAgent: 'Google-Extended', disallow: '/' },
      { userAgent: 'Meta-ExternalAgent', disallow: '/' },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  }
}

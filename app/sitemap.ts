import type { MetadataRoute } from 'next'
import { RULES_CHAPTERS } from '@/lib/rules-of-the-road'

const BASE = 'https://www.skdriving.co.za'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticPaths = [
    '',                 // home
    '/centers',         // find nearest writing centre — SEO priority page
    '/pricing',
    '/courses',
    '/live-notes',
    '/live-notes/rules',
    '/videos',
    '/resources',
    '/affiliate',
    '/register',
    '/login',
  ]

  const staticEntries: MetadataRoute.Sitemap = staticPaths.map(p => ({
    url: `${BASE}${p}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: p === '' ? 1 : 0.7,
  }))

  const provinceEntries: MetadataRoute.Sitemap = [
    'Gauteng', 'Western Cape', 'KwaZulu-Natal', 'Eastern Cape',
    'Mpumalanga', 'Limpopo', 'Free State', 'North West', 'Northern Cape',
  ].map(prov => ({
    url: `${BASE}/centers?province=${encodeURIComponent(prov)}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  const ruleEntries: MetadataRoute.Sitemap = RULES_CHAPTERS.map(c => ({
    url: `${BASE}/live-notes/rules/${c.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  return [...staticEntries, ...provinceEntries, ...ruleEntries]
}

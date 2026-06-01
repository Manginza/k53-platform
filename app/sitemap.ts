import type { MetadataRoute } from 'next'
import { RULES_CHAPTERS } from '@/lib/rules-of-the-road'

const BASE = 'https://www.skdriving.co.za'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticPaths = [
    '',                 // home
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

  const ruleEntries: MetadataRoute.Sitemap = RULES_CHAPTERS.map(c => ({
    url: `${BASE}/live-notes/rules/${c.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  return [...staticEntries, ...ruleEntries]
}

import type { MetadataRoute } from 'next'
import { RULES_CHAPTERS } from '@/lib/rules-of-the-road'

const BASE = 'https://www.skdriving.co.za'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticPaths = [
    '',                 // home
    '/k53-learners-study-guide',
    '/centers',         // find nearest writing centre — SEO priority page
    '/driving-schools', // driving school locator
    '/pricing',
    '/courses',
    '/live-notes',
    '/live-notes/rules',
    '/videos',
    '/resources',
    '/about',
    '/contact',
    '/affiliate',
  ]

  const staticEntries: MetadataRoute.Sitemap = staticPaths.map(p => ({
    url: `${BASE}${p}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: p === '' ? 1 : p === '/k53-learners-study-guide' ? 0.9 : 0.7,
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

  const schoolProvinceEntries: MetadataRoute.Sitemap = [
    'Gauteng', 'Western Cape', 'KwaZulu-Natal', 'Eastern Cape',
    'Mpumalanga', 'Limpopo', 'Free State', 'North West', 'Northern Cape',
  ].map(prov => ({
    url: `${BASE}/driving-schools?province=${encodeURIComponent(prov)}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  return [...staticEntries, ...provinceEntries, ...schoolProvinceEntries, ...ruleEntries]
}

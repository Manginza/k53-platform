import type { MetadataRoute } from 'next'
import { BLOG_POSTS } from '@/lib/blog'
import { PROVINCES } from '@/lib/directory'
import { QUESTIONS_PATH, QUESTIONS_PDF_PATH } from '@/lib/k53-sample-questions'
import { publicSelect } from '@/lib/supabase-public'
import { absoluteUrl } from '@/lib/site'

// Regenerate daily so new courses appear without a deploy.
export const revalidate = 86400

/**
 * Only indexable, public, canonical URLs belong here. Members-only pages
 * (/live-notes, /videos, /resources, …) and account / auth / admin pages are
 * noindex and deliberately left out.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const pages: { path: string; priority: number; changeFrequency: 'weekly' | 'monthly' | 'yearly' }[] = [
    { path: '/', priority: 1, changeFrequency: 'weekly' },
    { path: QUESTIONS_PATH, priority: 0.9, changeFrequency: 'monthly' },
    { path: QUESTIONS_PDF_PATH, priority: 0.7, changeFrequency: 'monthly' },
    { path: '/k53-learners-study-guide', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/courses', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/centers', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/driving-schools', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/pricing', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/blog', priority: 0.6, changeFrequency: 'weekly' },
    { path: '/about', priority: 0.5, changeFrequency: 'yearly' },
    { path: '/contact', priority: 0.5, changeFrequency: 'yearly' },
    { path: '/affiliate', priority: 0.4, changeFrequency: 'monthly' },
    { path: '/trainer', priority: 0.4, changeFrequency: 'monthly' },
    { path: '/manifesto', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/privacy-policy', priority: 0.2, changeFrequency: 'yearly' },
    { path: '/terms-and-conditions', priority: 0.2, changeFrequency: 'yearly' },
    { path: '/cookie-policy', priority: 0.2, changeFrequency: 'yearly' },
  ]

  const staticEntries: MetadataRoute.Sitemap = pages.map(p => ({
    url: absoluteUrl(p.path),
    lastModified: now,
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }))

  const provinceEntries: MetadataRoute.Sitemap = PROVINCES.flatMap(p => [
    { url: absoluteUrl(`/centers/${p.slug}`), lastModified: now, changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: absoluteUrl(`/driving-schools/${p.slug}`), lastModified: now, changeFrequency: 'monthly' as const, priority: 0.6 },
  ])

  const blogEntries: MetadataRoute.Sitemap = BLOG_POSTS.map(p => ({
    url: absoluteUrl(`/blog/${p.slug}`),
    lastModified: new Date(p.dateModified),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  // Course pages are public (they list the tests; the tests themselves are
  // gated). Skipped gracefully if Supabase is unreachable at build time.
  let courseEntries: MetadataRoute.Sitemap = []
  try {
    const courses = await publicSelect<{ id: number }>('courses', 'select=id&code=not.is.null&order=id', { revalidate: 86400 })
    courseEntries = (courses ?? []).map(c => ({
      url: absoluteUrl(`/courses/${c.id}`),
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))
  } catch {
    courseEntries = []
  }

  return [...staticEntries, ...courseEntries, ...provinceEntries, ...blogEntries]
}

/**
 * lib/site.ts — canonical site identity shared by metadata, JSON-LD and the sitemap.
 *
 * Every canonical URL, sitemap entry and structured-data block is built from
 * SITE_URL so the whole site agrees on one host (www, https).
 */
import type { Metadata } from 'next'
import { WHATSAPP_MAIN_DISPLAY, WHATSAPP_LINK } from '@/lib/contact'

export const SITE_URL = 'https://www.skdriving.co.za'
export const SITE_NAME = 'SK Driving'

/** Absolute URL on the canonical host. `absoluteUrl('/pricing')`. */
export function absoluteUrl(path = '/'): string {
  if (!path || path === '/') return SITE_URL
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

/** `alternates.canonical` for a path, so each page points at itself. */
export function canonical(path: string): Metadata['alternates'] {
  return { canonical: absoluteUrl(path) }
}

/**
 * Robots meta for pages that must stay out of search results: account, auth,
 * admin, in-progress quizzes and members-only content. Links are still
 * followed so crawlers can reach the public pages they point to.
 */
export const NOINDEX: Metadata['robots'] = { index: false, follow: true }

/** E.164-style number for schema.org `telephone`. */
const TELEPHONE = WHATSAPP_MAIN_DISPLAY.replace(/\s+/g, '')

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: SITE_NAME,
  url: SITE_URL,
  logo: absoluteUrl('/logo.png'),
  telephone: TELEPHONE,
  areaServed: 'ZA',
  sameAs: [WHATSAPP_LINK],
  contactPoint: [
    {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      telephone: TELEPHONE,
      url: WHATSAPP_LINK,
      areaServed: 'ZA',
      availableLanguage: ['English'],
    },
  ],
}

export interface Crumb { name: string; path: string }

/** BreadcrumbList JSON-LD. The first crumb should be Home ('/'). */
export function breadcrumbSchema(crumbs: Crumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  }
}

/** Serialise JSON-LD for a <script> tag, escaping `<` so content can't close the tag. */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

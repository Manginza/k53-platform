/**
 * lib/blog.ts — the SK Driving blog post registry.
 *
 * Each post's body lives in its own component under components/blog/, mapped
 * by slug in app/blog/[slug]/page.tsx. This file holds only the metadata the
 * index, the article route and the SEO/JSON-LD need.
 */
export interface BlogPost {
  slug: string
  /** Article H1. */
  title: string
  /** <title> for the browser tab / search result. */
  seoTitle: string
  /** Meta description. */
  description: string
  /** Short summary shown on the blog index card. */
  excerpt: string
  /** ISO date the article was first published. */
  datePublished: string
  /** ISO date it was last updated. */
  dateModified: string
  /** Social-share image (PNG, 1200x630) under /public. */
  image: string
  /** On-page featured image (SVG) under /public. */
  imageSvg: string
  imageAlt: string
  readMinutes: number
}

export const BASE_URL = 'https://www.skdriving.co.za'

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'learners-licence-study-materials-south-africa',
    title: "Learners Licence Study Materials: How to Prepare for South Africa's Computerised K53 Test",
    seoTitle: 'Learners Licence Study Materials | Prepare for Your K53 Test',
    description:
      "Looking for learners licence study materials in South Africa? Discover why pass rates are falling and prepare with SK Driving's computerised K53 practice tests.",
    excerpt:
      "Pass rates have reportedly fallen since computerised testing began. Here's why so many South Africans are failing — and how the right learners licence study materials and practice tests help you prepare.",
    datePublished: '2026-10-31',
    dateModified: '2026-10-31',
    image: '/blog/learners-licence-study-materials.png',
    imageSvg: '/blog/learners-licence-study-materials.svg',
    imageAlt: 'South African learners licence study materials and computerised K53 practice test.',
    readMinutes: 6,
  },
]

export function getPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find(p => p.slug === slug)
}

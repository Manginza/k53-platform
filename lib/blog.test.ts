import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { BLOG_POSTS, getPost } from './blog'
import { GUIDE_LIST } from './guides'
import { adsenseAllowed } from './adsense'

describe('blog posts', () => {
  it('lists the original article plus eight study articles', () => {
    expect(BLOG_POSTS).toHaveLength(9)
    expect(BLOG_POSTS.map(p => p.slug)).toEqual([
      'how-to-study-for-the-k53-learners-test-in-two-weeks',
      'k53-road-signs-most-people-get-wrong',
      'k53-rules-of-the-road-explained',
      'k53-vehicle-controls-questions-explained',
      'what-to-bring-on-learners-licence-test-day',
      'common-reasons-people-fail-the-learners-test',
      'learners-licence-vs-drivers-licence-codes',
      'what-you-can-do-after-passing-your-learners',
      'learners-licence-study-materials-south-africa',
    ])
  })

  it('gives every post unique metadata, a date and an image that exists', () => {
    const titles = new Set<string>()
    const seoTitles = new Set<string>()
    const descriptions = new Set<string>()
    const excerpts = new Set<string>()
    const guideText = new Set(GUIDE_LIST.flatMap(g => [g.title, g.description, g.h1]))
    for (const post of BLOG_POSTS) {
      expect(getPost(post.slug)).toBe(post)
      expect(titles.has(post.title), post.title).toBe(false)
      expect(seoTitles.has(post.seoTitle), post.seoTitle).toBe(false)
      titles.add(post.title)
      seoTitles.add(post.seoTitle)
      expect(descriptions.has(post.description), post.description).toBe(false)
      descriptions.add(post.description)
      expect(excerpts.has(post.excerpt)).toBe(false)
      excerpts.add(post.excerpt)
      expect(post.description.length).toBeGreaterThan(40)
      expect(post.excerpt.length).toBeGreaterThan(40)
      expect(post.datePublished).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(post.dateModified >= post.datePublished).toBe(true)
      expect(post.readMinutes).toBeGreaterThanOrEqual(6)
      expect(guideText.has(post.title), post.title).toBe(false)
      expect(guideText.has(post.description), post.description).toBe(false)
      expect(existsSync(join(process.cwd(), 'public', post.image))).toBe(true)
      expect(existsSync(join(process.cwd(), 'public', post.imageSvg))).toBe(true)
      expect(adsenseAllowed(`/blog/${post.slug}`)).toBe(true)
    }
  })
})

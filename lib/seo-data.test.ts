import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { PROVINCES, provinceBySlug, provinceFromParam } from './directory'
import { SAMPLE_QUESTION_COUNT, SAMPLE_SECTIONS, questionsFaqSchema } from './k53-sample-questions'
import { absoluteUrl, breadcrumbSchema, jsonLd } from './site'
import { GUIDE_LIST, SOURCES, faqPageSchema, guideMetadata } from './guides'

describe('directory provinces', () => {
  it('has nine unique slugs', () => {
    expect(PROVINCES).toHaveLength(9)
    expect(new Set(PROVINCES.map(p => p.slug)).size).toBe(9)
  })

  it('keeps meta descriptions to 155 characters', () => {
    for (const p of PROVINCES) {
      expect(p.centre.description.length, p.centre.description).toBeLessThanOrEqual(155)
      expect(p.school.description.length, p.school.description).toBeLessThanOrEqual(155)
    }
  })

  it('maps legacy ?province= values to slugs', () => {
    expect(provinceFromParam('Gauteng')?.slug).toBe('gauteng')
    expect(provinceFromParam('Western Cape')?.slug).toBe('western-cape')
    expect(provinceFromParam('KwaZulu-Natal')?.slug).toBe('kwazulu-natal')
    expect(provinceFromParam('north-west')?.slug).toBe('north-west')
    expect(provinceFromParam('Atlantis')).toBeUndefined()
    expect(provinceFromParam(null)).toBeUndefined()
    expect(provinceBySlug('free-state')?.name).toBe('Free State')
  })
})

describe('free K53 sample questions', () => {
  it('has 30–60 questions across the three test sections', () => {
    expect(SAMPLE_SECTIONS.map(s => s.id)).toEqual(['vehicle-controls', 'road-signs', 'rules-of-the-road'])
    expect(SAMPLE_QUESTION_COUNT).toBeGreaterThanOrEqual(30)
    expect(SAMPLE_QUESTION_COUNT).toBeLessThanOrEqual(60)
  })

  it('every question has three options, a valid answer, a reason and unique source', () => {
    const ids = new Set<number>()
    for (const q of SAMPLE_SECTIONS.flatMap(s => s.questions)) {
      expect(ids.has(q.sourceId), `duplicate ${q.sourceId}`).toBe(false)
      ids.add(q.sourceId)
      expect(Object.keys(q.options).sort()).toEqual(['A', 'B', 'C'])
      expect(q.options[q.answer]).toBeTruthy()
      expect(q.reason.length).toBeGreaterThan(10)
      if (q.image) expect(q.imageAlt).toBeTruthy()
    }
  })

  it('only references images that exist in /public', () => {
    const paths = SAMPLE_SECTIONS.flatMap(s => [s.diagram?.src, ...s.questions.map(q => q.image)]).filter(Boolean) as string[]
    for (const p of paths) expect(existsSync(join(process.cwd(), 'public', p)), p).toBe(true)
  })

  it('builds an FAQPage with one entry per question', () => {
    const faq = questionsFaqSchema('https://www.skdriving.co.za/k53-questions-and-answers')
    expect(faq['@type']).toBe('FAQPage')
    expect(faq.mainEntity).toHaveLength(SAMPLE_QUESTION_COUNT)
  })
})

describe('site helpers', () => {
  it('builds canonical www URLs', () => {
    expect(absoluteUrl('/')).toBe('https://www.skdriving.co.za')
    expect(absoluteUrl('/centers/gauteng')).toBe('https://www.skdriving.co.za/centers/gauteng')
  })

  it('escapes < in JSON-LD', () => {
    expect(jsonLd({ a: '</script>' })).not.toContain('</script>')
    expect(breadcrumbSchema([{ name: 'Home', path: '/' }]).itemListElement[0].item).toBe('https://www.skdriving.co.za')
  })
})

describe("learner's licence guides", () => {
  it('has six unique paths with titles ≤60 and descriptions ≤155 characters', () => {
    expect(GUIDE_LIST).toHaveLength(6)
    expect(new Set(GUIDE_LIST.map(g => g.path)).size).toBe(6)
    for (const g of GUIDE_LIST) {
      expect(g.title.length, g.title).toBeLessThanOrEqual(60)
      expect(g.description.length, g.description).toBeLessThanOrEqual(155)
      expect(g.path.startsWith('/')).toBe(true)
    }
  })

  it('gives each guide a self-referencing canonical and an absolute title', () => {
    for (const g of GUIDE_LIST) {
      const meta = guideMetadata(g)
      expect(meta.alternates?.canonical).toBe(absoluteUrl(g.path))
      expect(meta.title).toEqual({ absolute: g.title })
    }
  })

  it('only cites https or official http sources', () => {
    for (const s of Object.values(SOURCES)) expect(s.url).toMatch(/^https?:\/\//)
  })

  it('builds an FAQPage whose answers are the given text', () => {
    const faq = faqPageSchema([{ question: 'Q?', answer: 'A.' }], absoluteUrl('/x'))
    expect(faq.mainEntity[0].acceptedAnswer.text).toBe('A.')
  })

  it('appends page FAQs to the questions FAQPage', () => {
    const faq = questionsFaqSchema('https://www.skdriving.co.za/k53-questions-and-answers', [{ question: 'Q?', answer: 'A.' }])
    expect(faq.mainEntity).toHaveLength(SAMPLE_QUESTION_COUNT + 1)
  })
})

import type { Metadata } from 'next'
import Link from 'next/link'
import { cache } from 'react'
import { notFound } from 'next/navigation'
import { isTrialCourse } from '@/lib/trial'
import { EACH_ONCE_REGISTER_URL } from '@/lib/contact'
import { publicSelect } from '@/lib/supabase-public'
import { QUESTIONS_PATH } from '@/lib/k53-sample-questions'
import { absoluteUrl, breadcrumbSchema, canonical, jsonLd } from '@/lib/site'
import type { Course } from '@/lib/types'

// Course data is public and changes rarely: static HTML, regenerated hourly (ISR).
// Pages are built on first request (no generateStaticParams), so the build
// never needs Supabase for them.
export const revalidate = 3600

interface Props {
  params: { id: string }
}

// No paths at build time; each course page is rendered on its first request
// and then cached (ISR). An empty list is what opts the route into caching.
export function generateStaticParams(): { id: string }[] {
  return []
}

/** Course row + question count per test. Deduplicated between metadata and page. */
const loadCourse = cache(async (id: string) => {
  if (!/^\d+$/.test(id)) return null
  const [courses, qMeta] = await Promise.all([
    publicSelect<Course>('courses', `select=*&id=eq.${id}`, { revalidate }),
    publicSelect<{ test_number: number }>('quiz_questions', `select=test_number&course_id=eq.${id}`, { revalidate }),
  ])
  const course = courses?.[0]
  if (!course) return null
  const countByTest: Record<number, number> = {}
  for (const q of qMeta ?? []) {
    countByTest[q.test_number] = (countByTest[q.test_number] ?? 0) + 1
  }
  return { course, countByTest }
})

/** "code8" → "Code 8"; anything else falls back to the course title. */
function codeLabel(c: Course): string | null {
  const m = /^code\s*(\d+)$/i.exec(c.code ?? '')
  return m ? `Code ${m[1]}` : null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await loadCourse(params.id)
  if (!data) return { title: 'Course not found', robots: { index: false, follow: true } }
  const { course: c, countByTest } = data
  const tests = Object.values(countByTest).filter(n => n > 0).length
  const label = codeLabel(c)
  const title = label
    ? `${label} K53 Practice Tests${tests ? ` (${tests} Timed Test${tests === 1 ? '' : 's'})` : ''}`
    : `${c.title} — K53 Practice Test`
  const fallback = label
    ? `${label} K53 learner's licence practice tests in the real test format: road signs, rules of the road and vehicle controls. Start with a free sample.`
    : `${c.title}: a timed K53 learner's licence practice test covering road signs, rules of the road and vehicle controls.`
  const raw = (c.description ?? '').trim()
  const description = raw.length >= 70 && raw.length <= 155 ? raw : fallback.length <= 155 ? fallback : `${fallback.slice(0, 152).trimEnd()}…`
  const path = `/courses/${c.id}`
  return {
    title,
    description,
    alternates: canonical(path),
    openGraph: { title, description, url: path, type: 'website' },
  }
}

export default async function CoursePage({ params }: Props) {
  const data = await loadCourse(params.id)
  if (!data) notFound()
  const { course: c, countByTest } = data

  const tests = (c.code === 'final-k53' ? [
    {
      number:    1,
      count:     countByTest[1] ?? 0,
      label:     'Test A + Test B + Test C',
      passInfo:  'one combined score',
      href:      `/quiz/${c.id}?test=1`,
      badge:     'Final Test',
    },
  ] : [
    {
      number:    1,
      count:     countByTest[1] ?? 0,
      label:     'Road Signs & Controls',
      passInfo:  '75% to pass',
      href:      `/quiz/${c.id}?test=1`,
    },
    {
      number:    2,
      count:     countByTest[2] ?? 0,
      label:     'Rules of Road + Road Signs',
      passInfo:  '22/30 rules · 22/30 signs',
      href:      `/quiz/${c.id}?test=2`,
      badge:     'K53 Format',
    },
    {
      number:    3,
      count:     countByTest[3] ?? 0,
      label:     'Rules of Road + Road Signs',
      passInfo:  '75% to pass',
      href:      `/quiz/${c.id}?test=3`,
      badge:     'K53 Format',
    },
  ]).filter(t => t.count > 0)

  const courseSchema = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: c.title,
    description: c.description ?? undefined,
    url: absoluteUrl(`/courses/${c.id}`),
    provider: { '@id': `${absoluteUrl('/')}/#organization`, '@type': 'Organization', name: 'SK Driving', url: absoluteUrl('/') },
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(courseSchema) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Courses', path: '/courses' },
          { name: c.title, path: `/courses/${c.id}` },
        ])) }}
      />
      <Link href="/courses" className="text-blue-600 hover:underline text-sm font-medium mb-8 inline-block">
        ← Back to Practice Tests
      </Link>

      {/* Course header */}
      <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm mb-8">
        <div className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">{c.code}</div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-3">{c.title}</h1>
        <p className="text-gray-500 leading-relaxed">{c.description}</p>
      </div>

      {/* Tests */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <h2 className="font-bold text-lg text-gray-900 mb-4">Available Tests</h2>
        {isTrialCourse(c.code) ? (
          <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900">
            <strong>Each Once Special:</strong> registered learners get every test below free: 10 minutes on the
            first attempt and 2 minutes on the second, then a combined score.{' '}
            <Link href={EACH_ONCE_REGISTER_URL} className="font-bold underline">Register free</Link> or{' '}
            <Link href={`/login?next=/courses/${c.id}`} className="font-bold underline">log in</Link>.
            Not registered? Any test opens as a 2-minute sample.
          </div>
        ) : (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <strong>Not subscribed?</strong> Open any test for a free 2-minute sample. Your countdown starts at 2:00.
          </div>
        )}

        <div className="space-y-3">
          {tests.map(t => (
            <Link
              key={t.number}
              href={t.href}
              className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900 group-hover:text-blue-700">
                    Test {t.number}
                  </span>
                  {t.badge && (
                    <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                      {t.badge}
                    </span>
                  )}
                </div>
                <div className="text-gray-400 text-sm mt-0.5">
                  {t.count} questions · {t.label} · {t.passInfo}
                </div>
              </div>
              <div className="bg-blue-600 text-white text-sm font-bold px-4 py-2 rounded-lg group-hover:bg-blue-700 transition-colors shrink-0">
                Start →
              </div>
            </Link>
          ))}
        </div>
      </div>

      <p className="mt-6 text-sm text-gray-600 text-center">
        Want to warm up first? Try our free{' '}
        <Link href={QUESTIONS_PATH} className="text-blue-600 font-semibold hover:underline">K53 questions and answers</Link>.
      </p>
    </main>
  )
}

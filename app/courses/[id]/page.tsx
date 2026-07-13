import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Course } from '@/lib/types'

// Course data is public and changes rarely — cache for 1 hour, revalidate in background.
export const revalidate = 3600

interface Props {
  params: { id: string }
}

export default async function CoursePage({ params }: Props) {
  const { data: course, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !course) notFound()

  // Single query — count by test_number client-side (avoids head:true edge case on Vercel)
  const { data: qMeta } = await supabase
    .from('quiz_questions')
    .select('test_number')
    .eq('course_id', params.id)

  const countByTest: Record<number, number> = {}
  for (const q of qMeta ?? []) {
    countByTest[q.test_number] = (countByTest[q.test_number] ?? 0) + 1
  }

  const c = course as Course

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

  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
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
    </main>
  )
}

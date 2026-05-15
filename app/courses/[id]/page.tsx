import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Course } from '@/lib/types'

// Re-build at most once per day; new courses appear within 24h
export const revalidate = 86400

interface Props {
  params: { id: string }
}

// Pre-build a static page for every course at deploy time
export async function generateStaticParams() {
  const { data } = await supabase
    .from('courses')
    .select('id')
    .not('code', 'is', null)

  return (data ?? []).map(c => ({ id: String(c.id) }))
}

export default async function CoursePage({ params }: Props) {
  const { data: course, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !course) notFound()

  const { count } = await supabase
    .from('quiz_questions')
    .select('*', { count: 'exact', head: true })
    .eq('course_id', params.id)
    .eq('test_number', 1)

  const c = course as Course

  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <Link href="/courses" className="text-blue-600 hover:underline text-sm font-medium mb-8 inline-block">
        ← Back to Courses
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

        <Link
          href={`/quiz/${c.id}`}
          className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
        >
          <div>
            <div className="font-semibold text-gray-900 group-hover:text-blue-700">Test 1</div>
            <div className="text-gray-400 text-sm mt-0.5">
              {count ?? 0} questions · 75% to pass
            </div>
          </div>
          <div className="bg-blue-600 text-white text-sm font-bold px-4 py-2 rounded-lg group-hover:bg-blue-700 transition-colors">
            Start →
          </div>
        </Link>
      </div>
    </main>
  )
}

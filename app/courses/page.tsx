import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { hasFullAccess } from '@/lib/access'
import LiveSessionCard from '@/components/LiveSessionCard'
import type { Course } from '@/lib/types'

// Reads access (cookies) to show paid members the live-session link.
export const dynamic = 'force-dynamic'

export default async function CoursesPage() {
  const [{ data: courses, error }, fullAccess] = await Promise.all([
    supabase.from('courses').select('*').not('code', 'is', null).order('id'),
    hasFullAccess(),
  ])

  if (error) {
    return (
      <main className="max-w-4xl mx-auto px-6 py-12">
        <p className="text-red-500">Error loading courses: {error.message}</p>
      </main>
    )
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-2 text-gray-900">Practice Tests</h1>
      <p className="text-gray-500 mb-6">Choose a licence type to start practising</p>

      {/* Session notice */}
      <div className="mb-8 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
        <p className="text-sm font-bold text-amber-800 mb-1">⚠️ Session notice</p>
        <p className="text-sm text-amber-700 leading-relaxed">
          We apologise — live sessions will <strong>not be available this Wednesday and Thursday</strong>.
          Sessions will resume on <strong>Monday</strong>. We&apos;re sorry for the inconvenience.
          In the meantime, you can catch up on the recording videos below — more recordings will be uploaded soon.
        </p>
        <a
          href="/videos"
          className="inline-block mt-3 text-xs font-bold text-amber-800 underline hover:text-amber-900"
        >
          Watch session recordings →
        </a>
      </div>

      {fullAccess && <LiveSessionCard className="mb-8" />}

      {courses && courses.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2">
          {(courses as Course[]).map(course => (
            <Link
              key={course.id}
              href={`/courses/${course.id}`}
              className="block bg-white rounded-2xl p-7 border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all group"
            >
              <div className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">
                {course.code}
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">
                {course.title}
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-5">{course.description}</p>
              <span className="text-blue-600 font-semibold text-sm group-hover:underline">
                View tests →
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-gray-400">No courses found.</p>
      )}
    </main>
  )
}

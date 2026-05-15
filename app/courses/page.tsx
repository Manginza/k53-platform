import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { Course } from '@/lib/types'

export const revalidate = 3600 // re-fetch at most once per hour

export default async function CoursesPage() {
  const { data: courses, error } = await supabase
    .from('courses')
    .select('*')
    .not('code', 'is', null)
    .order('id')

  if (error) {
    return (
      <main className="max-w-4xl mx-auto px-6 py-12">
        <p className="text-red-500">Error loading courses: {error.message}</p>
      </main>
    )
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-2 text-gray-900">Courses</h1>
      <p className="text-gray-500 mb-10">Choose a licence type to start practising</p>

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

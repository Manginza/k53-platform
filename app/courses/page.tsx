import type { Metadata } from 'next'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { hasFullAccess } from '@/lib/access'
import LiveSessionCard from '@/components/LiveSessionCard'
import type { Course } from '@/lib/types'

export const metadata: Metadata = {
  title: "Online K53 Learners Course — Code 8 & Code 10 Practice Tests",
  description: "South Africa's best online learners licence course. Structured K53 practice tests for Code 8 and Code 10 — road signs, rules of the road, vehicle controls. Pass your learners test first time.",
  keywords: [
    "a learners course", "online learners licence course", "K53 learners course South Africa",
    "learners licence practice test", "K53 practice test", "Code 8 learners test",
    "Code 10 learners test", "K53 road signs questions", "learners licence study online",
    "free learners course South Africa", "learners licence mock test",
  ],
  alternates: { canonical: 'https://www.skdriving.co.za/courses' },
  openGraph: {
    title: "Online K53 Learners Course — Code 8 & Code 10 | SK Driving",
    description: "The best online K53 learners licence course in South Africa. Practice road signs, rules of the road and vehicle controls for Code 8 and Code 10.",
    url: 'https://www.skdriving.co.za/courses',
  },
}

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

  const courseSchema = courses && courses.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: "SK Driving K53 learner's licence courses",
    itemListElement: (courses as Course[]).map((course, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Course',
        name: course.title,
        description: course.description,
        url: `https://www.skdriving.co.za/courses/${course.id}`,
        provider: { '@type': 'Organization', name: 'SK Driving', url: 'https://www.skdriving.co.za' },
      },
    })),
  } : null

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      {courseSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }} />}
      <h1 className="text-3xl font-bold mb-2 text-gray-900">Online K53 Learners Course</h1>
      <p className="text-gray-500 mb-4">Choose your licence code below and start practising — you need 75% to pass the official test</p>

      {/* Curriculum overview */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { icon: '📋', title: 'Rules of the Road', desc: '28 questions · pass mark 22' },
          { icon: '🚦', title: 'Road Signs & Markings', desc: '28 questions · pass mark 23' },
          { icon: '🚗', title: 'Vehicle Controls', desc: '8 questions · pass mark 6' },
        ].map(({ icon, title, desc }) => (
          <div key={title} className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-center">
            <div className="text-2xl mb-1">{icon}</div>
            <p className="text-xs font-bold text-blue-900 leading-tight">{title}</p>
            <p className="text-xs text-blue-600 mt-0.5">{desc}</p>
          </div>
        ))}
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

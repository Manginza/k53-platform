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
    <main>
      {courseSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }} />}

      {/* Page header */}
      <section className="bg-gradient-to-br from-brand-800 to-brand-700 text-white py-12 sm:py-16">
        <div className="section-container text-center">
          <span className="inline-block text-xs font-bold text-accent-400 uppercase tracking-widest mb-3">K53 Practice Tests</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3 tracking-tight">Online K53 Learners Course</h1>
          <p className="text-blue-200 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Choose your licence code and start practising. You need 75%+ in each section to pass the official test.
          </p>
        </div>
      </section>

      <section className="section-container py-10 sm:py-14">

        {/* Curriculum overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[
            {
              color: 'bg-red-50 border-red-100 text-red-700',
              badge: 'bg-red-100 text-red-700',
              title: 'Road Signs & Markings',
              desc: '28 questions — pass mark 23',
            },
            {
              color: 'bg-blue-50 border-blue-100 text-blue-700',
              badge: 'bg-blue-100 text-blue-700',
              title: 'Rules of the Road',
              desc: '28 questions — pass mark 22',
            },
            {
              color: 'bg-emerald-50 border-emerald-100 text-emerald-700',
              badge: 'bg-emerald-100 text-emerald-700',
              title: 'Vehicle Controls',
              desc: '8 questions — pass mark 6',
            },
          ].map(({ color, badge, title, desc }) => (
            <div key={title} className={`border rounded-2xl p-5 ${color}`}>
              <p className={`inline-block text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full mb-2 ${badge}`}>Section</p>
              <p className="font-bold text-sm leading-snug">{title}</p>
              <p className="text-xs mt-1 opacity-75">{desc}</p>
            </div>
          ))}
        </div>

        {fullAccess && <LiveSessionCard className="mb-10" />}

        {courses && courses.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2">
            {(courses as Course[]).map(course => (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                className="card-elevated p-7 group flex flex-col"
              >
                <span className="inline-block text-xs font-bold text-brand-600 uppercase tracking-widest bg-brand-50 px-2.5 py-1 rounded-full mb-4 w-max">
                  {course.code}
                </span>
                <h2 className="text-xl font-extrabold text-gray-900 mb-2 group-hover:text-brand-700 transition-colors leading-snug">
                  {course.title}
                </h2>
                <p className="text-gray-500 text-sm leading-relaxed flex-1 mb-5">{course.description}</p>
                <span className="inline-flex items-center gap-1.5 text-brand-600 font-bold text-sm">
                  View tests
                  <svg viewBox="0 0 20 20" className="w-4 h-4 fill-current group-hover:translate-x-0.5 transition-transform" aria-hidden="true"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-12">No courses found.</p>
        )}
      </section>
    </main>
  )
}

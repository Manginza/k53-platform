import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About Us',
  description: "Learn about the SK Driving K53 Learner's Licence platform — our mission to make passing the South African learner's test simple, affordable and accessible.",
  alternates: { canonical: 'https://www.skdriving.co.za/about' },
}

export default function AboutPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-16 sm:px-6 sm:py-24">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">About Us</h1>

      <div className="prose prose-blue max-w-none text-gray-600">
        <p className="mb-4">
          Welcome to the K53 Learner&apos;s Licence Platform! Our mission is to provide the
          most accessible, comprehensive, and easy-to-use study materials for the South
          African K53 Learner&apos;s Licence test.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Our Vision</h2>
        <p className="mb-4">
          We believe that learning the rules of the road should be an engaging and
          straightforward experience. By combining high-quality study notes with interactive
          quizzes, we ensure our users are fully prepared to pass their tests on the first try.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Why Choose Us?</h2>
        <ul className="list-disc pl-5 mb-4 space-y-2">
          <li>Comprehensive Coverage: From road signs to vehicle controls, we cover everything.</li>
          <li>Interactive Quizzes: Test your knowledge with our timed, exam-style questions.</li>
          <li>Accessible Anywhere: Study on your phone, tablet, or computer.</li>
        </ul>

        <p className="mb-4 text-sm text-gray-500">
          Start with our{' '}
          <Link href="/k53-learners-study-guide" className="text-blue-700 font-semibold hover:underline">
            free K53 learner&apos;s licence study guide
          </Link>{' '}
          for the test structure, pass marks, licence categories and booking checklist.
        </p>
      </div>
    </main>
  )
}

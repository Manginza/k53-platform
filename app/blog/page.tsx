import type { Metadata } from 'next'
import Link from 'next/link'
import { BLOG_POSTS, BASE_URL } from '@/lib/blog'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'Learners Licence Blog & Study Tips',
  description:
    "SK Driving's blog: learners licence study materials, K53 preparation tips and guidance on passing South Africa's computerised learners licence test.",
  alternates: { canonical: `${BASE_URL}/blog` },
  openGraph: {
    type: 'website',
    url: `${BASE_URL}/blog`,
    title: 'Learners Licence Blog & Study Tips | SK Driving',
    description:
      "Learners licence study materials, K53 preparation tips and guidance on passing South Africa's computerised learners licence test.",
  },
}

export default function BlogIndexPage() {
  const posts = [...BLOG_POSTS].sort((a, b) => b.datePublished.localeCompare(a.datePublished))

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">SK Driving Blog</h1>
        <p className="mt-3 text-gray-700 leading-relaxed">
          These articles are free to read. No account is required. They explain the South African learner&apos;s
          licence test in the same terms as the official pass marks: 28 rules questions (you need 22), 28 road-sign
          questions (you need 23) and 8 vehicle-controls questions (you need 6). A total that looks like a pass can
          still fail if one of those three sections is short.
        </p>
        <p className="mt-3 text-gray-700 leading-relaxed">
          Start with the <Link href="/k53-learners-study-guide" className="font-semibold text-brand-700 hover:underline">K53 study guide</Link> if
          you want the map, then the article on{' '}
          <Link href="/blog/how-to-study-for-the-k53-learners-test-in-two-weeks" className="font-semibold text-brand-700 hover:underline">how to study in two weeks</Link>.
          The sign, rules and controls articles each stay on one section, with the numbers the test uses and a worked
          example where a mixed-up sign or a wrong pedal would cost the mark. When you are ready to try questions,
          use the <Link href="/k53-questions-and-answers" className="font-semibold text-brand-700 hover:underline">free questions and answers</Link> and
          the <Link href="/courses" className="font-semibold text-brand-700 hover:underline">practice tests</Link>.
        </p>
        <p className="mt-3 text-gray-700 leading-relaxed">
          Booking and test day depend on your province. Gauteng residents use the official NaTIS portal. Other
          provinces should phone the centre, because online booking is not available everywhere. The articles on
          codes, documents and what happens after you pass link to the{' '}
          <Link href="/centers" className="font-semibold text-brand-700 hover:underline">testing-centre finder</Link> and
          to the longer guides on <Link href="/how-to-book-a-learners-licence-test" className="font-semibold text-brand-700 hover:underline">how to book</Link>,{' '}
          <Link href="/learners-licence-cost" className="font-semibold text-brand-700 hover:underline">fees</Link>,{' '}
          <Link href="/learners-licence-requirements" className="font-semibold text-brand-700 hover:underline">documents</Link> and{' '}
          <Link href="/learners-licence-validity" className="font-semibold text-brand-700 hover:underline">the 24-month limit</Link>.
          None of the articles quotes a national pass rate or a single national fee, because those are not figures we
          can stand behind.
        </p>
      </header>

      <div className="space-y-6">
        {posts.map(post => {
          const published = new Date(post.datePublished).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })
          return (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="card-elevated block overflow-hidden sm:flex">
              <div className="sm:w-56 shrink-0 bg-brand-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={post.imageSvg} alt={post.imageAlt} width={1200} height={630} className="h-40 w-full object-cover sm:h-full" />
              </div>
              <div className="p-5">
                <p className="text-xs font-semibold text-brand-600">{published} · {post.readMinutes} min read</p>
                <h2 className="mt-1 text-lg font-extrabold text-gray-900 leading-snug">{post.title}</h2>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{post.excerpt}</p>
                <span className="mt-3 inline-block text-sm font-bold text-brand-700">Read article →</span>
              </div>
            </Link>
          )
        })}
      </div>
    </main>
  )
}

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
        <p className="mt-2 text-gray-600">
          Learners licence study materials, K53 tips and guidance for South Africa&apos;s computerised test.
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

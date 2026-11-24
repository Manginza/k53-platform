import Link from 'next/link'
import type { BlogPost } from '@/lib/blog'

/** FAQ shared by the rendered section and the FAQPage JSON-LD on the route. */
export type FaqItem = { q: string; a: string }

const linkClass = 'text-brand-600 font-semibold underline underline-offset-2 hover:text-brand-700'

export function A({ href, children }: { href: string; children: React.ReactNode }) {
  if (href.startsWith('http')) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
        {children}
      </a>
    )
  }
  return <Link href={href} className={linkClass}>{children}</Link>
}

export function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="text-2xl font-extrabold text-gray-900 pt-4">{children}</h2>
}

const DEFAULT_RELATED: { href: string; title: string; text: string }[] = [
  { href: '/k53-learners-study-guide', title: 'K53 study guide', text: 'What each section covers' },
  { href: '/k53-questions-and-answers', title: 'Free questions and answers', text: 'Practice with a reason for each answer' },
  { href: '/courses', title: 'Practice tests', text: 'Timed tests for Code 8 and Code 10' },
  { href: '/centers', title: 'Find a testing centre', text: 'DLTCs across South Africa' },
]

export default function BlogArticle({
  post,
  faqs,
  related = DEFAULT_RELATED,
  children,
}: {
  post: BlogPost
  faqs: FaqItem[]
  related?: { href: string; title: string; text: string }[]
  children: React.ReactNode
}) {
  const published = new Date(post.datePublished).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <article className="bg-white">
      <header className="bg-gradient-to-br from-brand-700 to-brand-900 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <nav aria-label="Breadcrumb" className="text-xs font-semibold text-brand-200 mb-4">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="mx-1.5" aria-hidden="true">/</span>
            <Link href="/blog" className="hover:text-white">Blog</Link>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight">{post.title}</h1>
          <p className="mt-3 text-sm text-brand-100">
            SK Driving · {published} · {post.readMinutes} min read
          </p>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <figure className="mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.imageSvg}
            alt={post.imageAlt}
            width={1200}
            height={630}
            className="w-full rounded-2xl border border-gray-100 shadow-card"
          />
        </figure>

        <div className="space-y-5 text-[17px] leading-relaxed text-gray-700">
          {children}

          {faqs.length > 0 && (
            <>
              <H2>Frequently asked questions</H2>
              <div className="divide-y divide-gray-100 rounded-2xl border border-gray-100">
                {faqs.map(({ q, a }) => (
                  <details key={q} className="group px-5 py-4">
                    <summary className="cursor-pointer list-none font-bold text-gray-900 flex items-center justify-between gap-3">
                      {q}
                      <span aria-hidden="true" className="text-brand-500 group-open:rotate-180 transition-transform">▾</span>
                    </summary>
                    <p className="mt-2 text-[15px] text-gray-600 leading-relaxed">{a}</p>
                  </details>
                ))}
              </div>
            </>
          )}

          <div className="rounded-xl border-2 border-brand-200 bg-brand-50 px-5 py-5 text-center my-6">
            <p className="font-bold text-brand-900">Ready to practise? Try the free questions, then a timed test.</p>
            <Link href="/courses" className="btn-primary inline-flex items-center justify-center mt-3 px-6 py-3 text-sm">
              Start free practice tests
            </Link>
          </div>

          <H2>Keep preparing</H2>
          <div className="grid gap-3 sm:grid-cols-2">
            {related.map(item => (
              <Link key={item.href} href={item.href} className="card-elevated block px-5 py-4">
                <span className="block font-bold text-gray-900">{item.title}</span>
                <span className="block text-sm text-gray-500 mt-0.5">{item.text}</span>
              </Link>
            ))}
          </div>

          <p className="text-xs text-gray-400 pt-4">
            SK Driving practice questions are a study aid. They are not the official examination questions. Where a fee
            or a local rule differs, confirm it with your driving licence testing centre or on the official NaTIS portal.
          </p>
        </div>
      </div>
    </article>
  )
}

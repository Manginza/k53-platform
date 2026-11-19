/**
 * GuidePage — shared layout for the learner's licence guides (lib/guides.ts).
 *
 * Server-rendered and static. Renders the breadcrumb, a single H1, the short
 * direct answer and practice CTAs above the fold, the page body, the FAQ
 * (same text as the FAQPage JSON-LD), related guides and an official-sources
 * box.
 */
import Link from 'next/link'
import { ACCESS_PRICE } from '@/lib/contact'
import { FULL_TEST_URL, QUESTIONS_PATH } from '@/lib/k53-sample-questions'
import {
  GUIDES, GUIDES_REVIEWED_LABEL, SOURCES,
  faqPageSchema, guideArticleSchema,
  type Faq, type GuideId, type SourceId,
} from '@/lib/guides'
import { absoluteUrl, breadcrumbSchema, jsonLd } from '@/lib/site'

export function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-700 underline decoration-brand-200 underline-offset-2 hover:decoration-brand-700">
      {children}
    </a>
  )
}

export function SourceLink({ id, children }: { id: SourceId; children?: React.ReactNode }) {
  return <ExternalLink href={SOURCES[id].url}>{children ?? SOURCES[id].name}</ExternalLink>
}

export function GuideLink({ id, children }: { id: GuideId; children?: React.ReactNode }) {
  return (
    <Link href={GUIDES[id].path} className="font-semibold text-brand-700 underline decoration-brand-200 underline-offset-2 hover:decoration-brand-700">
      {children ?? GUIDES[id].label}
    </Link>
  )
}

export function InternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="font-semibold text-brand-700 underline decoration-brand-200 underline-offset-2 hover:decoration-brand-700">
      {children}
    </Link>
  )
}

export function GuideSection({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="mt-12 scroll-mt-24 first:mt-0">
      <h2 id={`${id}-heading`} className="text-2xl font-extrabold tracking-tight text-gray-900">{title}</h2>
      <div className="mt-4 space-y-4 leading-7 text-gray-700">{children}</div>
    </section>
  )
}

export function Callout({ tone = 'note', children }: { tone?: 'note' | 'warn'; children: React.ReactNode }) {
  const styles = tone === 'warn'
    ? 'border-amber-400 bg-amber-50 text-amber-950'
    : 'border-brand-400 bg-brand-50 text-brand-950'
  return <div className={`rounded-xl border-l-4 p-4 text-sm leading-6 ${styles}`}>{children}</div>
}

export function PracticeCta({ heading, body }: { heading: string; body: string }) {
  return (
    <aside className="my-10 flex flex-col gap-4 rounded-2xl border border-green-200 bg-green-50 p-5 sm:flex-row sm:items-center">
      <div className="flex-1">
        <p className="font-bold text-green-900">{heading}</p>
        <p className="mt-1 text-sm leading-6 text-green-800">{body}</p>
      </div>
      <div className="flex shrink-0 flex-col gap-2 sm:items-end">
        <Link href={QUESTIONS_PATH} className="rounded-full bg-green-600 px-5 py-2.5 text-center text-sm font-bold text-white hover:bg-green-700">
          Free K53 questions
        </Link>
        <Link href={FULL_TEST_URL} className="text-center text-sm font-semibold text-green-800 hover:underline">
          Try a timed practice test →
        </Link>
      </div>
    </aside>
  )
}

export default function GuidePage({
  id,
  eyebrow,
  answer,
  faqs,
  sources,
  related,
  closingCta,
  children,
}: {
  id: GuideId
  eyebrow: string
  /** The short, direct answer shown under the H1. */
  answer: React.ReactNode
  faqs: Faq[]
  sources: SourceId[]
  related: GuideId[]
  closingCta: { heading: string; body: string }
  children: React.ReactNode
}) {
  const guide = GUIDES[id]
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: guide.label, path: guide.path },
  ]

  return (
    <main className="bg-white text-gray-800">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema(crumbs)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(guideArticleSchema(guide)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqPageSchema(faqs, absoluteUrl(guide.path))) }} />

      <header className="bg-gradient-to-br from-brand-800 to-brand-700 px-4 py-12 text-white sm:px-6 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-blue-100">
            <Link href="/" className="hover:text-white hover:underline">Home</Link>
            <span aria-hidden="true" className="mx-2">/</span>
            <span aria-current="page">{guide.label}</span>
          </nav>
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-accent-400">{eyebrow}</p>
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">{guide.h1}</h1>
          <div className="mt-5 space-y-3 text-base leading-relaxed text-blue-50 sm:text-lg">{answer}</div>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link href={QUESTIONS_PATH} className="rounded-full bg-accent-400 px-6 py-3 text-center text-sm font-bold text-brand-950 hover:bg-yellow-300">
              Practise free K53 questions
            </Link>
            <Link href={FULL_TEST_URL} className="rounded-full border-2 border-blue-300 px-6 py-3 text-center text-sm font-bold hover:bg-brand-600">
              Take a free timed test
            </Link>
          </div>
          <p className="mt-6 text-xs text-blue-200">
            Reviewed {GUIDES_REVIEWED_LABEL}. Fees and local rules can change — confirm with your DLTC.
            SK Driving is a private study platform, not a government service.
          </p>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-14">
        {children}

        <PracticeCta heading={closingCta.heading} body={closingCta.body} />

        <section id="faq" aria-labelledby="faq-heading" className="mt-12 scroll-mt-24">
          <h2 id="faq-heading" className="text-2xl font-extrabold tracking-tight text-gray-900">Frequently asked questions</h2>
          <dl className="mt-6 space-y-4">
            {faqs.map(({ question, answer: a }) => (
              <div key={question} className="rounded-2xl border border-gray-200 p-5">
                <dt className="font-bold text-gray-900">{question}</dt>
                <dd className="mt-2 leading-7 text-gray-700">{a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="more-guides-heading" className="mt-12 rounded-3xl bg-brand-50 p-6 sm:p-8">
          <h2 id="more-guides-heading" className="text-xl font-extrabold text-gray-900">More learner&apos;s licence guides</h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {related.map(r => (
              <li key={r}>
                <Link href={GUIDES[r].path} className="block h-full rounded-xl bg-white p-4 shadow-sm hover:shadow-card-hover">
                  <span className="block font-bold text-brand-700">{GUIDES[r].label}</span>
                  <span className="mt-1 block text-sm text-gray-600">{GUIDES[r].teaser}</span>
                </Link>
              </li>
            ))}
            <li>
              <Link href="/k53-learners-study-guide" className="block h-full rounded-xl bg-white p-4 shadow-sm hover:shadow-card-hover">
                <span className="block font-bold text-brand-700">Free K53 study guide</span>
                <span className="mt-1 block text-sm text-gray-600">What to study for each section, plus a free PDF summary.</span>
              </Link>
            </li>
          </ul>
          <p className="mt-6 text-sm leading-6 text-gray-700">
            Want every practice test, the road-sign notes and study videos?{' '}
            <InternalLink href="/pricing">Get full SK Driving access for {ACCESS_PRICE}</InternalLink>. This is separate
            from the government test fees you pay at the DLTC.
          </p>
        </section>

        <section aria-labelledby="sources-heading" className="mt-12 border-t border-gray-200 pt-8">
          <h2 id="sources-heading" className="text-lg font-bold text-gray-900">Official sources</h2>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            Checked on {GUIDES_REVIEWED_LABEL}. Municipal pages describe local practice; where a rule is only stated by one
            province or city, this guide says so.
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm">
            {sources.map(s => (
              <li key={s}><SourceLink id={s} /></li>
            ))}
          </ul>
        </section>
      </article>
    </main>
  )
}

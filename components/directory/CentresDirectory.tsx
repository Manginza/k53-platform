/**
 * CentresDirectory — the /centers and /centers/<province> page body.
 *
 * Listings are rendered on the server so they are in the initial HTML.
 * CenterFinder (client) sits on top as progressive enhancement: suburb search
 * and "use my location" sort centres by distance via /api/centers/nearest.
 */
import Link from 'next/link'
import CenterFinder from '@/components/CenterFinder'
import { PROVINCES, mapsUrl, telHref, type Centre, type Province } from '@/lib/directory'
import { absoluteUrl, breadcrumbSchema, jsonLd } from '@/lib/site'

/** How many centres each province shows on the all-provinces page. */
const PREVIEW_PER_PROVINCE = 6

function CentreCard({ c }: { c: Centre }) {
  return (
    <li className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
      <div className="flex items-start gap-2 flex-wrap">
        <h3 className="font-bold text-gray-900 text-sm leading-snug">{c.name}</h3>
        {c.is_smart_hub && (
          <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full uppercase tracking-wide">
            Smart Hub
          </span>
        )}
      </div>
      <p className="text-xs text-gray-600 mt-1">{c.address}</p>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs">
        {c.phone && (
          <a href={telHref(c.phone)} className="text-blue-600 hover:underline">{c.phone}</a>
        )}
        <a
          href={mapsUrl(c.name, `${c.address} ${c.province}`)}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-blue-600 hover:underline"
        >
          Directions ↗
        </a>
      </div>
    </li>
  )
}

function Unavailable() {
  return (
    <p className="text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-xl p-4">
      The centre list is temporarily unavailable. Use the search above to find your nearest centre.
    </p>
  )
}

export default function CentresDirectory({
  province,
  centres,
}: {
  /** Undefined on the all-provinces page. */
  province?: Province
  /** Centres to list (already filtered to `province`); null if unavailable. */
  centres: Centre[] | null
}) {
  const path = province ? `/centers/${province.slug}` : '/centers'
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: "Learner's licence centres", path: '/centers' },
    ...(province ? [{ name: province.name, path }] : []),
  ]

  const listed = centres ?? []
  const schemaRows = province
    ? listed
    : PROVINCES.flatMap(p => listed.filter(c => c.province === p.name).slice(0, PREVIEW_PER_PROVINCE))
  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: province
      ? `Learner's licence testing centres in ${province.name}`
      : "Learner's licence testing centres in South Africa",
    url: absoluteUrl(path),
    numberOfItems: schemaRows.length,
    itemListElement: schemaRows.map((c, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'GovernmentOffice',
          name: c.name,
          ...(c.phone ? { telephone: c.phone } : {}),
          address: {
            '@type': 'PostalAddress',
            streetAddress: c.address,
            addressRegion: c.province,
            addressCountry: 'ZA',
          },
        },
      })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema(crumbs)) }} />
      {listed.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(itemList) }} />
      )}

      <main className="max-w-4xl mx-auto px-4 py-12">
        <nav aria-label="Breadcrumb" className="text-xs text-gray-500 mb-6">
          <Link href="/" className="hover:underline">Home</Link>
          {' / '}
          {province ? (
            <>
              <Link href="/centers" className="hover:underline">Learner&apos;s licence centres</Link>
              {' / '}
              <span className="text-gray-700">{province.name}</span>
            </>
          ) : (
            <span className="text-gray-700">Learner&apos;s licence centres</span>
          )}
        </nav>

        {/* Hero */}
        <div className="text-center mb-10">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
            {province ? province.name : 'All 9 Provinces'}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-2 mb-3 leading-tight">
            {province
              ? `Learner's Licence Centres in ${province.name}`
              : "Find Your Nearest Learner's Licence Writing Centre"}
          </h1>
          <p className="text-gray-500 text-base max-w-xl mx-auto">
            {province
              ? <>All official driving licence testing centres (DLTCs) in {province.name} are listed below. Enter your suburb to sort them by distance.</>
              : <>Enter your suburb, township, or city, or tap <strong>Use my location</strong>, to find the official DLTC closest to you anywhere in South Africa.</>}
          </p>
        </div>

        {/* Search widget (client-side progressive enhancement) */}
        <CenterFinder initialProvince={province?.name ?? ''} />

        {/* Server-rendered listings */}
        <section className="mt-12" aria-labelledby="centre-list-heading">
          {province ? (
            <>
              <h2 id="centre-list-heading" className="text-lg font-bold text-gray-900 mb-4">
                {centres ? `${listed.length} learner's licence centre${listed.length === 1 ? '' : 's'} in ${province.name}` : `Centres in ${province.name}`}
              </h2>
              {!centres ? <Unavailable /> : listed.length === 0 ? (
                <p className="text-sm text-gray-500">
                  We don&apos;t have centres listed for {province.name} yet. Contact your local municipality&apos;s licensing department, or use the search above.
                </p>
              ) : (
                <ul className="grid gap-3 sm:grid-cols-2">
                  {listed.map(c => <CentreCard key={c.id} c={c} />)}
                </ul>
              )}
            </>
          ) : (
            <>
              <h2 id="centre-list-heading" className="text-lg font-bold text-gray-900 mb-4">
                Learner&apos;s licence centres by province
              </h2>
              {!centres ? <Unavailable /> : (
                <div className="space-y-8">
                  {PROVINCES.map(p => {
                    const rows = listed.filter(c => c.province === p.name)
                    if (rows.length === 0) return null
                    return (
                      <div key={p.slug}>
                        <h3 className="font-bold text-gray-800 mb-3">
                          <Link href={`/centers/${p.slug}`} className="hover:text-blue-700 hover:underline">
                            {p.name}
                          </Link>
                          <span className="text-xs font-normal text-gray-400 ml-2">{rows.length} centre{rows.length === 1 ? '' : 's'}</span>
                        </h3>
                        <ul className="grid gap-3 sm:grid-cols-2">
                          {rows.slice(0, PREVIEW_PER_PROVINCE).map(c => <CentreCard key={c.id} c={c} />)}
                        </ul>
                        {rows.length > PREVIEW_PER_PROVINCE && (
                          <Link href={`/centers/${p.slug}`} className="inline-block mt-3 text-sm font-semibold text-blue-600 hover:underline">
                            See all {rows.length} centres in {p.name} →
                          </Link>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </section>

        {/* Province quick-links */}
        <section className="mt-16 border-t border-gray-100 pt-10">
          <h2 className="text-lg font-bold text-gray-800 mb-4 text-center">
            Browse centres by province
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {PROVINCES.map(p => {
              const active = province?.slug === p.slug
              return (
                <Link
                  key={p.slug}
                  href={`/centers/${p.slug}`}
                  aria-current={active ? 'page' : undefined}
                  className={`border rounded-xl p-4 transition-all ${
                    active ? 'bg-blue-700 border-blue-700 text-white shadow' : 'bg-white border-gray-200 hover:border-blue-400 hover:shadow-sm'
                  }`}
                >
                  <p className={`font-semibold text-sm ${active ? 'text-white' : 'text-gray-900'}`}>{p.name}</p>
                  <p className={`text-xs mt-0.5 truncate ${active ? 'text-blue-100' : 'text-gray-400'}`}>{p.centreTowns}</p>
                </Link>
              )
            })}
          </div>
          {province && (
            <div className="text-center mt-4">
              <Link href="/centers" className="text-sm text-blue-600 hover:underline">
                ← Show all provinces
              </Link>
            </div>
          )}
        </section>

        {/* Booking checklist */}
        <section className="mt-12 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">How to book your learner&apos;s writing centre test</h2>
          <ol className="space-y-3">
            {[
              { n: '1', title: 'Book your slot', body: 'Gauteng & Eastern Cape: book online at eNaTIS. All other provinces: visit your nearest DLTC writing centre in person or phone them.' },
              { n: '2', title: 'Confirm within 3 days', body: 'After booking online, you must visit the DLTC within 3 business days to pay the booking fee (approx. R108 in Gauteng, R68 in the Western Cape). Your slot is cancelled if you miss this window.' },
              { n: '3', title: 'What to bring on the day', body: 'Original ID book or Smart ID card + 2 certified copies · 2–4 recent ID-sized photos · Proof of address (max 3 months old) · Completed Form LL1 · Proof of online booking (if applicable).' },
              { n: '4', title: 'Pass the eye test', body: 'A vision screening is done at the DLTC on arrival. You can bring a certificate from a registered optometrist to skip the queue.' },
              { n: '5', title: 'Write your K53 test', body: 'The computerised test has 64 questions across Road Signs (28), Rules of the Road (28), and Vehicle Controls (8). You must pass all three sections.' },
            ].map(({ n, title, body }) => (
              <li key={n} className="flex items-start gap-3">
                <span className="shrink-0 w-7 h-7 rounded-full bg-blue-700 text-white text-xs font-bold flex items-center justify-center">{n}</span>
                <div>
                  <p className="text-sm font-bold text-gray-900">{title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* About writing centres */}
        <section className="mt-6 bg-blue-50 border border-blue-100 rounded-2xl p-6 text-sm text-blue-900">
          <h2 className="font-bold mb-2">About learner&apos;s licence writing centres (DLTCs)</h2>
          <p className="text-blue-800 leading-relaxed">
            South Africa has over 190 official learner&apos;s licence writing centres, known as Driving Licence Testing Centres (DLTCs), regulated under the National Road Traffic Act. Online booking via the{' '}
            <a href="https://online.natis.gov.za/#/auth/identify" target="_blank" rel="noopener noreferrer" className="underline font-semibold">
              eNaTIS portal
            </a>
            {' '}is available in Gauteng (mandatory) and the Eastern Cape. All other provinces use walk-in or phone bookings at the writing centre.
          </p>
        </section>

        {/* Free practice */}
        <section className="mt-6 bg-green-50 border border-green-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1">
            <p className="text-sm font-bold text-green-900">Preparing for your writing centre test?</p>
            <p className="text-xs text-green-700 mt-0.5">
              Try our free{' '}
              <Link href="/k53-questions-and-answers" className="underline font-semibold">K53 practice questions and answers</Link>
              , then take timed practice tests in the same format as the DLTC exam.
            </p>
          </div>
          <Link href="/courses" className="shrink-0 bg-green-600 text-white font-bold px-6 py-3 rounded-full hover:bg-green-700 transition-colors text-sm whitespace-nowrap">
            Start Free Practice Tests →
          </Link>
        </section>

        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-2 text-sm">
            Passed your learner&apos;s? <Link href={province ? `/driving-schools/${province.slug}` : '/driving-schools'} className="text-blue-600 hover:underline font-semibold">
              Find a driving school{province ? ` in ${province.name}` : ''}
            </Link>.
          </p>
        </div>
      </main>
    </>
  )
}

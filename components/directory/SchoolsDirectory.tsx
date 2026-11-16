/**
 * SchoolsDirectory — the /driving-schools and /driving-schools/<province> page body.
 *
 * Listings are rendered on the server so they are in the initial HTML.
 * SchoolFinder (client) adds suburb / location search and the licence-code
 * filter on top, via /api/schools/nearest.
 */
import Link from 'next/link'
import SchoolFinder from '@/components/SchoolFinder'
import { PROVINCES, mapsUrl, telHref, type Province, type School } from '@/lib/directory'
import { absoluteUrl, breadcrumbSchema, jsonLd } from '@/lib/site'

const PREVIEW_PER_PROVINCE = 6

const CODE_COLOURS: Record<string, string> = {
  'Code 8':      'bg-blue-100 text-blue-700',
  'Code 10':     'bg-orange-100 text-orange-700',
  'Code 14':     'bg-red-100 text-red-700',
  'Motorcycles': 'bg-purple-100 text-purple-700',
}

function SchoolCard({ s }: { s: School }) {
  return (
    <li className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
      <div className="flex items-start gap-2 flex-wrap">
        <h3 className="font-bold text-gray-900 text-sm leading-snug">{s.name}</h3>
        {s.is_verified && (
          <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full uppercase tracking-wide">
            Verified
          </span>
        )}
      </div>
      <p className="text-xs text-gray-500 mt-0.5">{s.suburb}, {s.province}</p>
      {s.address && <p className="text-xs text-gray-600 mt-1">{s.address}</p>}
      {s.licence_codes?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {s.licence_codes.map(code => (
            <span key={code} className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${CODE_COLOURS[code] ?? 'bg-gray-100 text-gray-700'}`}>
              {code}
            </span>
          ))}
        </div>
      )}
      {s.hours && <p className="text-xs text-gray-400 mt-1.5">{s.hours}</p>}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs">
        {s.phone && <a href={telHref(s.phone)} className="text-blue-600 hover:underline">{s.phone}</a>}
        <a
          href={mapsUrl(s.name, `${s.suburb} ${s.province}`)}
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
      The school list is temporarily unavailable. Use the search above to find a school near you.
    </p>
  )
}

export default function SchoolsDirectory({
  province,
  schools,
}: {
  province?: Province
  /** Schools to list (already filtered to `province`); null if unavailable. */
  schools: School[] | null
}) {
  const path = province ? `/driving-schools/${province.slug}` : '/driving-schools'
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Driving schools', path: '/driving-schools' },
    ...(province ? [{ name: province.name, path }] : []),
  ]

  const listed = schools ?? []
  const schemaRows = province
    ? listed
    : PROVINCES.flatMap(p => listed.filter(s => s.province === p.name).slice(0, PREVIEW_PER_PROVINCE))
  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: province ? `Driving schools in ${province.name}` : 'Driving schools in South Africa',
    url: absoluteUrl(path),
    numberOfItems: schemaRows.length,
    itemListElement: schemaRows.map((s, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'DrivingSchool',
        name: s.name,
        ...(s.phone ? { telephone: s.phone } : {}),
        address: {
          '@type': 'PostalAddress',
          ...(s.address ? { streetAddress: s.address } : {}),
          addressLocality: s.suburb,
          addressRegion: s.province,
          addressCountry: 'ZA',
        },
      },
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema(crumbs)) }} />
      {schemaRows.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(itemList) }} />
      )}

      <main className="max-w-4xl mx-auto px-4 py-12">
        <nav aria-label="Breadcrumb" className="text-xs text-gray-500 mb-6">
          <Link href="/" className="hover:underline">Home</Link>
          {' / '}
          {province ? (
            <>
              <Link href="/driving-schools" className="hover:underline">Driving schools</Link>
              {' / '}
              <span className="text-gray-700">{province.name}</span>
            </>
          ) : (
            <span className="text-gray-700">Driving schools</span>
          )}
        </nav>

        {/* Hero */}
        <div className="text-center mb-10">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
            {province ? province.name : 'All 9 Provinces'}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-2 mb-3 leading-tight">
            {province ? `Driving Schools in ${province.name}` : 'Find a Driving School Near You'}
          </h1>
          <p className="text-gray-500 text-base max-w-xl mx-auto">
            {province
              ? <>Driving schools in {province.name} are listed below. Filter by licence code or enter your suburb to sort by distance.</>
              : <>Enter your suburb or tap <strong>Use my location</strong> to find a driving school near you. Filter by Code 8, Code 10, or motorcycle training.</>}
          </p>
        </div>

        {/* Search widget (client-side progressive enhancement) */}
        <SchoolFinder initialProvince={province?.name ?? ''} />

        {/* Server-rendered listings */}
        <section className="mt-12" aria-labelledby="school-list-heading">
          {province ? (
            <>
              <h2 id="school-list-heading" className="text-lg font-bold text-gray-900 mb-4">
                {schools ? `${listed.length} driving school${listed.length === 1 ? '' : 's'} in ${province.name}` : `Driving schools in ${province.name}`}
              </h2>
              {!schools ? <Unavailable /> : listed.length === 0 ? (
                <p className="text-sm text-gray-500">
                  We don&apos;t have driving schools listed in {province.name} yet. Try the search above, or check back soon.
                </p>
              ) : (
                <ul className="grid gap-3 sm:grid-cols-2">
                  {listed.map(s => <SchoolCard key={s.id} s={s} />)}
                </ul>
              )}
            </>
          ) : (
            <>
              <h2 id="school-list-heading" className="text-lg font-bold text-gray-900 mb-4">
                Driving schools by province
              </h2>
              {!schools ? <Unavailable /> : (
                <div className="space-y-8">
                  {PROVINCES.map(p => {
                    const rows = listed.filter(s => s.province === p.name)
                    if (rows.length === 0) return null
                    return (
                      <div key={p.slug}>
                        <h3 className="font-bold text-gray-800 mb-3">
                          <Link href={`/driving-schools/${p.slug}`} className="hover:text-blue-700 hover:underline">
                            {p.name}
                          </Link>
                          <span className="text-xs font-normal text-gray-400 ml-2">{rows.length} school{rows.length === 1 ? '' : 's'}</span>
                        </h3>
                        <ul className="grid gap-3 sm:grid-cols-2">
                          {rows.slice(0, PREVIEW_PER_PROVINCE).map(s => <SchoolCard key={s.id} s={s} />)}
                        </ul>
                        {rows.length > PREVIEW_PER_PROVINCE && (
                          <Link href={`/driving-schools/${p.slug}`} className="inline-block mt-3 text-sm font-semibold text-blue-600 hover:underline">
                            See all {rows.length} driving schools in {p.name} →
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
            Browse schools by province
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {PROVINCES.map(p => {
              const active = province?.slug === p.slug
              return (
                <Link
                  key={p.slug}
                  href={`/driving-schools/${p.slug}`}
                  aria-current={active ? 'page' : undefined}
                  className={`border rounded-xl p-4 transition-all ${
                    active ? 'bg-blue-700 border-blue-700 text-white shadow' : 'bg-white border-gray-200 hover:border-blue-400 hover:shadow-sm'
                  }`}
                >
                  <p className={`font-semibold text-sm ${active ? 'text-white' : 'text-gray-900'}`}>{p.name}</p>
                  <p className={`text-xs mt-0.5 truncate ${active ? 'text-blue-100' : 'text-gray-400'}`}>{p.schoolTowns}</p>
                </Link>
              )
            })}
          </div>
          {province && (
            <div className="text-center mt-4">
              <Link href="/driving-schools" className="text-sm text-blue-600 hover:underline">
                ← Show all provinces
              </Link>
            </div>
          )}
        </section>

        {/* Info strip */}
        <section className="mt-12 bg-blue-50 border border-blue-100 rounded-2xl p-6 text-sm text-blue-900">
          <h2 className="font-bold mb-2">Choosing a driving school</h2>
          <ul className="text-blue-800 leading-relaxed space-y-1 list-disc list-inside">
            <li>Confirm the school is registered with the <strong>Department of Transport</strong> and that instructors hold valid PrDP certificates.</li>
            <li>Ask whether the school&apos;s car is dual-controlled and has valid roadworthy and insurance certificates.</li>
            <li>Avoid paying the full package upfront. Pay per lesson until you are satisfied.</li>
            <li><strong>Code 10 (C1)</strong> training is typically R350–R450/hr; a test-day truck hire is R1,200–R1,500 in Gauteng.</li>
            <li>Need to find the nearest test centre? Use our{' '}
              <Link href={province ? `/centers/${province.slug}` : '/centers'} className="underline font-semibold">
                DLTC centre finder{province ? ` for ${province.name}` : ''}
              </Link>.
            </li>
          </ul>
        </section>

        <div className="mt-10 text-center">
          <p className="text-gray-600 mb-4 text-sm">
            Still need your learner&apos;s? Start with our free{' '}
            <Link href="/k53-questions-and-answers" className="text-blue-600 hover:underline font-semibold">K53 questions and answers</Link>.
          </p>
          <Link href="/courses" className="inline-block bg-blue-700 text-white font-bold px-10 py-4 rounded-full hover:bg-blue-800 transition-colors">
            Start K53 Practice Tests →
          </Link>
        </div>
      </main>
    </>
  )
}

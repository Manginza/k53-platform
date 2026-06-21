import type { Metadata } from 'next'
import CenterFinder from '@/components/CenterFinder'
import Link from 'next/link'

// ─── Per-province SEO metadata ────────────────────────────────────────────────
const PROVINCE_META: Record<string, { title: string; description: string; keywords: string[] }> = {
  'Gauteng': {
    title: "Learner's Licence Centres in Gauteng | Joburg, Pretoria & Ekurhuleni DLTCs",
    description: "Find all official learner's licence writing centres (DLTCs) in Gauteng — Johannesburg, Pretoria, Ekurhuleni, Sandton, Soweto, Midrand and more. View addresses, contact numbers and get directions.",
    keywords: ['learners licence centre Johannesburg', 'learners licence Pretoria', 'DLTC Ekurhuleni', 'learners test Soweto', 'learners licence Sandton', 'Gauteng DLTC', 'learners licence centre Midrand', 'learners test Tembisa'],
  },
  'Western Cape': {
    title: "Learner's Licence Centres in Western Cape | Cape Town, Bellville & George DLTCs",
    description: "Find all official learner's licence writing centres in the Western Cape — Cape Town, Bellville, Mitchell's Plain, Khayelitsha, Paarl, George and more. View addresses and get directions.",
    keywords: ["learners licence centre Cape Town", "DLTC Western Cape", "learners test Bellville", "learners licence Mitchell's Plain", "learners licence Khayelitsha", "DLTC George", "learners licence Paarl"],
  },
  'KwaZulu-Natal': {
    title: "Learner's Licence Centres in KwaZulu-Natal | Durban, PMB & Richards Bay DLTCs",
    description: "Find all official learner's licence writing centres in KwaZulu-Natal — Durban, Pietermaritzburg, Richards Bay, Newcastle, Ladysmith and more. View addresses and get directions.",
    keywords: ['learners licence centre Durban', 'DLTC KwaZulu-Natal', 'learners test Pietermaritzburg', 'learners licence Richards Bay', 'learners licence Newcastle', 'KZN DLTC'],
  },
  'Eastern Cape': {
    title: "Learner's Licence Centres in Eastern Cape | Gqeberha, East London & Mthatha DLTCs",
    description: "Find all official learner's licence writing centres in the Eastern Cape — Gqeberha (Port Elizabeth), East London, Mthatha, Makhanda and more. View addresses and get directions.",
    keywords: ['learners licence Gqeberha', 'learners licence Port Elizabeth', 'DLTC East London', 'learners test Mthatha', 'Eastern Cape DLTC', 'learners licence Makhanda'],
  },
  'Mpumalanga': {
    title: "Learner's Licence Centres in Mpumalanga | Nelspruit, Secunda & Witbank DLTCs",
    description: "Find all official learner's licence writing centres in Mpumalanga — Nelspruit/Mbombela, Secunda, Witbank/eMalahleni, Standerton and more. View addresses and get directions.",
    keywords: ['learners licence Nelspruit', 'DLTC Mpumalanga', 'learners test Secunda', 'learners licence Witbank', 'learners licence eMalahleni', 'Mbombela DLTC'],
  },
  'Limpopo': {
    title: "Learner's Licence Centres in Limpopo | Polokwane, Thohoyandou & Mokopane DLTCs",
    description: "Find all official learner's licence writing centres in Limpopo — Polokwane, Thohoyandou, Mokopane, Makhado and more. View addresses and get directions.",
    keywords: ['learners licence Polokwane', 'DLTC Limpopo', 'learners test Thohoyandou', 'learners licence Mokopane', 'learners licence Makhado', 'Limpopo DLTC'],
  },
  'Free State': {
    title: "Learner's Licence Centres in Free State | Bloemfontein, Kroonstad & Harrismith DLTCs",
    description: "Find all official learner's licence writing centres in the Free State — Bloemfontein, Kroonstad, Bethlehem, Harrismith and more. View addresses and get directions.",
    keywords: ['learners licence Bloemfontein', 'DLTC Free State', 'learners test Kroonstad', 'learners licence Bethlehem', 'learners licence Harrismith'],
  },
  'North West': {
    title: "Learner's Licence Centres in North West | Mahikeng, Rustenburg & Zeerust DLTCs",
    description: "Find all official learner's licence writing centres in North West — Mahikeng, Rustenburg, Zeerust, Klerksdorp and more. View addresses and get directions.",
    keywords: ['learners licence Mahikeng', 'DLTC North West', 'learners test Rustenburg', 'learners licence Zeerust', 'Ramotshere Moiloa DLTC', 'Mahikeng DLTC'],
  },
  'Northern Cape': {
    title: "Learner's Licence Centres in Northern Cape | Kimberley, Upington & De Aar DLTCs",
    description: "Find all official learner's licence writing centres in the Northern Cape — Kimberley, Upington, De Aar, Colesburg and more. View addresses and get directions.",
    keywords: ['learners licence Kimberley', 'DLTC Northern Cape', 'learners test Upington', 'learners licence De Aar', 'Northern Cape DLTC'],
  },
}

const DEFAULT_META = {
  title: "Find Your Nearest Learner's Licence Writing Centre (DLTC) | SK Driving",
  description: "Find the closest official learner's licence writing centre (DLTC) near you. View address, contact details, how to book, what to bring, and get directions to testing centres across all 9 provinces.",
  keywords: [
    'learners writing centre', 'a learners writing center', 'learners licence writing centre',
    'learners test centre near me', 'DLTC near me', 'driving licence testing centre',
    'where to write learners licence', 'how to book learners licence test',
    'learners licence centre Cape Town', 'learners test centre Johannesburg',
    'learners licence centre Durban', 'learners licence centre Pretoria',
    "learners licence centre Mitchell's Plain", 'learners licence centre Khayelitsha',
    'learners licence centre Tembisa', 'learners licence centre Midrand',
    'learners licence centre eKurhuleni', 'learners licence centre Emalahleni',
    'learners licence centre Mahikeng', 'learners licence centre Mthatha',
    'learners licence centre Polokwane', 'learners licence centre Nelspruit',
    'nearest DLTC South Africa', 'where to write learners licence test',
  ],
}

export async function generateMetadata(
  { searchParams }: { searchParams: { province?: string } }
): Promise<Metadata> {
  const province = searchParams.province ?? ''
  const meta = PROVINCE_META[province] ?? DEFAULT_META
  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    openGraph: {
      title: meta.title,
      description: meta.description,
      type: 'website',
    },
  }
}

// ─── JSON-LD schema ───────────────────────────────────────────────────────────
const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: "Learner's Licence Writing Centres in South Africa",
  description: 'Official Driving Licence Testing Centres (DLTCs) across South Africa',
  itemListElement: [
    { '@type': 'ListItem', position: 1, item: { '@type': 'GovernmentOffice', name: 'Stock Road DLTC', address: { '@type': 'PostalAddress', streetAddress: 'Stock Road, Bellville', addressLocality: 'Cape Town', addressRegion: 'Western Cape', addressCountry: 'ZA' } } },
    { '@type': 'ListItem', position: 2, item: { '@type': 'GovernmentOffice', name: 'Sandton Testing Station', telephone: '011 321-6372', address: { '@type': 'PostalAddress', streetAddress: 'c/o 8th and 9th Street, Marlboro Gardens', addressLocality: 'Johannesburg', addressRegion: 'Gauteng', addressCountry: 'ZA' } } },
    { '@type': 'ListItem', position: 3, item: { '@type': 'GovernmentOffice', name: 'Pinetown DLTC', telephone: '031 792-6860', address: { '@type': 'PostalAddress', streetAddress: '1 Stockville Road, Tollgate', addressLocality: 'Durban', addressRegion: 'KwaZulu-Natal', addressCountry: 'ZA' } } },
    { '@type': 'ListItem', position: 4, item: { '@type': 'GovernmentOffice', name: 'Centurion Test Ground', telephone: '012 665-2808', address: { '@type': 'PostalAddress', streetAddress: 'Nellmapius Drive, Irene', addressLocality: 'Pretoria', addressRegion: 'Gauteng', addressCountry: 'ZA' } } },
    { '@type': 'ListItem', position: 5, item: { '@type': 'GovernmentOffice', name: 'Diepkloof Testing Station', telephone: '011 933-3975', address: { '@type': 'PostalAddress', streetAddress: '8642 Immik Drive, Funda Park Zone 6', addressLocality: 'Soweto', addressRegion: 'Gauteng', addressCountry: 'ZA' } } },
  ],
}

const PROVINCES = [
  { name: 'Gauteng',       eg: 'Joburg, Pretoria, Ekurhuleni' },
  { name: 'Western Cape',  eg: 'Cape Town, Paarl, George' },
  { name: 'KwaZulu-Natal', eg: 'Durban, PMB, Richards Bay' },
  { name: 'Eastern Cape',  eg: 'Gqeberha, East London, Mthatha' },
  { name: 'Mpumalanga',    eg: 'Nelspruit, Secunda, Witbank' },
  { name: 'Limpopo',       eg: 'Polokwane, Thohoyandou, Mokopane' },
  { name: 'Free State',    eg: 'Bloemfontein, Kroonstad, Harrismith' },
  { name: 'North West',    eg: 'Mahikeng, Rustenburg, Zeerust' },
  { name: 'Northern Cape', eg: 'Kimberley, Upington, De Aar' },
]

export default function CentersPage({
  searchParams,
}: {
  searchParams: { province?: string }
}) {
  const initialProvince = searchParams.province ?? ''
  const validProvince = PROVINCES.find(p => p.name === initialProvince)?.name ?? ''

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />

      <main className="max-w-4xl mx-auto px-4 py-12">

        {/* Hero */}
        <div className="text-center mb-10">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
            {validProvince ? validProvince : 'All 9 Provinces'}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-2 mb-3 leading-tight">
            {validProvince
              ? `Learner's Licence Centres in ${validProvince}`
              : "Find Your Nearest Learner's Licence Writing Centre"}
          </h1>
          <p className="text-gray-500 text-base max-w-xl mx-auto">
            {validProvince
              ? `Showing all official DLTCs in ${validProvince}, sorted by distance from the province centre. Enter your suburb to sort by your exact location.`
              : <>Enter your suburb, township, or city — or tap <strong>Use my location</strong> — to find the official DLTC closest to you anywhere in South Africa.</>}
          </p>
        </div>

        {/* Search widget — receives initialProvince from URL */}
        <CenterFinder initialProvince={validProvince} />

        {/* Province quick-links */}
        <section className="mt-16 border-t border-gray-100 pt-10">
          <h2 className="text-lg font-bold text-gray-800 mb-4 text-center">
            Browse centres by province
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {PROVINCES.map(p => (
              <Link
                key={p.name}
                href={`/centers?province=${encodeURIComponent(p.name)}`}
                className={`border rounded-xl p-4 transition-all ${
                  validProvince === p.name
                    ? 'bg-blue-700 border-blue-700 text-white shadow'
                    : 'bg-white border-gray-200 hover:border-blue-400 hover:shadow-sm'
                }`}
              >
                <p className={`font-semibold text-sm ${validProvince === p.name ? 'text-white' : 'text-gray-900'}`}>{p.name}</p>
                <p className={`text-xs mt-0.5 truncate ${validProvince === p.name ? 'text-blue-100' : 'text-gray-400'}`}>{p.eg}</p>
              </Link>
            ))}
          </div>
          {validProvince && (
            <div className="text-center mt-4">
              <Link href="/centers" className="text-sm text-blue-600 hover:underline">
                ← Show all provinces
              </Link>
            </div>
          )}
        </section>

        {/* Info strip */}
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
            South Africa has over 190 official learner&apos;s licence writing centres — known as Driving Licence Testing Centres (DLTCs) — regulated under the National Road Traffic Act. Online booking via the{' '}
            <a href="https://online.natis.gov.za/#/auth/identify" target="_blank" rel="noopener noreferrer" className="underline font-semibold">
              eNaTIS portal
            </a>
            {' '}is available in Gauteng (mandatory) and the Eastern Cape. All other provinces use walk-in or phone bookings at the writing centre.
          </p>
        </section>

        {/* Pitch SK Driving */}
        <section className="mt-6 bg-green-50 border border-green-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1">
            <p className="text-sm font-bold text-green-900">Preparing for your writing centre test?</p>
            <p className="text-xs text-green-700 mt-0.5">SK Driving is South Africa&apos;s #1 online K53 learners course. Our practice tests mirror the real DLTC exam — pass your learner&apos;s test first time.</p>
          </div>
          <Link href="/courses" className="shrink-0 bg-green-600 text-white font-bold px-6 py-3 rounded-full hover:bg-green-700 transition-colors text-sm whitespace-nowrap">
            Start Free Practice Tests →
          </Link>
        </section>

        {/* Final CTA */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4 text-sm">Ready to prepare? Our practice tests mirror the real exam.</p>
          <Link href="/courses" className="inline-block bg-blue-700 text-white font-bold px-10 py-4 rounded-full hover:bg-blue-800 transition-colors">
            Start Practising Now →
          </Link>
        </div>

      </main>
    </>
  )
}

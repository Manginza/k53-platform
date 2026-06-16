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
  title: "Find Your Nearest Learner's Licence Writing Centre | SK Driving",
  description: "Find the closest official learner's licence writing centre (DLTC) near you in Cape Town, Johannesburg, Durban, Pretoria, and towns across South Africa. View address, contact details, and get directions.",
  keywords: [
    'learners licence centre', 'learners test centre near me', 'DLTC near me',
    'driving licence testing centre', 'learners licence writing centre',
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
        <section className="mt-12 bg-blue-50 border border-blue-100 rounded-2xl p-6 text-sm text-blue-900">
          <h2 className="font-bold mb-2">About the writing centres</h2>
          <p className="text-blue-800 leading-relaxed">
            South Africa has over 190 official Driving Licence Testing Centres (DLTCs) regulated under the
            National Road Traffic Act. To book your learner&apos;s licence test, contact your nearest centre
            directly or book online via the{' '}
            <a href="https://enatis.com" target="_blank" rel="noopener noreferrer" className="underline font-semibold">
              eNaTIS portal
            </a>
            . In Gauteng, online pre-booking is mandatory.
          </p>
        </section>

        {/* Final CTA */}
        <div className="mt-10 text-center">
          <p className="text-gray-600 mb-4 text-sm">Ready to prepare? Our practice tests mirror the real exam.</p>
          <Link href="/courses" className="inline-block bg-blue-700 text-white font-bold px-10 py-4 rounded-full hover:bg-blue-800 transition-colors">
            Start Practising Now →
          </Link>
        </div>

      </main>
    </>
  )
}

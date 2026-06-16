import type { Metadata } from 'next'
import SchoolFinder from '@/components/SchoolFinder'
import Link from 'next/link'

// ─── Per-province SEO metadata ────────────────────────────────────────────────
const PROVINCE_META: Record<string, { title: string; description: string; keywords: string[] }> = {
  'Gauteng': {
    title: "Driving Schools in Gauteng | Soweto, Tembisa, Pretoria & Johannesburg",
    description: "Find verified driving schools in Gauteng — Soweto, Tembisa, Johannesburg, Pretoria, Centurion, Sandton and more. Compare Code 8 and Code 10 schools, view contact numbers and hours.",
    keywords: ['driving school Soweto', 'driving school Tembisa', 'Code 10 driving school Gauteng', 'K53 driving lessons Johannesburg', 'driving school Pretoria', 'cheap driving lessons Gauteng'],
  },
  'Western Cape': {
    title: "Driving Schools in Western Cape | Cape Town, Mitchells Plain & Bellville",
    description: "Find driving schools in the Western Cape — Cape Town, Mitchells Plain, Bellville, Milnerton, Athlone, Kenilworth and more. Compare K53 schools, view prices and get directions.",
    keywords: ["driving school Cape Town", "driving school Mitchells Plain", "K53 lessons Cape Town", "Code 8 driving school Western Cape", "driving school Bellville", "cheap driving lessons Cape Town"],
  },
  'KwaZulu-Natal': {
    title: "Driving Schools in KwaZulu-Natal | Durban, Umlazi, KwaMashu & Pinetown",
    description: "Find driving schools in KwaZulu-Natal — Durban, Umlazi, KwaMashu, Amanzimtoti, Pinetown and more. View Code 8, Code 10, and motorcycle school listings.",
    keywords: ['driving school Durban', 'driving school Umlazi', 'K53 lessons KwaZulu-Natal', 'Code 10 driving school Durban', 'driving school KwaMashu', 'driving school Pinetown'],
  },
  'Eastern Cape': {
    title: "Driving Schools in Eastern Cape | Gqeberha, East London & Mthatha",
    description: "Find driving schools in the Eastern Cape — Gqeberha (Port Elizabeth), East London, Mthatha, Mdantsane and more. View contact details and get directions.",
    keywords: ['driving school Gqeberha', 'driving school East London', 'K53 lessons Eastern Cape', 'driving school Port Elizabeth', 'driving school Mthatha'],
  },
  'Mpumalanga': {
    title: "Driving Schools in Mpumalanga | Nelspruit, Witbank & Secunda",
    description: "Find driving schools in Mpumalanga — Nelspruit/Mbombela, Witbank/eMalahleni, Secunda and more. View licence codes, contact numbers and get directions.",
    keywords: ['driving school Nelspruit', 'driving school Witbank', 'K53 lessons Mpumalanga', 'Code 10 driving school Mpumalanga'],
  },
  'Limpopo': {
    title: "Driving Schools in Limpopo | Polokwane, Thohoyandou & Mokopane",
    description: "Find driving schools in Limpopo — Polokwane, Thohoyandou, Mokopane, Makhado and more. View licence codes, contact numbers and get directions.",
    keywords: ['driving school Polokwane', 'K53 lessons Limpopo', 'driving school Thohoyandou', 'Code 10 driving school Limpopo'],
  },
  'Free State': {
    title: "Driving Schools in Free State | Bloemfontein, Kroonstad & Harrismith",
    description: "Find driving schools in the Free State — Bloemfontein, Kroonstad, Bethlehem, Harrismith and more. View contact details and get directions.",
    keywords: ['driving school Bloemfontein', 'K53 lessons Free State', 'Code 8 driving school Free State'],
  },
  'North West': {
    title: "Driving Schools in North West | Mahikeng, Rustenburg & Klerksdorp",
    description: "Find driving schools in North West — Mahikeng, Rustenburg, Klerksdorp, Zeerust and more. View licence codes, contact numbers and get directions.",
    keywords: ['driving school Rustenburg', 'driving school Mahikeng', 'K53 lessons North West'],
  },
  'Northern Cape': {
    title: "Driving Schools in Northern Cape | Kimberley, Upington & De Aar",
    description: "Find driving schools in the Northern Cape — Kimberley, Upington, De Aar and more. View contact details and get directions.",
    keywords: ['driving school Kimberley', 'K53 lessons Northern Cape', 'driving school Upington'],
  },
}

const DEFAULT_META = {
  title: "Find a Driving School Near You | SK Driving",
  description: "Search verified driving schools across South Africa — Gauteng, Western Cape, KwaZulu-Natal and all 9 provinces. Filter by licence code (Code 8, Code 10, motorcycles), view contact details and get directions.",
  keywords: [
    'driving school near me', 'K53 driving school', 'cheap driving lessons South Africa',
    'Code 8 driving school', 'Code 10 driving school', 'motorcycle driving school',
    'driving school Johannesburg', 'driving school Cape Town', 'driving school Durban',
    'driving school Soweto', 'driving school Tembisa', 'driving school Mitchells Plain',
    'driving school Umlazi', 'manual driving lessons South Africa',
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
    openGraph: { title: meta.title, description: meta.description, type: 'website' },
  }
}

const PROVINCES = [
  { name: 'Gauteng',       eg: 'Soweto, Tembisa, Pretoria' },
  { name: 'Western Cape',  eg: 'Cape Town, Mitchells Plain' },
  { name: 'KwaZulu-Natal', eg: 'Durban, Umlazi, Pinetown' },
  { name: 'Eastern Cape',  eg: 'Gqeberha, East London' },
  { name: 'Mpumalanga',    eg: 'Nelspruit, Witbank' },
  { name: 'Limpopo',       eg: 'Polokwane, Thohoyandou' },
  { name: 'Free State',    eg: 'Bloemfontein, Kroonstad' },
  { name: 'North West',    eg: 'Mahikeng, Rustenburg' },
  { name: 'Northern Cape', eg: 'Kimberley, Upington' },
]

export default function DrivingSchoolsPage({
  searchParams,
}: {
  searchParams: { province?: string }
}) {
  const initialProvince = searchParams.province ?? ''
  const validProvince = PROVINCES.find(p => p.name === initialProvince)?.name ?? ''

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">

      {/* Hero */}
      <div className="text-center mb-10">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
          {validProvince ? validProvince : 'All 9 Provinces'}
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-2 mb-3 leading-tight">
          {validProvince
            ? `Driving Schools in ${validProvince}`
            : 'Find a Driving School Near You'}
        </h1>
        <p className="text-gray-500 text-base max-w-xl mx-auto">
          {validProvince
            ? `Showing driving schools in ${validProvince}. Filter by licence code or enter your suburb to sort by distance.`
            : <>Enter your suburb or tap <strong>Use my location</strong> to find a driving school near you. Filter by Code 8, Code 10, or motorcycle training.</>}
        </p>
      </div>

      {/* Search widget */}
      <SchoolFinder initialProvince={validProvince} />

      {/* Province quick-links */}
      <section className="mt-16 border-t border-gray-100 pt-10">
        <h2 className="text-lg font-bold text-gray-800 mb-4 text-center">
          Browse schools by province
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {PROVINCES.map(p => (
            <Link
              key={p.name}
              href={`/driving-schools?province=${encodeURIComponent(p.name)}`}
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
          <li>Avoid paying the full package upfront — pay per lesson until you are satisfied.</li>
          <li><strong>Code 10 (C1)</strong> training is typically R350–R450/hr; a test-day truck hire is R1,200–R1,500 in Gauteng.</li>
          <li>Need to find the nearest test centre? Use our{' '}
            <Link href="/centers" className="underline font-semibold">DLTC centre finder</Link>.
          </li>
        </ul>
      </section>

      {/* Final CTA */}
      <div className="mt-10 text-center">
        <p className="text-gray-600 mb-4 text-sm">Booked your lessons? Start preparing for the K53 theory test now.</p>
        <Link href="/courses" className="inline-block bg-blue-700 text-white font-bold px-10 py-4 rounded-full hover:bg-blue-800 transition-colors">
          Start K53 Practice Tests →
        </Link>
      </div>

    </main>
  )
}

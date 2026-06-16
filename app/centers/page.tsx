import type { Metadata } from 'next'
import CenterFinder from '@/components/CenterFinder'
import Link from 'next/link'

export const metadata: Metadata = {
  title: "Find Your Nearest Learner's Licence Writing Centre | SK Driving",
  description:
    "Find the closest official learner's licence writing centre (DLTC) near you in Cape Town, Johannesburg, Durban, Pretoria, and towns across South Africa. View address, contact details, and get directions.",
  keywords: [
    // short-tail
    "learners licence centre", "learners test centre near me", "DLTC near me",
    "driving licence testing centre", "learners licence writing centre",
    // metro long-tail
    "learners licence centre Cape Town", "learners test centre Johannesburg",
    "learners licence centre Durban", "learners licence centre Pretoria",
    "learners test centre Soweto", "learners licence centre Sandton",
    // township / suburb long-tail
    "learners licence centre Philippi", "learners licence centre Mitchell's Plain",
    "learners licence centre Khayelitsha", "learners licence centre Bellville",
    "learners licence centre Tembisa", "learners licence centre Midrand",
    "learners licence centre Roodepoort", "learners licence centre Benoni",
    // smaller municipality long-tail
    "learners licence centre eKurhuleni", "learners licence centre Ekurhuleni",
    "learners licence centre Emalahleni", "learners licence centre Mogalakwena",
    "learners licence centre Ramotshere Moiloa", "learners licence centre Mahikeng",
    "learners licence centre Mthatha", "learners licence centre East London",
    "learners licence centre Polokwane", "learners licence centre Nelspruit",
    "learners licence centre Pietermaritzburg", "learners licence centre Richards Bay",
    "learners test centre Port Elizabeth", "learners licence centre Gqeberha",
    "nearest DLTC South Africa", "where to write learners licence test",
  ],
  openGraph: {
    title: "Find Your Nearest Learner's Licence Writing Centre",
    description:
      "Locate the closest official DLTC in your area — Cape Town, Joburg, Durban, Pretoria and everywhere in between.",
    type: 'website',
  },
}

// JSON-LD: LocalBusiness schema for the most-searched centres
const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: "Learner's Licence Writing Centres in South Africa",
  description: 'Official Driving Licence Testing Centres (DLTCs) across South Africa',
  itemListElement: [
    {
      '@type': 'ListItem', position: 1,
      item: { '@type': 'GovernmentOffice', name: 'Stock Road DLTC', address: { '@type': 'PostalAddress', streetAddress: 'Stock Road, Bellville', addressLocality: 'Cape Town', addressRegion: 'Western Cape', addressCountry: 'ZA' } },
    },
    {
      '@type': 'ListItem', position: 2,
      item: { '@type': 'GovernmentOffice', name: 'Sandton Testing Station', address: { '@type': 'PostalAddress', streetAddress: 'c/o 8th and 9th Street, Marlboro Gardens', addressLocality: 'Johannesburg', addressRegion: 'Gauteng', addressCountry: 'ZA' }, telephone: '011 321-6372' },
    },
    {
      '@type': 'ListItem', position: 3,
      item: { '@type': 'GovernmentOffice', name: 'Pinetown DLTC', address: { '@type': 'PostalAddress', streetAddress: '1 Stockville Road, Tollgate', addressLocality: 'Durban', addressRegion: 'KwaZulu-Natal', addressCountry: 'ZA' }, telephone: '031 792-6860' },
    },
    {
      '@type': 'ListItem', position: 4,
      item: { '@type': 'GovernmentOffice', name: 'Centurion Test Ground', address: { '@type': 'PostalAddress', streetAddress: 'Nellmapius Drive, Irene', addressLocality: 'Pretoria', addressRegion: 'Gauteng', addressCountry: 'ZA' }, telephone: '012 665-2808' },
    },
    {
      '@type': 'ListItem', position: 5,
      item: { '@type': 'GovernmentOffice', name: 'Diepkloof Testing Station', address: { '@type': 'PostalAddress', streetAddress: '8642 Immik Drive, Funda Park Zone 6', addressLocality: 'Soweto', addressRegion: 'Gauteng', addressCountry: 'ZA' }, telephone: '011 933-3975' },
    },
  ],
}

export default function CentersPage() {
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
            All 9 Provinces
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-2 mb-3 leading-tight">
            Find Your Nearest Learner&apos;s Licence Writing Centre
          </h1>
          <p className="text-gray-500 text-base max-w-xl mx-auto">
            Enter your suburb, township, or city — or tap <strong>Use my location</strong> — to find the
            official DLTC closest to you anywhere in South Africa.
          </p>
        </div>

        {/* Search widget */}
        <CenterFinder />

        {/* Province quick-links for SEO */}
        <section className="mt-16 border-t border-gray-100 pt-10">
          <h2 className="text-lg font-bold text-gray-800 mb-4 text-center">
            Browse centres by province
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { name: 'Gauteng',         eg: 'Joburg, Pretoria, Ekurhuleni' },
              { name: 'Western Cape',    eg: 'Cape Town, Paarl, George' },
              { name: 'KwaZulu-Natal',   eg: 'Durban, PMB, Richards Bay' },
              { name: 'Eastern Cape',    eg: 'Gqeberha, East London, Mthatha' },
              { name: 'Mpumalanga',      eg: 'Nelspruit, Secunda, Witbank' },
              { name: 'Limpopo',         eg: 'Polokwane, Thohoyandou, Mokopane' },
              { name: 'Free State',      eg: 'Bloemfontein, Kroonstad, Harrismith' },
              { name: 'North West',      eg: 'Mahikeng, Rustenburg, Zeerust' },
              { name: 'Northern Cape',   eg: 'Kimberley, Upington, De Aar' },
            ].map(p => (
              <Link
                key={p.name}
                href={`/centers?province=${encodeURIComponent(p.name)}`}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-400 hover:shadow-sm transition-all"
              >
                <p className="font-semibold text-gray-900 text-sm">{p.name}</p>
                <p className="text-xs text-gray-400 mt-0.5 truncate">{p.eg}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Info strip */}
        <section className="mt-12 bg-blue-50 border border-blue-100 rounded-2xl p-6 text-sm text-blue-900">
          <h2 className="font-bold mb-2">About the writing centres</h2>
          <p className="text-blue-800 leading-relaxed">
            South Africa has over 190 official Driving Licence Testing Centres (DLTCs) regulated under the
            National Road Traffic Act. To book your learner&apos;s licence test, contact your nearest centre
            directly or book online via the{' '}
            <a href="https://enatis.com" target="_blank" rel="noopener noreferrer"
               className="underline font-semibold">
              eNaTIS portal
            </a>
            . In Gauteng, online pre-booking is mandatory.
          </p>
        </section>

        {/* Final CTA */}
        <div className="mt-10 text-center">
          <p className="text-gray-600 mb-4 text-sm">Ready to prepare? Our practice tests mirror the real exam.</p>
          <Link
            href="/courses"
            className="inline-block bg-blue-700 text-white font-bold px-10 py-4 rounded-full hover:bg-blue-800 transition-colors"
          >
            Start Practising Now →
          </Link>
        </div>

      </main>
    </>
  )
}

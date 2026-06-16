'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'

// ─── SA location → approx coordinates lookup (no external API needed) ─────
// Covers provinces, metros, major townships, suburbs, and towns in the dataset.
const LOCATION_LOOKUP: Record<string, { lat: number; lng: number; province?: string }> = {
  // ── Cape Town metro ──────────────────────────────────────────────────────
  'cape town': { lat: -33.9249, lng: 18.4241 },
  'philippi': { lat: -33.9930, lng: 18.5810 },
  'mitchells plain': { lat: -34.0410, lng: 18.6212 },
  "mitchell's plain": { lat: -34.0410, lng: 18.6212 },
  'khayelitsha': { lat: -34.0406, lng: 18.6846 },
  'bellville': { lat: -33.9065, lng: 18.6303 },
  'parow': { lat: -33.8924, lng: 18.6124 },
  'bishop lavis': { lat: -33.9466, lng: 18.5734 },
  'elsies river': { lat: -33.9257, lng: 18.5594 },
  'goodwood': { lat: -33.9019, lng: 18.5495 },
  'milnerton': { lat: -33.8690, lng: 18.4980 },
  'durbanville': { lat: -33.8350, lng: 18.6470 },
  'brackenfell': { lat: -33.8728, lng: 18.6932 },
  'kuils river': { lat: -33.9300, lng: 18.7270 },
  'atlantis': { lat: -33.5600, lng: 18.4838 },
  'green point': { lat: -33.9060, lng: 18.4167 },
  'wetton': { lat: -34.0009, lng: 18.5039 },
  'paarl': { lat: -33.7298, lng: 18.9581 },
  'stellenbosch': { lat: -33.9321, lng: 18.8602 },
  'somerset west': { lat: -34.0814, lng: 18.8437 },
  "gordon's bay": { lat: -34.1639, lng: 18.8592 },
  'hermanus': { lat: -34.4215, lng: 19.2360 },
  'grabouw': { lat: -34.1536, lng: 19.0094 },
  'franschhoek': { lat: -33.9094, lng: 19.1210 },
  'george': { lat: -33.9881, lng: 22.4378 },
  'knysna': { lat: -34.0370, lng: 23.0430 },
  'mossel bay': { lat: -34.1797, lng: 22.1436 },
  'worcester': { lat: -33.6452, lng: 19.4488 },
  'ceres': { lat: -33.3654, lng: 19.3155 },
  'robertson': { lat: -33.7994, lng: 19.8752 },
  'swellendam': { lat: -34.0239, lng: 20.4397 },
  'bredasdorp': { lat: -34.5326, lng: 20.0411 },
  'caledon': { lat: -34.2230, lng: 19.4187 },
  'malmesbury': { lat: -33.4597, lng: 18.7288 },
  'saldanha': { lat: -32.9812, lng: 17.9461 },
  'beaufort west': { lat: -32.3493, lng: 22.5857 },
  // ── Johannesburg metro ───────────────────────────────────────────────────
  'johannesburg': { lat: -26.2041, lng: 28.0473 },
  'joburg': { lat: -26.2041, lng: 28.0473 },
  'jozi': { lat: -26.2041, lng: 28.0473 },
  'soweto': { lat: -26.2676, lng: 27.8585 },
  'diepkloof': { lat: -26.2449, lng: 27.9268 },
  'sandton': { lat: -26.1067, lng: 28.0569 },
  'randburg': { lat: -26.0960, lng: 27.9990 },
  'roodepoort': { lat: -26.1607, lng: 27.8694 },
  'florida': { lat: -26.1744, lng: 27.9092 },
  'krugersdorp': { lat: -26.0895, lng: 27.7739 },
  'langlaagte': { lat: -26.2100, lng: 27.9700 },
  'alberton': { lat: -26.2768, lng: 28.1242 },
  'germiston': { lat: -26.2400, lng: 28.1600 },
  'edenvale': { lat: -26.1456, lng: 28.1550 },
  'bedfordview': { lat: -26.1862, lng: 28.1308 },
  'midrand': { lat: -25.9989, lng: 28.0884 },
  'randfontein': { lat: -26.1783, lng: 27.7020 },
  'kliptown': { lat: -26.2726, lng: 27.8981 },
  'maponya': { lat: -26.2696, lng: 27.8982 },
  'protea glen': { lat: -26.2927, lng: 27.8437 },
  // ── Pretoria / Tshwane ───────────────────────────────────────────────────
  'pretoria': { lat: -25.7479, lng: 28.1878 },
  'tshwane': { lat: -25.7479, lng: 28.1878 },
  'centurion': { lat: -25.8616, lng: 28.1887 },
  'akasia': { lat: -25.6834, lng: 28.1234 },
  'atteridgeville': { lat: -25.7893, lng: 28.0671 },
  'soshanguve': { lat: -25.5302, lng: 28.1018 },
  'hammanskraal': { lat: -25.3942, lng: 28.2755 },
  'temba': { lat: -25.3942, lng: 28.2755 },
  'mamelodi': { lat: -25.7243, lng: 28.3739 },
  'waltloo': { lat: -25.7232, lng: 28.3245 },
  // ── East Rand / Ekurhuleni ───────────────────────────────────────────────
  'ekurhuleni': { lat: -26.1673, lng: 28.3041 },
  'boksburg': { lat: -26.2148, lng: 28.2400 },
  'benoni': { lat: -26.1882, lng: 28.3137 },
  'brakpan': { lat: -26.2385, lng: 28.3642 },
  'springs': { lat: -26.2553, lng: 28.4539 },
  'kempton park': { lat: -26.0872, lng: 28.2238 },
  'tembisa': { lat: -25.9970, lng: 28.2285 },
  'bronkhorstspruit': { lat: -25.8083, lng: 28.7438 },
  'rayton': { lat: -25.7266, lng: 28.5497 },
  // ── Vaal Triangle ────────────────────────────────────────────────────────
  'vereeniging': { lat: -26.6736, lng: 27.9300 },
  'vanderbijlpark': { lat: -26.7022, lng: 27.8333 },
  'sebokeng': { lat: -26.5766, lng: 27.8294 },
  'meyerton': { lat: -26.5592, lng: 28.0119 },
  'sasolburg': { lat: -26.8139, lng: 27.8147 },
  'heidelberg': { lat: -26.5011, lng: 28.3577 },
  // ── Durban / eThekwini ───────────────────────────────────────────────────
  'durban': { lat: -29.8587, lng: 31.0218 },
  'ethekwini': { lat: -29.8587, lng: 31.0218 },
  'pinetown': { lat: -29.8213, lng: 30.8549 },
  'amanzimtoti': { lat: -30.0547, lng: 30.8754 },
  'verulam': { lat: -29.6435, lng: 31.0467 },
  'mobeni': { lat: -29.9700, lng: 30.9800 },
  'ballito': { lat: -29.5390, lng: 31.2054 },
  'kwadukuza': { lat: -29.3167, lng: 31.2833 },
  'mandeni': { lat: -29.1300, lng: 31.3860 },
  // ── KZN interior ─────────────────────────────────────────────────────────
  'pietermaritzburg': { lat: -29.6356, lng: 30.3961 },
  'pmb': { lat: -29.6356, lng: 30.3961 },
  'ladysmith': { lat: -28.5590, lng: 29.7778 },
  'newcastle': { lat: -27.7540, lng: 29.9313 },
  'vryheid': { lat: -27.7680, lng: 30.7910 },
  'dundee': { lat: -28.1680, lng: 30.2350 },
  'estcourt': { lat: -29.0048, lng: 29.8868 },
  'richards bay': { lat: -28.7200, lng: 31.9000 },
  'empangeni': { lat: -28.7200, lng: 31.9000 },
  'port shepstone': { lat: -30.7430, lng: 30.4530 },
  'kokstad': { lat: -30.5512, lng: 29.4242 },
  'hluhluwe': { lat: -28.0167, lng: 32.2756 },
  'mtubatuba': { lat: -28.4130, lng: 32.1670 },
  'scottburgh': { lat: -30.2882, lng: 30.7630 },
  // ── Eastern Cape ─────────────────────────────────────────────────────────
  'port elizabeth': { lat: -33.9608, lng: 25.6022 },
  'gqeberha': { lat: -33.9608, lng: 25.6022 },
  'pe': { lat: -33.9608, lng: 25.6022 },
  'east london': { lat: -32.9952, lng: 27.8920 },
  'uitenhage': { lat: -33.7516, lng: 25.3913 },
  'kariega': { lat: -33.7516, lng: 25.3913 },
  'mthatha': { lat: -31.5839, lng: 28.7900 },
  'umtata': { lat: -31.5839, lng: 28.7900 },
  'grahamstown': { lat: -33.3027, lng: 26.5290 },
  'makhanda': { lat: -33.3027, lng: 26.5290 },
  'mdantsane': { lat: -32.9540, lng: 27.7733 },
  'king williams town': { lat: -32.8750, lng: 27.3970 },
  'kwt': { lat: -32.8750, lng: 27.3970 },
  'butterworth': { lat: -32.3329, lng: 28.1510 },
  'humansdorp': { lat: -34.0211, lng: 24.7729 },
  'lady frere': { lat: -31.6987, lng: 27.2319 },
  // ── Free State ───────────────────────────────────────────────────────────
  'bloemfontein': { lat: -29.0852, lng: 26.1596 },
  'bloem': { lat: -29.0852, lng: 26.1596 },
  'kroonstad': { lat: -27.6490, lng: 27.2313 },
  'bethlehem': { lat: -28.2333, lng: 28.3000 },
  'parys': { lat: -26.9051, lng: 27.4574 },
  'harrismith': { lat: -28.2776, lng: 29.1233 },
  'phuthaditjhaba': { lat: -28.5225, lng: 28.8949 },
  'ficksburg': { lat: -28.8744, lng: 27.8757 },
  // ── Limpopo ──────────────────────────────────────────────────────────────
  'polokwane': { lat: -23.9045, lng: 29.4688 },
  'limpopo': { lat: -23.9045, lng: 29.4688 },
  'thohoyandou': { lat: -22.9526, lng: 30.4742 },
  'mokopane': { lat: -24.1815, lng: 29.0165 },
  'makhado': { lat: -23.1000, lng: 29.9000 },
  'louis trichardt': { lat: -23.0499, lng: 29.9178 },
  'lephalale': { lat: -23.6756, lng: 27.7073 },
  'seshego': { lat: -23.8699, lng: 29.4072 },
  // ── Mpumalanga ───────────────────────────────────────────────────────────
  'nelspruit': { lat: -25.4715, lng: 30.9853 },
  'mbombela': { lat: -25.4715, lng: 30.9853 },
  'secunda': { lat: -26.5256, lng: 29.1714 },
  'witbank': { lat: -25.8714, lng: 29.2388 },
  'emalahleni': { lat: -25.8714, lng: 29.2388 },
  'middelburg mpumalanga': { lat: -25.7710, lng: 29.4620 },
  'standerton': { lat: -26.9468, lng: 29.2408 },
  'lydenburg': { lat: -25.0987, lng: 30.4581 },
  'white river': { lat: -25.3286, lng: 31.0050 },
  'sabie': { lat: -25.1010, lng: 30.7859 },
  // ── North West ───────────────────────────────────────────────────────────
  'mahikeng': { lat: -25.8555, lng: 25.6450 },
  'mafikeng': { lat: -25.8555, lng: 25.6450 },
  'mmabatho': { lat: -25.8555, lng: 25.6450 },
  'rustenburg': { lat: -25.6637, lng: 27.2427 },
  'zeerust': { lat: -25.5477, lng: 26.0748 },
  'klerksdorp': { lat: -26.8545, lng: 26.6657 },
  'carletonville': { lat: -26.3602, lng: 27.3979 },
  // ── Northern Cape ────────────────────────────────────────────────────────
  'kimberley': { lat: -28.7282, lng: 24.7499 },
  'upington': { lat: -28.4522, lng: 21.2561 },
  'springbok': { lat: -29.6640, lng: 17.8864 },
  'de aar': { lat: -30.6500, lng: 24.0142 },
  'colesburg': { lat: -30.7161, lng: 25.0954 },
  'prieska': { lat: -29.6680, lng: 22.7450 },
  // ── Provinces (broad fallbacks) ───────────────────────────────────────────
  'gauteng': { lat: -26.2041, lng: 28.0473 },
  'western cape': { lat: -33.9249, lng: 18.4241 },
  'eastern cape': { lat: -32.9952, lng: 27.8920 },
  'kwazulu-natal': { lat: -29.8587, lng: 31.0218 },
  'kzn': { lat: -29.8587, lng: 31.0218 },
  'free state': { lat: -29.0852, lng: 26.1596 },
  'mpumalanga': { lat: -25.4715, lng: 30.9853 },
  'north west': { lat: -25.8555, lng: 25.6450 },
  'northern cape': { lat: -28.7282, lng: 24.7499 },
}

function findCoords(query: string) {
  const q = query.toLowerCase().trim()
  if (LOCATION_LOOKUP[q]) return LOCATION_LOOKUP[q]
  for (const [key, val] of Object.entries(LOCATION_LOOKUP)) {
    if (q.includes(key) || key.includes(q)) return val
  }
  return null
}

type Center = {
  id: number
  name: string
  province: string
  address: string
  phone: string | null
  lat: number
  lng: number
  is_smart_hub: boolean
  distanceKm: number
}

const PROVINCES = [
  'All provinces',
  'Gauteng',
  'Western Cape',
  'Eastern Cape',
  'KwaZulu-Natal',
  'Free State',
  'Mpumalanga',
  'Limpopo',
  'North West',
  'Northern Cape',
]

export default function CenterFinder() {
  const [query,    setQuery]    = useState('')
  const [province, setProvince] = useState('All provinces')
  const [results,  setResults]  = useState<Center[] | null>(null)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)
  const [searched, setSearched] = useState(false)

  const fetchNearest = useCallback(async (lat: number, lng: number, prov: string) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        lat: String(lat), lng: String(lng), limit: '5',
        ...(prov !== 'All provinces' ? { province: prov } : {}),
      })
      const res = await fetch(`/api/centers/nearest?${params}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Something went wrong.')
      setResults(data.results)
      setSearched(true)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Could not fetch results.')
    } finally {
      setLoading(false)
    }
  }, [])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    const coords = findCoords(query)
    if (!coords) {
      setError(`We don't recognise "${query}". Try a suburb, city, or province — or use "My location" below.`)
      return
    }
    fetchNearest(coords.lat, coords.lng, province)
  }

  function handleGeolocate() {
    if (!navigator.geolocation) {
      setError('Your browser does not support location detection.')
      return
    }
    setLoading(true)
    setError(null)
    navigator.geolocation.getCurrentPosition(
      pos => fetchNearest(pos.coords.latitude, pos.coords.longitude, province),
      () => {
        setLoading(false)
        setError('Location access was denied. Type your suburb instead.')
      },
    )
  }

  function mapsUrl(center: Center) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(center.name + ' ' + center.address)}`
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Search form */}
      <form onSubmit={handleSearch} className="space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="e.g. Philippi, Soweto, Randburg…"
            className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-700 text-white font-bold px-5 py-3 rounded-xl hover:bg-blue-800 disabled:opacity-50 transition-colors text-sm"
          >
            Search
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={province}
            onChange={e => setProvince(e.target.value)}
            className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {PROVINCES.map(p => <option key={p}>{p}</option>)}
          </select>

          <button
            type="button"
            onClick={handleGeolocate}
            disabled={loading}
            className="flex items-center justify-center gap-2 border-2 border-blue-600 text-blue-700 font-semibold px-5 py-3 rounded-xl hover:bg-blue-50 disabled:opacity-50 transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Use my location
          </button>
        </div>
      </form>

      {/* Loading */}
      {loading && (
        <div className="mt-8 text-center text-gray-500 text-sm animate-pulse">
          Finding nearest centres…
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="mt-6 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Results */}
      {!loading && results && results.length > 0 && (
        <div className="mt-8 space-y-4">
          <h2 className="text-lg font-bold text-gray-900">
            {results.length} nearest centre{results.length !== 1 ? 's' : ''}
          </h2>

          {results.map((c, i) => (
            <div
              key={c.id}
              className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-start gap-4"
            >
              <div className="flex-shrink-0 w-9 h-9 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-sm">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 flex-wrap">
                  <h3 className="font-bold text-gray-900 text-base leading-tight">{c.name}</h3>
                  {c.is_smart_hub && (
                    <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full uppercase tracking-wide shrink-0">
                      Smart Hub
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-0.5">{c.province}</p>
                <p className="text-sm text-gray-600 mt-1">{c.address}</p>
                {c.phone && (
                  <a href={`tel:${c.phone}`} className="text-sm text-blue-600 hover:underline mt-0.5 block">
                    {c.phone}
                  </a>
                )}
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className="text-sm font-semibold text-green-600">
                  ~{c.distanceKm} km
                </span>
                <a
                  href={mapsUrl(c)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                >
                  Directions ↗
                </a>
              </div>
            </div>
          ))}

          {/* CTA */}
          <div className="mt-8 bg-blue-700 rounded-2xl p-6 text-center text-white">
            <p className="font-bold text-lg mb-1">Found your centre?</p>
            <p className="text-blue-100 text-sm mb-5">
              Start practising now — you need 75% to pass the learner&apos;s licence test.
            </p>
            <Link
              href="/courses"
              className="inline-block bg-white text-blue-700 font-bold px-8 py-3 rounded-full hover:bg-blue-50 transition-colors"
            >
              Start practising for your test →
            </Link>
          </div>
        </div>
      )}

      {/* No results */}
      {!loading && searched && results?.length === 0 && (
        <div className="mt-8 text-center text-gray-500 text-sm">
          No centres found. Try removing the province filter or searching a different location.
        </div>
      )}
    </div>
  )
}

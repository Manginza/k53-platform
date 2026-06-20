'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// Reuse the same location lookup as CenterFinder — suburb → approx coords
const LOCATION_LOOKUP: Record<string, { lat: number; lng: number }> = {
  'cape town': { lat: -33.9249, lng: 18.4241 },
  'mitchells plain': { lat: -34.0410, lng: 18.6212 },
  "mitchell's plain": { lat: -34.0410, lng: 18.6212 },
  'khayelitsha': { lat: -34.0406, lng: 18.6846 },
  'bellville': { lat: -33.9065, lng: 18.6303 },
  'milnerton': { lat: -33.8690, lng: 18.4980 },
  'tableview': { lat: -33.8240, lng: 18.4890 },
  'athlone': { lat: -33.9615, lng: 18.5270 },
  'kenilworth': { lat: -34.0020, lng: 18.5050 },
  'retreat': { lat: -34.0050, lng: 18.5010 },
  'paarl': { lat: -33.7298, lng: 18.9581 },
  'stellenbosch': { lat: -33.9321, lng: 18.8602 },
  'george': { lat: -33.9881, lng: 22.4378 },
  'johannesburg': { lat: -26.2041, lng: 28.0473 },
  'joburg': { lat: -26.2041, lng: 28.0473 },
  'soweto': { lat: -26.2676, lng: 27.8585 },
  'sandton': { lat: -26.1067, lng: 28.0569 },
  'randburg': { lat: -26.0960, lng: 27.9990 },
  'roodepoort': { lat: -26.1607, lng: 27.8694 },
  'midrand': { lat: -25.9989, lng: 28.0884 },
  'tembisa': { lat: -25.9970, lng: 28.2285 },
  'boksburg': { lat: -26.2148, lng: 28.2400 },
  'benoni': { lat: -26.1882, lng: 28.3137 },
  'kempton park': { lat: -26.0872, lng: 28.2238 },
  'pretoria': { lat: -25.7479, lng: 28.1878 },
  'centurion': { lat: -25.8616, lng: 28.1887 },
  'soshanguve': { lat: -25.5302, lng: 28.1018 },
  'mamelodi': { lat: -25.7243, lng: 28.3739 },
  'durban': { lat: -29.8587, lng: 31.0218 },
  'pinetown': { lat: -29.8213, lng: 30.8549 },
  'umlazi': { lat: -29.9700, lng: 30.8800 },
  'kwadukuza': { lat: -29.3167, lng: 31.2833 },
  'amanzimtoti': { lat: -30.0547, lng: 30.8754 },
  'pietermaritzburg': { lat: -29.6356, lng: 30.3961 },
  'pmb': { lat: -29.6356, lng: 30.3961 },
  'richards bay': { lat: -28.7200, lng: 31.9000 },
  'newcastle': { lat: -27.7540, lng: 29.9313 },
  'kwmashu': { lat: -29.7500, lng: 30.9300 },
  'gqeberha': { lat: -33.9608, lng: 25.6022 },
  'port elizabeth': { lat: -33.9608, lng: 25.6022 },
  'east london': { lat: -32.9952, lng: 27.8920 },
  'mthatha': { lat: -31.5839, lng: 28.7900 },
  'bloemfontein': { lat: -29.0852, lng: 26.1596 },
  'polokwane': { lat: -23.9045, lng: 29.4688 },
  'nelspruit': { lat: -25.4715, lng: 30.9853 },
  'mbombela': { lat: -25.4715, lng: 30.9853 },
  'witbank': { lat: -25.8714, lng: 29.2388 },
  'secunda': { lat: -26.5256, lng: 29.1714 },
  'mahikeng': { lat: -25.8555, lng: 25.6450 },
  'rustenburg': { lat: -25.6637, lng: 27.2427 },
  'klerksdorp': { lat: -26.8545, lng: 26.6657 },
  'kimberley': { lat: -28.7282, lng: 24.7499 },
  'upington': { lat: -28.4522, lng: 21.2561 },
  // Province-level fallbacks
  'gauteng': { lat: -26.2041, lng: 28.0473 },
  'western cape': { lat: -33.9249, lng: 18.4241 },
  'eastern cape': { lat: -32.9952, lng: 27.8920 },
  'kwazulu-natal': { lat: -29.8587, lng: 31.0218 },
  'kzn': { lat: -29.8587, lng: 31.0218 },
  'free state': { lat: -29.0852, lng: 26.1596 },
  'mpumalanga': { lat: -25.4715, lng: 30.9853 },
  'north west': { lat: -25.8555, lng: 25.6450 },
  'northern cape': { lat: -28.7282, lng: 24.7499 },
  'limpopo': { lat: -23.9045, lng: 29.4688 },
}

function findCoords(query: string) {
  const q = query.toLowerCase().trim()
  if (LOCATION_LOOKUP[q]) return LOCATION_LOOKUP[q]
  for (const [key, val] of Object.entries(LOCATION_LOOKUP)) {
    if (q.includes(key) || key.includes(q)) return val
  }
  return null
}

type School = {
  id: number
  name: string
  province: string
  suburb: string
  address: string | null
  phone: string | null
  email: string | null
  licence_codes: string[]
  hours: string | null
  is_verified: boolean
  distanceKm: number
}

const PROVINCES = [
  'All provinces', 'Gauteng', 'Western Cape', 'KwaZulu-Natal', 'Eastern Cape',
  'Free State', 'Mpumalanga', 'Limpopo', 'North West', 'Northern Cape',
]

const CODES = ['All codes', 'Code 8 (B)', 'Code 10 (C1)', 'Code 14 (EC)', 'Motorcycles']
const CODE_API_MAP: Record<string, string> = {
  'Code 8 (B)': 'Code 8',
  'Code 10 (C1)': 'Code 10',
  'Code 14 (EC)': 'Code 14',
  'Motorcycles': 'Motorcycles',
}

const CODE_COLOURS: Record<string, string> = {
  'Code 8':      'bg-blue-100 text-blue-700',
  'Code 10':     'bg-orange-100 text-orange-700',
  'Code 14':     'bg-red-100 text-red-700',
  'Motorcycles': 'bg-purple-100 text-purple-700',
}

export default function SchoolFinder({ initialProvince = '' }: { initialProvince?: string }) {
  const router = useRouter()

  const [query,    setQuery]    = useState('')
  const [province, setProvince] = useState(initialProvince || 'All provinces')
  const [codeFilter, setCodeFilter] = useState('All codes')
  const [results,  setResults]  = useState<School[] | null>(null)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)
  const [searched, setSearched] = useState(false)

  const fetchNearest = useCallback(async (lat: number, lng: number, prov: string, code: string, limit = 10) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        lat: String(lat), lng: String(lng), limit: String(limit),
        ...(prov !== 'All provinces' ? { province: prov } : {}),
        ...(code !== 'All codes' && CODE_API_MAP[code] ? { code: CODE_API_MAP[code] } : {}),
      })
      const res = await fetch(`/api/schools/nearest?${params}`)
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

  // Auto-fetch on mount when province is pre-set via URL
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!initialProvince) return
    const coords = findCoords(initialProvince.toLowerCase())
    if (coords) fetchNearest(coords.lat, coords.lng, initialProvince, codeFilter, 20)
  }, [])

  function handleProvinceChange(newProvince: string) {
    setProvince(newProvince)
    const url = newProvince === 'All provinces'
      ? '/driving-schools'
      : `/driving-schools?province=${encodeURIComponent(newProvince)}`
    router.replace(url, { scroll: false })
    if (newProvince !== 'All provinces') {
      const coords = findCoords(newProvince.toLowerCase())
      if (coords) fetchNearest(coords.lat, coords.lng, newProvince, codeFilter, 20)
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    const coords = findCoords(query)
    if (!coords) {
      setError(`We don't recognise "${query}". Try a suburb, city, or province — or tap "Use my location".`)
      return
    }
    fetchNearest(coords.lat, coords.lng, province, codeFilter)
  }

  function handleGeolocate() {
    if (!navigator.geolocation) {
      setError('Your browser does not support location detection.')
      return
    }
    setLoading(true)
    setError(null)
    navigator.geolocation.getCurrentPosition(
      pos => fetchNearest(pos.coords.latitude, pos.coords.longitude, province, codeFilter),
      () => { setLoading(false); setError('Location access was denied. Type your suburb instead.') },
    )
  }

  function mapsUrl(school: School) {
    const q = encodeURIComponent(`${school.name} ${school.suburb} ${school.province}`)
    return `https://www.google.com/maps/search/?api=1&query=${q}`
  }

  function whatsAppUrl(phone: string) {
    const digits = phone.replace(/\D/g, '')
    const intl = digits.startsWith('0') ? '27' + digits.slice(1) : digits
    return `https://wa.me/${intl}`
  }

  function isMobile(phone: string) {
    const digits = phone.replace(/\D/g, '')
    return digits.length >= 9 && /^(0?[67]\d)/.test(digits)
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
            placeholder="e.g. Soweto, Tembisa, Mitchells Plain…"
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
            onChange={e => handleProvinceChange(e.target.value)}
            className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {PROVINCES.map(p => <option key={p}>{p}</option>)}
          </select>

          <select
            value={codeFilter}
            onChange={e => setCodeFilter(e.target.value)}
            className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {CODES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        <button
          type="button"
          onClick={handleGeolocate}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 border-2 border-blue-600 text-blue-700 font-semibold px-5 py-3 rounded-xl hover:bg-blue-50 disabled:opacity-50 transition-colors text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Use my location
        </button>
      </form>

      {loading && (
        <div className="mt-8 text-center text-gray-500 text-sm animate-pulse">Finding nearest driving schools…</div>
      )}

      {error && !loading && (
        <div className="mt-6 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>
      )}

      {!loading && results && results.length > 0 && (
        <div className="mt-8 space-y-4">
          <h2 className="text-lg font-bold text-gray-900">
            {results.length} {province !== 'All provinces'
              ? `school${results.length !== 1 ? 's' : ''} in ${province}`
              : `nearest school${results.length !== 1 ? 's' : ''}`}
            {codeFilter !== 'All codes' && <span className="text-sm font-normal text-gray-500 ml-1">— {codeFilter}</span>}
          </h2>

          {results.map((s, i) => (
            <div
              key={s.id}
              className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-sm">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 flex-wrap">
                    <h3 className="font-bold text-gray-900 text-base leading-tight">{s.name}</h3>
                    {s.is_verified && (
                      <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full uppercase tracking-wide shrink-0">
                        Verified
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{s.suburb}, {s.province}</p>
                  {s.address && <p className="text-sm text-gray-600 mt-1">{s.address}</p>}

                  {/* Licence code badges */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {s.licence_codes.map(code => (
                      <span key={code} className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${CODE_COLOURS[code] ?? 'bg-gray-100 text-gray-600'}`}>
                        {code}
                      </span>
                    ))}
                  </div>

                  {s.hours && (
                    <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">{s.hours}</p>
                  )}

                  <div className="flex flex-wrap gap-3 mt-2">
                    {s.phone && (
                      <>
                        <a href={`tel:${s.phone}`} className="text-sm text-blue-600 hover:underline">
                          {s.phone}
                        </a>
                        {isMobile(s.phone) && (
                          <a
                            href={whatsAppUrl(s.phone)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold bg-green-500 text-white px-3 py-1 rounded-full hover:bg-green-600 transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path d="M17.47 14.38c-.3-.15-1.74-.86-2-.95-.27-.1-.47-.15-.66.15-.2.3-.77.95-.94 1.15-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.6.13-.14.3-.35.44-.53.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.66-1.6-.9-2.18-.24-.57-.48-.5-.66-.5l-.57-.01c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.08 1.74-.71 1.98-1.4.24-.68.24-1.27.17-1.4-.07-.13-.27-.2-.57-.35zM12.05 21.5h-.01a9.5 9.5 0 01-4.84-1.33l-.35-.2-3.6.94.96-3.5-.23-.36a9.46 9.46 0 01-1.45-5.05c0-5.24 4.27-9.5 9.52-9.5 2.54 0 4.93.99 6.73 2.79a9.45 9.45 0 012.79 6.72c0 5.24-4.27 9.5-9.52 9.5zm8.07-16.56A11.43 11.43 0 0012.05 3C5.8 3 .72 8.08.72 14.33c0 2 .53 3.96 1.53 5.69L.64 26l6.13-1.61a11.4 11.4 0 005.28 1.34h.01c6.25 0 11.33-5.08 11.33-11.33 0-3.03-1.18-5.87-3.32-8.01z"/>
                            </svg>
                            WhatsApp
                          </a>
                        )}
                      </>
                    )}
                    {s.email && (
                      <a href={`mailto:${s.email}`} className="text-sm text-blue-600 hover:underline">
                        {s.email}
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className="text-sm font-semibold text-green-600">~{s.distanceKm} km</span>
                  <a
                    href={mapsUrl(s)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    Directions ↗
                  </a>
                </div>
              </div>
            </div>
          ))}

          {/* CTA */}
          <div className="mt-8 bg-blue-700 rounded-2xl p-6 text-center text-white">
            <p className="font-bold text-lg mb-1">Ready to book lessons?</p>
            <p className="text-blue-100 text-sm mb-5">
              Practice the K53 theory while you wait for your first lesson — you need 75% to pass.
            </p>
            <Link
              href="/courses"
              className="inline-block bg-white text-blue-700 font-bold px-8 py-3 rounded-full hover:bg-blue-50 transition-colors"
            >
              Start K53 practice tests →
            </Link>
          </div>
        </div>
      )}

      {!loading && searched && results?.length === 0 && (
        <div className="mt-8 text-center text-gray-500 text-sm">
          No schools found. Try removing the licence code filter or searching a different location.
        </div>
      )}
    </div>
  )
}

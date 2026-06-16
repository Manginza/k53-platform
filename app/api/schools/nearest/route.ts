/**
 * GET /api/schools/nearest?lat=&lng=&limit=10&province=&code=
 * Returns the N nearest driving schools to the given coordinates.
 * Optional filters: province, licence code (e.g. "Code 10").
 */
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const lat      = parseFloat(searchParams.get('lat') ?? '')
  const lng      = parseFloat(searchParams.get('lng') ?? '')
  const limit    = Math.min(parseInt(searchParams.get('limit') ?? '10', 10), 30)
  const province = searchParams.get('province') ?? ''
  const code     = searchParams.get('code') ?? ''

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: 'lat and lng are required.' }, { status: 400 })
  }

  const supabase = createAdminClient()
  let query = supabase
    .from('driving_schools')
    .select('id,name,province,suburb,address,phone,email,licence_codes,hours,lat,lng,is_verified')

  if (province) query = query.eq('province', province)
  if (code)     query = query.contains('licence_codes', [code])

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const results = (data ?? [])
    .map(s => ({ ...s, distanceKm: haversineKm(lat, lng, s.lat, s.lng) }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit)
    .map(s => ({ ...s, distanceKm: Math.round(s.distanceKm * 10) / 10 }))

  return NextResponse.json({ results })
}

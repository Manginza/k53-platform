/**
 * GET /api/centers/nearest?lat=&lng=&limit=5&province=
 * Returns the N nearest DLTC centers to the given coordinates.
 * No external APIs — pure Haversine distance in JS.
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
  const limit    = Math.min(parseInt(searchParams.get('limit') ?? '5', 10), 20)
  const province = searchParams.get('province') ?? ''

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: 'lat and lng are required.' }, { status: 400 })
  }

  const supabase = createAdminClient()
  let query = supabase
    .from('dltc_centers')
    .select('id,name,province,address,phone,lat,lng,is_smart_hub')

  if (province) query = query.eq('province', province)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const results = (data ?? [])
    .map(c => ({ ...c, distanceKm: haversineKm(lat, lng, c.lat, c.lng) }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit)
    .map(c => ({ ...c, distanceKm: Math.round(c.distanceKm * 10) / 10 }))

  return NextResponse.json({ results })
}

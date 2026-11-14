'use client'

/**
 * Shows LiveSessionCard to full-access members only, decided in the browser
 * via /api/me/access. Lets otherwise-public pages (e.g. /courses) stay static
 * and cacheable instead of reading the session cookie on the server.
 */
import { useEffect, useState } from 'react'
import LiveSessionCard from '@/components/LiveSessionCard'
import { getAccessStatus } from '@/lib/access-cache'

export default function MemberLiveSessionCard({ className = '' }: { className?: string }) {
  const [show, setShow] = useState(false)
  useEffect(() => {
    let alive = true
    getAccessStatus().then(s => { if (alive) setShow(s.fullAccess) })
    return () => { alive = false }
  }, [])
  return show ? <LiveSessionCard className={className} /> : null
}

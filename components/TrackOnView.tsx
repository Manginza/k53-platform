'use client'

/**
 * TrackOnView — reports one analytics event when this part of a page appears.
 * Drop it inside any screen worth counting (pricing page, paywall, "payment
 * didn't go through"). Renders nothing, and reports once per appearance.
 */
import { useEffect } from 'react'
import { track } from '@/lib/analytics'

export default function TrackOnView({ event, params }: { event: string; params?: Record<string, string | number | boolean> }) {
  useEffect(() => {
    track(event, { page: window.location.pathname, ...params })
    // Once per mount: the params are fixed for the life of the screen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return null
}

'use client'

/**
 * AnalyticsEvents — one click listener for the whole site.
 *
 *   - Any element with data-track="<event>" reports that event when clicked.
 *     Optional data-track-location says WHERE on the site (qa_hero, pricing…),
 *     so two buttons with the same job can be compared.
 *   - Any link to WhatsApp reports `whatsapp_click`, with the page it was on,
 *     so no WhatsApp button can be added without being measured.
 *
 * Renders nothing. Mounted once in app/layout.tsx.
 */
import { useEffect } from 'react'
import { track } from '@/lib/analytics'

const WHATSAPP_HOST = /^(https?:)?\/\/(wa\.me|api\.whatsapp\.com|chat\.whatsapp\.com|web\.whatsapp\.com)\b/i

export default function AnalyticsEvents() {
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const target = e.target as Element | null
      if (!target?.closest) return

      const tagged = target.closest<HTMLElement>('[data-track]')
      if (tagged) {
        track(tagged.dataset.track!, {
          location: tagged.dataset.trackLocation,
          page: window.location.pathname,
        })
        return
      }

      const link = target.closest<HTMLAnchorElement>('a[href]')
      if (link && WHATSAPP_HOST.test(link.getAttribute('href') ?? '')) {
        const where = link.closest<HTMLElement>('[data-track-location]')?.dataset.trackLocation
        track('whatsapp_click', { location: where ?? 'other', page: window.location.pathname })
      }
    }
    document.addEventListener('click', onClick, { capture: true })
    return () => document.removeEventListener('click', onClick, { capture: true })
  }, [])

  return null
}

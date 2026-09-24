"use client"

import { useCallback, useEffect, useState } from 'react'
import { COOKIE_BANNER_ATTR, COOKIE_BANNER_EVENT } from '@/components/CookieBanner'

const POPUP_VERSION = 'v1'
const DISMISS_KEY = `sk_global_video_${POPUP_VERSION}`

const FIRST_DELAY_MS = 1000
const RETRY_MS = 1000
const MAX_WAIT_MS = 30000

function screenIsBusy(): boolean {
  return document.querySelector('.fixed.inset-0') !== null
    || document.querySelector(`[${COOKIE_BANNER_ATTR}]`) !== null
}

function cookieBannerHeight(): number {
  return document.querySelector<HTMLElement>(`[${COOKIE_BANNER_ATTR}]`)?.offsetHeight ?? 0
}

export default function GlobalVideoPopup() {
  const [open, setOpen] = useState(false)
  const [bottomInset, setBottomInset] = useState(0)

  useEffect(() => {
    try { if (localStorage.getItem(DISMISS_KEY)) return } catch {}

    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | undefined
    const giveUpAt = Date.now() + FIRST_DELAY_MS + MAX_WAIT_MS

    const attempt = () => {
      if (cancelled) return
      if (screenIsBusy() && Date.now() < giveUpAt) {
        timer = setTimeout(attempt, RETRY_MS)
        return
      }
      setBottomInset(cookieBannerHeight())
      setOpen(true)
    }

    timer = setTimeout(attempt, FIRST_DELAY_MS)
    return () => { cancelled = true; if (timer) clearTimeout(timer) }
  }, [])

  useEffect(() => {
    if (!open) return
    const remeasure = () => setBottomInset(cookieBannerHeight())
    window.addEventListener('resize', remeasure)
    window.addEventListener(COOKIE_BANNER_EVENT, remeasure)
    return () => {
      window.removeEventListener('resize', remeasure)
      window.removeEventListener(COOKIE_BANNER_EVENT, remeasure)
    }
  }, [open])

  const dismiss = useCallback(() => {
    try { localStorage.setItem(DISMISS_KEY, new Date().toISOString()) } catch {}
    setOpen(false)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') dismiss() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, dismiss])

  if (!open) return null

  const embed = 'https://www.youtube.com/embed/BlvhscOYDRQ?autoplay=1&rel=0'

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6 overflow-y-auto"
      style={{ paddingBottom: bottomInset ? bottomInset + 24 : undefined }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="sk-global-video-title"
    >
      <div className="fixed inset-0 bg-black/60" onClick={dismiss} />

      <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden animate-[fadeIn_0.2s_ease-out]">
        <div className="bg-black text-white px-5 pt-4 pb-3 text-center relative">
          <button
            onClick={dismiss}
            aria-label="Close"
            className="absolute top-3 right-4 text-white hover:text-white text-2xl leading-none"
          >×</button>
          <h2 id="sk-global-video-title" className="text-lg font-extrabold">Important message</h2>
        </div>

        <div className="px-4 py-4 sm:p-6">
          <div className="w-full aspect-w-16 aspect-h-9">
            <iframe
              src={embed}
              title="Announcement video"
              frameBorder={0}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full rounded-lg"
            />
          </div>

          <div className="mt-4">
            <button onClick={dismiss} className="block w-full bg-blue-700 text-white font-bold py-3 rounded-lg">Close</button>
          </div>
        </div>
      </div>
    </div>
  )
}

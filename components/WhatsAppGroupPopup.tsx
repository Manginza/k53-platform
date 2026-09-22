'use client'

/**
 * WhatsAppGroupPopup — invites a first-time visitor into the SK Driving
 * WhatsApp study group.
 *
 * Shown ONCE per visitor: the dismissal is remembered in localStorage, so
 * returning visitors are not nagged. They keep the invitation permanently
 * through WhatsAppJoinButton, which sits on every page.
 *
 * The layout already mounts several popups, all of them `fixed inset-0`
 * overlays that can fire on the same page load. Rather than stack a second
 * modal on top of one of those, this one waits its turn: it polls for an open
 * overlay and only shows once the screen is clear, giving up after
 * MAX_WAIT_MS so it never queues forever.
 *
 * Bump POPUP_VERSION to re-invite everyone, e.g. after a new group link.
 */
import { useCallback, useEffect, useState } from 'react'
import { WHATSAPP_GROUP_URL } from '@/lib/contact'
import { COOKIE_BANNER_ATTR, COOKIE_BANNER_EVENT } from '@/components/CookieBanner'
import WhatsAppIcon from '@/components/icons/WhatsAppIcon'

const POPUP_VERSION = 'v1'
const DISMISS_KEY = `sk_whatsapp_group_${POPUP_VERSION}`

/** Let the page paint and settle before interrupting. */
const FIRST_DELAY_MS = 2500
/** How often to re-check whether another popup is still on screen. */
const RETRY_MS = 2000
/** Stop waiting for a clear screen after this long. */
const MAX_WAIT_MS = 30000

/**
 * True while something else already owns the screen: another popup overlay,
 * or the cookie banner. The banner matters most here — it is showing for
 * exactly the same first-time visitor this popup targets, it sits at a higher
 * z-index, and on a narrow screen it is tall enough to cover this modal's
 * lower buttons. Waiting turns the collision into a sequence.
 */
function screenIsBusy(): boolean {
  return document.querySelector('.fixed.inset-0') !== null
    || document.querySelector(`[${COOKIE_BANNER_ATTR}]`) !== null
}

/** Height of the cookie banner right now, so the modal can clear it. */
function cookieBannerHeight(): number {
  return document.querySelector<HTMLElement>(`[${COOKIE_BANNER_ATTR}]`)?.offsetHeight ?? 0
}

export default function WhatsAppGroupPopup() {
  const [open, setOpen] = useState(false)
  /** Space kept clear at the bottom so the cookie banner never covers a button. */
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
      // Normally the wait above means nothing is left to clear. If we ran out
      // of patience while the banner is still up, sit above it instead.
      setBottomInset(cookieBannerHeight())
      setOpen(true)
    }

    timer = setTimeout(attempt, FIRST_DELAY_MS)
    return () => { cancelled = true; if (timer) clearTimeout(timer) }
  }, [])

  // Recentre if the banner is accepted or the viewport changes while open.
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

  // Escape closes, matching what people expect of a modal.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') dismiss() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, dismiss])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6 overflow-y-auto"
      style={{ paddingBottom: bottomInset ? bottomInset + 24 : undefined }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="sk-whatsapp-group-title"
    >
      {/* Fixed, not absolute: the wrapper scrolls on very short screens, and a
          scrolling backdrop would slide off the top of the viewport. */}
      <div className="fixed inset-0 bg-black/50" onClick={dismiss} />

      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-[fadeIn_0.2s_ease-out]">
        <div className="bg-green-600 text-white px-7 pt-8 pb-7 text-center relative">
          <button
            onClick={dismiss}
            aria-label="Close"
            className="absolute top-3 right-4 text-green-100 hover:text-white text-2xl leading-none"
          >×</button>

          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/15 mb-3">
            <WhatsAppIcon className="w-9 h-9" />
          </div>
          <h2 id="sk-whatsapp-group-title" className="text-2xl font-extrabold mb-1">
            Join our WhatsApp group
          </h2>
          <p className="text-sm text-green-100">
            Free study tips, test updates and help from other learners
          </p>
        </div>

        <div className="px-7 py-6">
          <ul className="space-y-2.5 text-sm text-gray-700 mb-6">
            <li className="flex gap-2.5"><span className="text-green-600 font-bold shrink-0">✓</span> Daily K53 questions and answers</li>
            <li className="flex gap-2.5"><span className="text-green-600 font-bold shrink-0">✓</span> Reminders before every live session</li>
            <li className="flex gap-2.5"><span className="text-green-600 font-bold shrink-0">✓</span> Ask questions and get help fast</li>
          </ul>

          <a
            href={WHATSAPP_GROUP_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={dismiss}
            className="flex items-center justify-center gap-2 w-full bg-green-600 text-white font-bold py-3.5 rounded-xl hover:bg-green-700 transition-colors"
          >
            <WhatsAppIcon className="w-5 h-5" />
            Join the group
          </a>
          <button
            onClick={dismiss}
            className="block w-full text-gray-500 font-medium py-3 mt-1 hover:text-gray-700 text-sm"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  )
}

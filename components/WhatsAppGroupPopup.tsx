'use client'

/**
 * WhatsAppGroupPopup — the first-visit popup.
 *
 * Normally it invites a visitor to book the Learners Licence class on WhatsApp
 * at the special R99 price, ONCE: the dismissal is remembered in localStorage
 * so returning visitors are not nagged.
 *
 * While a live takeover is running (see LIVE_TAKEOVER_UNTIL in lib/contact.ts)
 * the same popup promotes the live YouTube session instead. The two remember
 * their dismissals under separate keys, so someone who closes the live popup
 * tonight still gets the WhatsApp invite once the takeover ends, and the
 * takeover reverts on its own with no deploy.
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
import { LIVE_TAKEOVER_URL, WHATSAPP_CLASS_URL, isLiveTakeoverActive } from '@/lib/contact'
import { COOKIE_BANNER_ATTR, COOKIE_BANNER_EVENT } from '@/components/CookieBanner'
import WhatsAppIcon from '@/components/icons/WhatsAppIcon'

// Bumped to v2 to re-show the popup to everyone for the Learners Licence class
// offer (previously the WhatsApp study-group invite).
const POPUP_VERSION = 'v2'
const GROUP_DISMISS_KEY = `sk_whatsapp_group_${POPUP_VERSION}`
/** Separate key: closing the live popup must not use up the group invite. */
const LIVE_DISMISS_KEY = `sk_live_takeover_${POPUP_VERSION}`

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

function PlayIcon({ className = 'w-9 h-9' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5.14v13.72c0 .79.87 1.27 1.54.84l10.8-6.86a1 1 0 000-1.68L9.54 4.3A1 1 0 008 5.14z" />
    </svg>
  )
}

export default function WhatsAppGroupPopup() {
  const [open, setOpen] = useState(false)
  /** Which campaign is showing. Decided on the client, where the clock is. */
  const [live, setLive] = useState(false)
  /** Space kept clear at the bottom so the cookie banner never covers a button. */
  const [bottomInset, setBottomInset] = useState(0)

  useEffect(() => {
    const isLive = isLiveTakeoverActive()
    const key = isLive ? LIVE_DISMISS_KEY : GROUP_DISMISS_KEY
    try { if (localStorage.getItem(key)) return } catch {}

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
      setLive(isLive)
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
    try { localStorage.setItem(live ? LIVE_DISMISS_KEY : GROUP_DISMISS_KEY, new Date().toISOString()) } catch {}
    setOpen(false)
  }, [live])

  // Escape closes, matching what people expect of a modal.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') dismiss() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, dismiss])

  if (!open) return null

  const accent = live
    ? { header: 'bg-red-600', sub: 'text-red-100', close: 'text-red-100', tick: 'text-red-600', button: 'bg-red-600 hover:bg-red-700' }
    : { header: 'bg-green-600', sub: 'text-green-100', close: 'text-green-100', tick: 'text-green-600', button: 'bg-green-600 hover:bg-green-700' }

  const content = live
    ? {
        href: LIVE_TAKEOVER_URL,
        title: 'Learners Licence lesson tonight at 9pm',
        subtitle: 'Free live lesson on YouTube — join us at 9pm',
        bullets: [
          'Starts 9pm tonight',
          'Work through K53 questions with us live',
          'Free to watch — tap to set your reminder on YouTube',
        ],
        cta: 'Watch live on YouTube',
      }
    : {
        href: WHATSAPP_CLASS_URL,
        title: 'Join our Learners Licence class',
        subtitle: 'Now just R99 — down from R150. Text us on WhatsApp to book your spot.',
        bullets: [
          'Special price: R99 (was R150)',
          'Guided Learners Licence class',
          'Book by texting us on WhatsApp: +27 63 172 1259',
        ],
        cta: 'Book on WhatsApp for R99',
      }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6 overflow-y-auto"
      style={{ paddingBottom: bottomInset ? bottomInset + 24 : undefined }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="sk-popup-title"
    >
      {/* Fixed, not absolute: the wrapper scrolls on very short screens, and a
          scrolling backdrop would slide off the top of the viewport. */}
      <div className="fixed inset-0 bg-black/50" onClick={dismiss} />

      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-[fadeIn_0.2s_ease-out]">
        <div className={`${accent.header} text-white px-7 pt-8 pb-7 text-center relative`}>
          <button
            onClick={dismiss}
            aria-label="Close"
            className={`absolute top-3 right-4 ${accent.close} hover:text-white text-2xl leading-none`}
          >×</button>

          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/15 mb-3">
            {live ? <PlayIcon className="w-9 h-9" /> : <WhatsAppIcon className="w-9 h-9" />}
          </div>
          <h2 id="sk-popup-title" className="text-2xl font-extrabold mb-1">{content.title}</h2>
          <p className={`text-sm ${accent.sub}`}>{content.subtitle}</p>
        </div>

        <div className="px-7 py-6">
          <ul className="space-y-2.5 text-sm text-gray-700 mb-6">
            {content.bullets.map(b => (
              <li key={b} className="flex gap-2.5">
                <span className={`${accent.tick} font-bold shrink-0`}>✓</span> {b}
              </li>
            ))}
          </ul>

          <a
            href={content.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={dismiss}
            className={`flex items-center justify-center gap-2 w-full ${accent.button} text-white font-bold py-3.5 rounded-xl transition-colors`}
          >
            {live ? <PlayIcon className="w-5 h-5" /> : <WhatsAppIcon className="w-5 h-5" />}
            {content.cta}
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

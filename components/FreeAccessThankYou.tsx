'use client'

/**
 * FreeAccessThankYou — thanks people who used a free-access window, once it
 * closes, and offers them the way to keep going: card payment through Yoco,
 * or WhatsApp.
 *
 * Who sees it: a browser that was on the site WHILE a free window was open,
 * that does not have paid access, during the 48 hours after the window ends.
 * Someone who never came during the free window is not thanked for using it,
 * and a paying member is never asked to pay.
 *
 * When: on their next visit after the window closes — or, if they still have
 * the site open at closing time, at that moment, so the switch from free to
 * paid is explained rather than simply hitting a paywall.
 *
 * Once per free window. Everything keys off the window's end time, so the
 * next free evening thanks the same visitor again without any code change.
 */
import { useCallback, useEffect, useState } from 'react'
import BuyAccessButton from '@/components/BuyAccessButton'
import WhatsAppIcon from '@/components/icons/WhatsAppIcon'
import {
  ACCESS_DURATION_DAYS, ACCESS_PRICE, ACCESS_PRICE_ORIGINAL, WHATSAPP_URL,
} from '@/lib/contact'

/** How long after a free window closes we still say thank you. */
const THANK_FOR_MS = 48 * 60 * 60 * 1000
/** Small grace past closing so the server has definitely stopped granting free access. */
const AFTER_CLOSE_MS = 3000
/** Wait for any other overlay to clear before interrupting. */
const RETRY_MS = 2000
const MAX_WAIT_MS = 30000

const usedKey  = (until: string) => `sk_free_window_used_${until}`
const thanksKey = (until: string) => `sk_free_window_thanks_${until}`

function readKey(key: string): boolean {
  try { return !!localStorage.getItem(key) } catch { return false }
}
function writeKey(key: string) {
  try { localStorage.setItem(key, new Date().toISOString()) } catch {}
}

/** True while another full-screen popup is already showing. */
function screenIsBusy(): boolean {
  return document.querySelector('.fixed.inset-0:not([data-sk-thanks])') !== null
}

export default function FreeAccessThankYou() {
  const [until, setUntil] = useState('')
  const [open, setOpen] = useState(false)

  /** Show the message if this visitor has not paid. Checks access fresh, never from cache. */
  const showIfNotPaid = useCallback(async (windowUntil: string) => {
    if (readKey(thanksKey(windowUntil))) return
    try {
      const res = await fetch('/api/me/access', { cache: 'no-store' })
      const access = await res.json()
      if (access?.fullAccess) return          // paid member, or another free window has opened
    } catch { return }                       // unsure — do not pester

    const giveUpAt = Date.now() + MAX_WAIT_MS
    const attempt = () => {
      if (screenIsBusy() && Date.now() < giveUpAt) { setTimeout(attempt, RETRY_MS); return }
      setUntil(windowUntil)
      setOpen(true)
    }
    attempt()
  }, [])

  useEffect(() => {
    let closeTimer: ReturnType<typeof setTimeout> | undefined
    let cancelled = false

    fetch('/api/promo', { cache: 'no-store' })
      .then(r => r.json())
      .then((d: { from?: string; until?: string }) => {
        if (cancelled || !d?.until) return
        const now = Date.now()
        const from = d.from ? Date.parse(d.from) : 0
        const end = Date.parse(d.until)
        if (!Number.isFinite(end)) return

        if (now >= from && now < end) {
          // Free window open now: remember this visitor used it, and if they
          // are still here when it closes, thank them right then.
          writeKey(usedKey(d.until))
          closeTimer = setTimeout(() => { void showIfNotPaid(d.until!) }, end - now + AFTER_CLOSE_MS)
          return
        }

        if (now >= end && now < end + THANK_FOR_MS && readKey(usedKey(d.until))) {
          void showIfNotPaid(d.until)
        }
      })
      .catch(() => {})

    return () => { cancelled = true; if (closeTimer) clearTimeout(closeTimer) }
  }, [showIfNotPaid])

  const dismiss = useCallback(() => {
    if (until) writeKey(thanksKey(until))
    setOpen(false)
  }, [until])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') dismiss() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, dismiss])

  if (!open) return null

  return (
    <div
      data-sk-thanks
      className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sk-thanks-title"
    >
      <div className="fixed inset-0 bg-black/50" onClick={dismiss} />

      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-[fadeIn_0.2s_ease-out]">
        <div className="bg-blue-700 text-white px-7 pt-8 pb-7 text-center relative">
          <button
            onClick={dismiss}
            aria-label="Close"
            className="absolute top-3 right-4 text-blue-200 hover:text-white text-2xl leading-none"
          >×</button>
          <div className="text-5xl mb-3" aria-hidden="true">🙏</div>
          <h2 id="sk-thanks-title" className="text-2xl font-extrabold mb-1">
            Thank you for studying with us!
          </h2>
          <p className="text-sm text-blue-100">
            We hope the free access helped you prepare for your learner&apos;s licence.
          </p>
        </div>

        <div className="px-7 py-6 text-center">
          <p className="text-sm text-gray-700 mb-1">
            Keep going with <strong>full access, 24 hours a day, for {ACCESS_DURATION_DAYS} days</strong>.
          </p>
          <p className="text-sm text-gray-500 mb-5">
            Practice tests, Live Notes, videos and resources — for{' '}
            <span className="line-through text-gray-400">{ACCESS_PRICE_ORIGINAL}</span>{' '}
            <strong className="text-blue-700 text-base">{ACCESS_PRICE}</strong>.
          </p>

          {/* Card payment through Yoco. Handles sign-in / registration itself. */}
          <div onClickCapture={() => { if (until) writeKey(thanksKey(until)) }}>
            <BuyAccessButton />
          </div>

          <div className="flex items-center gap-3 my-4">
            <span className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 uppercase tracking-wide">or</span>
            <span className="flex-1 h-px bg-gray-200" />
          </div>

          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={dismiss}
            className="flex items-center justify-center gap-2 w-full border-2 border-green-600 text-green-700 font-semibold py-3 rounded-xl hover:bg-green-50 transition-colors"
          >
            <WhatsAppIcon className="w-5 h-5" />
            Pay via WhatsApp instead
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

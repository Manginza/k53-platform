'use client'

/**
 * EachOncePopup — invites visitors who are not logged in to the Each Once
 * Special: register free and take every Code 8 / Code 10 test once.
 *
 * Shows once per browser session (sessionStorage), never to a signed-in
 * visitor, and not on the auth / quiz / admin pages where it would get in the
 * way. It waits for any other overlay or the cookie banner to clear before
 * opening, so it never stacks on top of them.
 */
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { COOKIE_BANNER_ATTR } from '@/components/CookieBanner'
import { EACH_ONCE_REGISTER_URL, ACCESS_PRICE } from '@/lib/contact'

const DISMISS_KEY = 'sk_each_once_v1'
const FIRST_DELAY_MS = 1500
const RETRY_MS = 2000
const HIDDEN_ON = ['/register', '/login', '/quiz', '/admin', '/forgot-password', '/reset-password', '/subscribe', '/t/']

function screenIsBusy(): boolean {
  return document.querySelector('.fixed.inset-0') !== null
    || document.querySelector(`[${COOKIE_BANNER_ATTR}]`) !== null
}

export default function EachOncePopup() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (HIDDEN_ON.some(p => pathname?.startsWith(p))) return
    try { if (sessionStorage.getItem(DISMISS_KEY)) return } catch {}

    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | undefined

    // Keep waiting while another popup or the cookie banner is up: a first
    // visit always shows the banner, and that visitor is exactly who we want.
    const attempt = () => {
      if (cancelled) return
      if (screenIsBusy()) { timer = setTimeout(attempt, RETRY_MS); return }
      setOpen(true)
    }

    createClient().auth.getSession().then(({ data }) => {
      if (cancelled || data.session) return
      timer = setTimeout(attempt, FIRST_DELAY_MS)
    }).catch(() => {})

    return () => { cancelled = true; if (timer) clearTimeout(timer) }
  }, [pathname])

  const dismiss = useCallback(() => {
    try { sessionStorage.setItem(DISMISS_KEY, new Date().toISOString()) } catch {}
    setOpen(false)
  }, [])

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
      role="dialog"
      aria-modal="true"
      aria-labelledby="each-once-title"
    >
      <div className="fixed inset-0 bg-black/50" onClick={dismiss} />

      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-[fadeIn_0.2s_ease-out]">
        <div className="bg-blue-700 text-white px-7 pt-8 pb-7 text-center relative">
          <button onClick={dismiss} aria-label="Close" className="absolute top-3 right-4 text-blue-200 hover:text-white text-2xl leading-none">×</button>
          <div className="inline-block bg-accent-400 text-brand-900 text-[11px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full mb-3">
            Each Once Special
          </div>
          <h2 id="each-once-title" className="text-2xl font-extrabold mb-1">Try every practice test free — once</h2>
          <p className="text-sm text-blue-100">Code 8 and Code 10. Register free, no payment needed.</p>
        </div>

        <div className="px-7 py-6">
          <ul className="space-y-2.5 text-sm text-gray-700 mb-6">
            {[
              'Take Code 8 Tests 1–3 and Code 10 Tests 1–3, each once, full length',
              'Get your combined score across all the tests',
              `Like it? Unlock unlimited retakes until you pass for ${ACCESS_PRICE}`,
            ].map(b => (
              <li key={b} className="flex gap-2.5">
                <span className="text-green-600 font-bold shrink-0">✓</span> {b}
              </li>
            ))}
          </ul>

          <Link
            href={EACH_ONCE_REGISTER_URL}
            onClick={dismiss}
            className="block w-full bg-green-600 hover:bg-green-700 text-white text-center font-bold py-3.5 rounded-xl transition-colors"
          >
            Register free
          </Link>
          <Link
            href="/login?next=/courses"
            onClick={dismiss}
            className="block w-full text-center text-blue-700 font-semibold py-3 mt-1 hover:underline text-sm"
          >
            Already registered? Log in
          </Link>
          <button onClick={dismiss} className="block w-full text-gray-500 font-medium py-2 hover:text-gray-700 text-sm">
            Maybe later
          </button>
        </div>
      </div>
    </div>
  )
}

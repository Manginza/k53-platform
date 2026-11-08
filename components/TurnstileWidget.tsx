'use client'

/**
 * TurnstileWidget — the Cloudflare CAPTCHA box for sign-up and password reset.
 *
 * Renders nothing until NEXT_PUBLIC_TURNSTILE_SITE_KEY is set when the site is
 * built, so the forms work unchanged until the keys are added. When it is
 * shown, onToken receives a token once the person passes the check, and ''
 * when it expires or fails.
 */
import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string
      reset: (id?: string) => void
    }
  }
}

const SCRIPT = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
export const TURNSTILE_ENABLED = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY)

export default function TurnstileWidget({ onToken }: { onToken: (token: string) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const widgetId = useRef<string | null>(null)
  const callback = useRef(onToken)
  callback.current = onToken

  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
    if (!siteKey || !ref.current) return

    const render = () => {
      if (!ref.current || !window.turnstile || widgetId.current) return
      widgetId.current = window.turnstile.render(ref.current, {
        sitekey: siteKey,
        callback: (token: string) => callback.current(token),
        'expired-callback': () => callback.current(''),
        'error-callback': () => callback.current(''),
      })
    }

    if (window.turnstile) { render(); return }
    let script = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT}"]`)
    if (!script) {
      script = document.createElement('script')
      script.src = SCRIPT
      script.async = true
      document.head.appendChild(script)
    }
    script.addEventListener('load', render)
    return () => script?.removeEventListener('load', render)
  }, [])

  if (!TURNSTILE_ENABLED) return null
  return <div ref={ref} className="flex justify-center" />
}

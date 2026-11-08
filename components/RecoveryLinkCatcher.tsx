'use client'

/**
 * RecoveryLinkCatcher — makes sure a password-reset link always ends on the
 * "Set a new password" page.
 *
 * When Supabase does not accept a reset link's return address, it sends the
 * person to the site's homepage instead, with the login tokens (or an
 * "expired link" error) after the # in the address. The homepage ignores
 * them, so the person never gets to choose a password, cannot log in, and
 * ends up sending proof of payment again and again.
 *
 * This runs on every page. If the address carries a recovery login or an
 * auth-link error, it forwards everything to /reset-password, which knows
 * how to use it. It renders nothing.
 */
import { useEffect } from 'react'

export default function RecoveryLinkCatcher() {
  useEffect(() => {
    if (window.location.pathname === '/reset-password') return
    const raw = window.location.hash.replace(/^#/, '')
    if (!raw) return
    const hash = new URLSearchParams(raw)

    const isRecoveryLogin = hash.get('type') === 'recovery' && !!hash.get('access_token')
    const isLinkError = !!hash.get('error_code') && /otp|link|access_denied/i.test(`${hash.get('error_code')} ${hash.get('error')}`)
    if (!isRecoveryLogin && !isLinkError) return

    window.location.replace(`/reset-password${window.location.search}#${raw}`)
  }, [])

  return null
}

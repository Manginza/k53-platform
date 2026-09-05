/**
 * lib/email.ts — transactional email.
 *
 * The site had no email sending of its own before this; the only mail it
 * produced came from Supabase Auth (confirmations and password resets).
 * Sending an access code needs a real transactional sender, so this wraps
 * one behind a small interface.
 *
 * It is deliberately safe to deploy unconfigured. With no RESEND_API_KEY it
 * reports that it is not set up and sends nothing, rather than throwing. An
 * access code is a fallback on top of access that was already granted, so a
 * missing mail provider must never be able to fail a payment.
 *
 * To turn it on:
 *   1. Create a Resend account and verify the sending domain.
 *   2. Set RESEND_API_KEY in Vercel, for Production and Preview.
 *   3. Set EMAIL_FROM to an address on the verified domain,
 *      e.g. "SK Driving <noreply@skdriving.co.za>".
 *
 * Swapping provider means replacing deliver() and nothing else.
 */

const RESEND_ENDPOINT = 'https://api.resend.com/emails'

export type EmailResult =
  | { sent: true; id: string | null }
  | { sent: false; reason: 'not_configured' | 'failed'; detail?: string }

export interface EmailMessage {
  to: string
  subject: string
  /** Plain text. Always sent, and the only part some clients will show. */
  text: string
  /** Optional HTML alternative. */
  html?: string
}

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && senderAddress())
}

function senderAddress(): string | null {
  return process.env.EMAIL_FROM ?? null
}

/**
 * Sends one message. Never throws — the caller is always in the middle of
 * something more important than an email.
 */
export async function sendEmail(message: EmailMessage): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY
  const from = senderAddress()
  if (!apiKey || !from) {
    console.warn('[email] not configured — set RESEND_API_KEY and EMAIL_FROM to send', {
      to: message.to, subject: message.subject,
    })
    return { sent: false, reason: 'not_configured' }
  }

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [message.to],
        subject: message.subject,
        text: message.text,
        ...(message.html ? { html: message.html } : {}),
      }),
    })
    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      console.error('[email] send failed', { status: res.status, detail: detail.slice(0, 300) })
      return { sent: false, reason: 'failed', detail: `${res.status}` }
    }
    const body = await res.json().catch(() => null) as { id?: string } | null
    return { sent: true, id: body?.id ?? null }
  } catch (error) {
    console.error('[email] send threw', error instanceof Error ? error.message : error)
    return { sent: false, reason: 'failed', detail: error instanceof Error ? error.message : undefined }
  }
}

/**
 * lib/whatsapp/api.ts — thin client for the WhatsApp Cloud API (Meta).
 *
 * Configuration (Vercel environment variables, never in code):
 *   WHATSAPP_TOKEN            access token for the WhatsApp app (a permanent
 *                             System User token for production)
 *   WHATSAPP_PHONE_NUMBER_ID  the id of the sending number (not the number itself)
 *   WHATSAPP_APP_SECRET       the Meta app secret, used to check that webhook
 *                             calls really come from Meta
 *   WHATSAPP_VERIFY_TOKEN     any long random string, entered in Meta's webhook
 *                             settings so Meta can confirm the webhook URL
 *   WHATSAPP_GRAPH_VERSION    optional, e.g. v23.0 (use the one Meta's dashboard shows)
 *
 * Until these are set the bot stays switched off: the webhook refuses calls
 * and nothing is sent.
 */
import { createHmac, timingSafeEqual } from 'crypto'

/**
 * Reads a setting with any pasted space or line break removed. A stray space
 * in a token or secret would otherwise make every call fail.
 */
export function setting(name: string): string {
  return (process.env[name] ?? '').trim()
}

const GRAPH_VERSION = setting('WHATSAPP_GRAPH_VERSION') || 'v23.0'

export function isWhatsAppConfigured(): boolean {
  return Boolean(
    setting('WHATSAPP_TOKEN') &&
    setting('WHATSAPP_PHONE_NUMBER_ID') &&
    setting('WHATSAPP_APP_SECRET') &&
    setting('WHATSAPP_VERIFY_TOKEN'),
  )
}

/** True when `signatureHeader` (X-Hub-Signature-256) matches the raw body. */
export function verifySignature(rawBody: string, signatureHeader: string | null): boolean {
  const secret = setting('WHATSAPP_APP_SECRET')
  if (!secret || !signatureHeader?.startsWith('sha256=')) return false
  const expected = createHmac('sha256', secret).update(rawBody, 'utf8').digest()
  let given: Buffer
  try { given = Buffer.from(signatureHeader.slice(7), 'hex') } catch { return false }
  return given.length === expected.length && timingSafeEqual(given, expected)
}

/** WhatsApp limits. Text beyond them is rejected by the API, so trim first. */
export const LIMITS = { body: 1024, text: 4096, buttonTitle: 20, footer: 60, ctaText: 20, rowTitle: 24, rowDescription: 72 }

export function clip(text: string, max: number): string {
  return text.length <= max ? text : text.slice(0, max - 1).trimEnd() + '…'
}

/** Public image URLs may contain spaces (e.g. "code10/test 1/…"). */
export function safeImageUrl(url: string): string {
  try { return new URL(url).href } catch { return encodeURI(url) }
}

type Payload = Record<string, unknown>

async function send(to: string, message: Payload): Promise<boolean> {
  const token = setting('WHATSAPP_TOKEN')
  const phoneId = setting('WHATSAPP_PHONE_NUMBER_ID')
  if (!token || !phoneId) {
    console.warn('[whatsapp] not configured, message not sent')
    return false
  }
  try {
    const res = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${phoneId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messaging_product: 'whatsapp', recipient_type: 'individual', to, ...message }),
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      // Never retried: a failed send is logged and the learner can simply reply again.
      console.error('[whatsapp] send failed', { status: res.status, detail: detail.slice(0, 400) })
      return false
    }
    return true
  } catch (error) {
    console.error('[whatsapp] send threw', error instanceof Error ? error.message : error)
    return false
  }
}

export function sendText(to: string, text: string) {
  return send(to, { type: 'text', text: { body: clip(text, LIMITS.text), preview_url: false } })
}

export interface Button { id: string; title: string }

/** Up to three reply buttons, with an optional image above the text. */
export function sendButtons(to: string, body: string, buttons: Button[], opts: { imageUrl?: string | null; footer?: string } = {}) {
  return send(to, {
    type: 'interactive',
    interactive: {
      type: 'button',
      ...(opts.imageUrl ? { header: { type: 'image', image: { link: safeImageUrl(opts.imageUrl) } } } : {}),
      body: { text: clip(body, LIMITS.body) },
      ...(opts.footer ? { footer: { text: clip(opts.footer, LIMITS.footer) } } : {}),
      action: {
        buttons: buttons.slice(0, 3).map(b => ({ type: 'reply', reply: { id: b.id, title: clip(b.title, LIMITS.buttonTitle) } })),
      },
    },
  })
}

export interface ListRow { id: string; title: string; description?: string }

/** A menu that opens a list of up to ten choices. */
export function sendList(to: string, body: string, buttonText: string, sectionTitle: string, rows: ListRow[]) {
  return send(to, {
    type: 'interactive',
    interactive: {
      type: 'list',
      body: { text: clip(body, LIMITS.body) },
      action: {
        button: clip(buttonText, LIMITS.buttonTitle),
        sections: [{
          title: clip(sectionTitle, LIMITS.rowTitle),
          rows: rows.slice(0, 10).map(r => ({
            id: r.id,
            title: clip(r.title, LIMITS.rowTitle),
            ...(r.description ? { description: clip(r.description, LIMITS.rowDescription) } : {}),
          })),
        }],
      },
    },
  })
}

/** A message with one button that opens a web page. */
export function sendLinkButton(to: string, body: string, buttonText: string, url: string) {
  return send(to, {
    type: 'interactive',
    interactive: {
      type: 'cta_url',
      body: { text: clip(body, LIMITS.body) },
      action: { name: 'cta_url', parameters: { display_text: clip(buttonText, LIMITS.ctaText), url } },
    },
  })
}

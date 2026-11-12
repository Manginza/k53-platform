/**
 * /api/whatsapp/webhook — where Meta delivers WhatsApp messages.
 *
 * GET  — Meta's one-off check when the webhook URL is saved in the app
 *        dashboard: echo hub.challenge if hub.verify_token matches.
 * POST — incoming messages. The body must carry a valid X-Hub-Signature-256
 *        made with the app secret, otherwise it is rejected. Each message id
 *        is handled once (Meta retries deliveries), and the reply is sent
 *        before answering 200 so the conversation stays in order.
 *
 * Switched off (503) until the WHATSAPP_* environment variables are set.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { isWhatsAppConfigured, verifySignature, sendText, setting } from '@/lib/whatsapp/api'
import { handleIncoming } from '@/lib/whatsapp/bot'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams
  // .trim() ignores a space or line break that slipped in while pasting the
  // phrase into Vercel or Meta.
  const expected = setting('WHATSAPP_VERIFY_TOKEN')
  const given = p.get('hub.verify_token')?.trim()
  if (expected && p.get('hub.mode') === 'subscribe' && given === expected) {
    return new NextResponse(p.get('hub.challenge') ?? '', { status: 200, headers: { 'Content-Type': 'text/plain' } })
  }
  return new NextResponse('Forbidden', { status: 403 })
}

interface WaMessage {
  id: string
  from: string
  type: string
  text?: { body?: string }
  interactive?: { type?: string; button_reply?: { id?: string }; list_reply?: { id?: string } }
  button?: { payload?: string; text?: string }
}

interface WaChangeValue {
  metadata?: { phone_number_id?: string }
  contacts?: { wa_id?: string; profile?: { name?: string } }[]
  messages?: WaMessage[]
}

export async function POST(req: NextRequest) {
  if (!isWhatsAppConfigured()) return new NextResponse('WhatsApp is not configured', { status: 503 })

  const raw = await req.text()
  const signature = req.headers.get('x-hub-signature-256')
  if (!verifySignature(raw, signature)) {
    // Logged so a wrong WHATSAPP_APP_SECRET shows up in the Vercel logs.
    // Only whether a signature was present is logged, never any secret.
    console.warn('[whatsapp] signature check failed', {
      signaturePresent: Boolean(signature),
      fromMeta: /facebook/i.test(req.headers.get('user-agent') ?? ''),
    })
    return new NextResponse('Invalid signature', { status: 401 })
  }

  let payload: { entry?: { changes?: { value?: WaChangeValue }[] }[] }
  try { payload = JSON.parse(raw) } catch { return new NextResponse('Bad JSON', { status: 400 }) }

  const db = createAdminClient()
  const ourNumberId = setting('WHATSAPP_PHONE_NUMBER_ID')

  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value
      if (!value?.messages?.length) continue                     // delivery/read receipts: nothing to do
      console.log('[whatsapp] message received', { count: value.messages.length, forNumberId: value.metadata?.phone_number_id })
      if (value.metadata?.phone_number_id !== ourNumberId) {
        // A Phone Number ID is not a secret, so both are logged to spot a typo.
        console.warn('[whatsapp] message for a different Phone Number ID', {
          received: value.metadata?.phone_number_id,
          configured: ourNumberId,
        })
        continue
      }

      for (const m of value.messages) {
        // Handle each message once, whatever Meta retries.
        // Only a true duplicate is skipped. If the record itself fails, the
        // message is still answered: the bot's position check already stops a
        // repeated tap from counting twice.
        const { error: seen } = await db.from('wa_processed_messages').insert({ message_id: m.id })
        if (seen?.code === '23505') continue
        if (seen) console.error('[whatsapp] dedupe insert failed', seen.message)

        const profileName = value.contacts?.find(c => c.wa_id === m.from)?.profile?.name
        const replyId = m.interactive?.button_reply?.id ?? m.interactive?.list_reply?.id ?? m.button?.payload
        const text = m.text?.body ?? m.button?.text

        try {
          if (!replyId && text == null) {
            await sendText(m.from, 'I can only read taps and short text replies. Type MENU to choose a test.')
            continue
          }
          await handleIncoming({ waId: m.from, profileName, text, replyId })
        } catch (error) {
          // Logged, not retried: answering 200 stops Meta re-sending the same message.
          console.error('[whatsapp] handling failed', { id: m.id, error: error instanceof Error ? error.message : error })
          await sendText(m.from, 'Sorry, something went wrong on our side. Please type MENU to carry on.').catch(() => {})
        }
      }
    }
  }

  return NextResponse.json({ ok: true })
}

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
 * This path is excluded from the auth middleware: Meta does not send a session.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { serviceRoleKeyCheck } from '@/lib/payments-health'
import { allow } from '@/lib/rate-limit'
import { isWhatsAppConfigured, markRead, sendText, setting, verifySignature } from '@/lib/whatsapp/api'
import { handleIncoming } from '@/lib/whatsapp/bot'
import { maskNumber, readLearnerMessage } from '@/lib/whatsapp/messages'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

let serviceKeyWarned = false

function warnIfServiceKeyWrong() {
  if (serviceKeyWarned) return
  serviceKeyWarned = true
  const check = serviceRoleKeyCheck(process.env.SUPABASE_SERVICE_ROLE_KEY)
  if (check.status !== 'ok') {
    console.error('[whatsapp] supabase key', { status: check.status, detail: check.detail })
  }
}

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams
  // .trim() ignores a space or line break that slipped in while pasting the
  // phrase into Vercel or Meta.
  const expected = setting('WHATSAPP_VERIFY_TOKEN')
  const given = p.get('hub.verify_token')?.trim()
  if (expected && p.get('hub.mode') === 'subscribe' && given === expected) {
    return new NextResponse(p.get('hub.challenge') ?? '', { status: 200, headers: { 'Content-Type': 'text/plain' } })
  }
  console.warn('[whatsapp] verify failed', {
    mode: p.get('hub.mode'),
    tokenPresent: Boolean(given),
    configured: Boolean(expected),
  })
  return new NextResponse('Forbidden', { status: 403 })
}

interface WaMessage {
  id?: string
  from?: string
  type?: string
  text?: { body?: string }
  interactive?: { type?: string; button_reply?: { id?: string }; list_reply?: { id?: string } }
  button?: { payload?: string; text?: string }
}

interface WaChangeValue {
  metadata?: { phone_number_id?: string }
  contacts?: { wa_id?: string; profile?: { name?: string } }[]
  messages?: WaMessage[]
  errors?: { code?: number; title?: string }[]
}

export async function POST(req: NextRequest) {
  if (!isWhatsAppConfigured()) return new NextResponse('WhatsApp is not configured', { status: 503 })
  warnIfServiceKeyWrong()

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
      if (!value) continue
      if (value.errors?.length) {
        console.error('[whatsapp] payload error', value.errors.map(error => ({ code: error.code, title: error.title })))
      }
      if (!value.messages?.length) continue
      console.log('[whatsapp] message received', { count: value.messages.length, forNumberId: value.metadata?.phone_number_id })
      if (value.metadata?.phone_number_id !== ourNumberId) {
        // A Phone Number ID is not a secret, so both are logged to spot a typo.
        console.warn('[whatsapp] message for a different Phone Number ID', {
          received: value.metadata?.phone_number_id,
          configured: ourNumberId,
        })
        continue
      }

      for (const message of value.messages) {
        if (!message.id || !message.from) {
          console.warn('[whatsapp] message missing id or sender')
          continue
        }
        const from = message.from
        const read = markRead(message.id)

        // Handle each message once, whatever Meta retries.
        // Only a true duplicate is skipped. If the record itself fails, the
        // message is still answered: the bot's position check already stops a
        // repeated tap from counting twice.
        const { error: seen } = await db.from('wa_processed_messages').insert({ message_id: message.id })
        if (seen?.code === '23505') {
          console.log('[whatsapp] duplicate delivery skipped', { id: message.id })
          await read
          continue
        }
        if (seen) console.error('[whatsapp] dedupe insert failed', seen.message)

        if (!allow(`wa:${from}`, 30, 60_000)) {
          console.warn('[whatsapp] rate limit', { wa: maskNumber(from) })
          await sendText(from, 'Please wait a moment, then type MENU to carry on.').catch(() => {})
          await read
          continue
        }

        const contact = value.contacts?.find(item => item.wa_id === from)
          ?? (value.contacts?.length === 1 ? value.contacts[0] : undefined)
        const parsed = readLearnerMessage(message)

        try {
          if (parsed.action === 'ignore') {
            console.log('[whatsapp] ignored', { type: message.type, wa: maskNumber(from) })
          } else if (parsed.action === 'unsupported') {
            await sendText(from, 'I can only read taps and short text replies. Type MENU to choose a test.')
          } else {
            await handleIncoming({
              waId: from,
              profileName: contact?.profile?.name,
              text: parsed.text,
              replyId: parsed.replyId,
            })
          }
        } catch (error) {
          // Logged, not retried: answering 200 stops Meta re-sending the same message.
          console.error('[whatsapp] handling failed', { id: message.id, error: error instanceof Error ? error.message : error })
          await sendText(from, 'Sorry, something went wrong on our side. Please type MENU to carry on.').catch(() => {})
        }
        await read
      }
    }
  }

  return NextResponse.json({ ok: true })
}

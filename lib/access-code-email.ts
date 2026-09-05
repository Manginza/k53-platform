/**
 * lib/access-code-email.ts — the message a buyer gets with their code.
 *
 * Written for someone whose access DID unlock normally, which is most
 * people: it reads as a receipt they can file, and the code is presented as
 * a spare key rather than something they must act on. The instructions only
 * matter to the minority whose access did not appear, and burying them would
 * leave exactly those people stuck.
 */
import { sendEmail, type EmailResult } from '@/lib/email'

export interface AccessCodeEmailParams {
  to: string
  code: string
  durationDays: number
  /** Origin of the site the buyer paid on, e.g. https://www.skdriving.co.za */
  baseUrl: string
}

export function accessCodeEmailText({ code, durationDays, baseUrl }: Omit<AccessCodeEmailParams, 'to'>): string {
  return [
    'Thanks for your payment.',
    '',
    `Your full access is active for ${durationDays} days. If you can already see your`,
    'courses and notes, there is nothing to do — keep this email in case you need it.',
    '',
    `Your access code: ${code}`,
    '',
    'If your access is NOT showing:',
    `  1. Go to ${baseUrl}/access-code`,
    '  2. Sign in with the account you want to unlock',
    '  3. Enter the code above',
    '',
    'The code works once, on whichever account you are signed in to. That matters',
    'if you happen to have signed up with more than one email address.',
    '',
    'Still stuck? Reply to this email or message us on WhatsApp and we will sort it out.',
    '',
    'SK Driving',
  ].join('\n')
}

export function accessCodeEmailHtml({ code, durationDays, baseUrl }: Omit<AccessCodeEmailParams, 'to'>): string {
  const url = `${baseUrl}/access-code`
  return `<!-- plain, table-free markup: mail clients are not browsers -->
<div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#1f2937">
  <h1 style="font-size:20px;margin:0 0 16px">Thanks for your payment</h1>
  <p style="font-size:15px;line-height:1.6;margin:0 0 16px">
    Your full access is active for <strong>${durationDays} days</strong>. If you can already
    see your courses and notes, there is nothing to do here — just keep this email.
  </p>
  <p style="font-size:13px;color:#6b7280;margin:0 0 6px">Your access code</p>
  <p style="font-size:24px;font-weight:800;letter-spacing:2px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;background:#f3f4f6;border-radius:12px;padding:16px;text-align:center;margin:0 0 20px">
    ${code}
  </p>
  <p style="font-size:15px;line-height:1.6;margin:0 0 8px"><strong>If your access is not showing:</strong></p>
  <ol style="font-size:15px;line-height:1.6;margin:0 0 16px;padding-left:20px">
    <li>Open <a href="${url}" style="color:#1d4ed8">${url}</a></li>
    <li>Sign in with the account you want to unlock</li>
    <li>Enter the code above</li>
  </ol>
  <p style="font-size:14px;line-height:1.6;color:#4b5563;margin:0 0 16px">
    The code works once, on whichever account you are signed in to. That matters if you
    happen to have signed up with more than one email address.
  </p>
  <p style="font-size:14px;line-height:1.6;color:#4b5563;margin:0">
    Still stuck? Reply to this email and we will sort it out.
  </p>
</div>`
}

export async function sendAccessCodeEmail(params: AccessCodeEmailParams): Promise<EmailResult> {
  const { to, ...rest } = params
  return sendEmail({
    to,
    subject: `Your SK Driving access code — ${rest.code}`,
    text: accessCodeEmailText(rest),
    html: accessCodeEmailHtml(rest),
  })
}

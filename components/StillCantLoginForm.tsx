'use client'

/**
 * StillCantLoginForm — the second option after "Forgot your password?".
 *
 * For a client who has paid but still cannot get in. They give their name,
 * surname, the email they registered with and their proof of payment. The
 * proof is uploaded privately (see /api/access-help), then their own email
 * app opens, addressed to ACCESS_HELP_EMAIL, with everything filled in and a
 * link to the proof. They press Send, so the email genuinely comes from them
 * and a reply goes straight back to them.
 *
 * A browser cannot attach a file to an email by itself, which is why the
 * proof travels as a link. If no email app opens, the screen shows the
 * address and a copy button so nothing is lost.
 */
import { useState } from 'react'
import Link from 'next/link'
import { ACCESS_HELP_EMAIL } from '@/lib/contact'

const MAX_BYTES = 4 * 1024 * 1024
const ACCEPT = 'image/jpeg,image/png,image/webp,image/heic,image/heif,application/pdf'

/** Phone photos are often over 4 MB. Shrink them to a sharp but small JPEG. */
async function shrinkIfNeeded(file: File): Promise<File> {
  if (file.size <= MAX_BYTES * 0.85) return file
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return file   // PDFs / HEIC can't be redrawn here
  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image(); i.onload = () => resolve(i); i.onerror = reject; i.src = url
    })
    const scale = Math.min(1, 2000 / Math.max(img.width, img.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(img.width * scale)
    canvas.height = Math.round(img.height * scale)
    canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
    const blob = await new Promise<Blob | null>(r => canvas.toBlob(r, 'image/jpeg', 0.82))
    if (!blob) return file
    return new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' })
  } catch {
    return file
  } finally {
    URL.revokeObjectURL(url)
  }
}

interface Sent { mailto: string; subject: string; body: string; reference: string }

const inp = 'w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'

export default function StillCantLoginForm() {
  const [firstName, setFirstName] = useState('')
  const [surname, setSurname] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [paidOn, setPaidOn] = useState('')
  const [proof, setProof] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState<Sent | null>(null)
  const [copied, setCopied] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!proof) { setError('Please attach your proof of payment.'); return }

    setBusy(true)
    try {
      const file = await shrinkIfNeeded(proof)
      if (file.size > MAX_BYTES) {
        setError('That file is larger than 4 MB. Please attach a screenshot or a smaller PDF.')
        return
      }
      const fd = new FormData()
      fd.set('firstName', firstName); fd.set('surname', surname); fd.set('email', email)
      fd.set('phone', phone); fd.set('paidOn', paidOn); fd.set('proof', file)

      const res = await fetch('/api/access-help', { method: 'POST', body: fd })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.proofUrl) {
        setError(data.error ?? `Something went wrong. Please email your proof of payment to ${ACCESS_HELP_EMAIL}.`)
        return
      }

      const subject = `Paid but can't log in: ${firstName} ${surname}`
      const body = [
        'Hi SK Driving,',
        '',
        'I have paid for the K53 course but I still cannot log in or get full access.',
        '',
        `Name: ${firstName}`,
        `Surname: ${surname}`,
        `Email I registered with: ${email}`,
        `WhatsApp number: ${phone || 'not given'}`,
        `Date I paid: ${paidOn || 'not given'}`,
        '',
        `Proof of payment: ${data.proofUrl}`,
        `Reference: ${data.reference}`,
        '',
        'Thank you',
      ].join('\r\n')
      const mailto = `mailto:${ACCESS_HELP_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

      setSent({ mailto, subject, body, reference: data.reference })
      window.location.href = mailto
    } catch {
      setError(`We could not reach the server. Please email your proof of payment to ${ACCESS_HELP_EMAIL}.`)
    } finally {
      setBusy(false)
    }
  }

  if (sent) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-md text-center">
        <div className="text-5xl mb-3" aria-hidden="true">📨</div>
        <h1 className="text-2xl font-extrabold text-blue-700 mb-2">Almost done: press Send</h1>
        <p className="text-sm text-gray-600 mb-5">
          Your email app should now be open with everything filled in, addressed to{' '}
          <strong>{ACCESS_HELP_EMAIL}</strong>. Press <strong>Send</strong> and we&apos;ll unlock your
          account. Your reference is <strong className="font-mono">{sent.reference}</strong>.
        </p>
        <a href={sent.mailto} className="block w-full bg-blue-700 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-800 transition-colors mb-6">
          Open my email again
        </a>

        <div className="text-left rounded-xl bg-gray-50 border border-gray-200 p-4">
          <p className="text-xs font-bold text-gray-700 mb-1">Email app didn&apos;t open?</p>
          <p className="text-xs text-gray-600 mb-3">
            Send an email to <strong>{ACCESS_HELP_EMAIL}</strong> with the subject
            {' '}&ldquo;{sent.subject}&rdquo; and paste in this message:
          </p>
          <button
            onClick={() => navigator.clipboard?.writeText(sent.body).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) }).catch(() => {})}
            className="w-full border-2 border-gray-300 text-gray-700 font-semibold py-2 rounded-lg text-sm hover:bg-white transition-colors"
          >
            {copied ? '✓ Message copied' : 'Copy the message'}
          </button>
        </div>

        <p className="text-sm text-center mt-6">
          <Link href="/login" className="text-blue-700 font-medium hover:underline">Back to log in</Link>
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-md">
      <h1 className="text-2xl font-extrabold text-blue-700 mb-2 text-center">Still can&apos;t log in?</h1>
      <p className="text-sm text-gray-500 text-center mb-6">
        Paid but can&apos;t get in, even after resetting your password? Send us your proof of payment and
        we&apos;ll unlock your account. Your email app will open so you can send it to us.
      </p>

      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="sc-first">Name</label>
            <input id="sc-first" required value={firstName} onChange={e => setFirstName(e.target.value)} autoComplete="given-name" className={inp} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="sc-surname">Surname</label>
            <input id="sc-surname" required value={surname} onChange={e => setSurname(e.target.value)} autoComplete="family-name" className={inp} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="sc-email">Email you registered with</label>
          <input id="sc-email" type="email" required value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" inputMode="email" placeholder="you@example.com" className={inp} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="sc-phone">
              WhatsApp <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input id="sc-phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} autoComplete="tel" inputMode="tel" placeholder="071 234 5678" className={inp} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="sc-date">
              Date paid <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input id="sc-date" type="date" value={paidOn} onChange={e => setPaidOn(e.target.value)} className={inp} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="sc-proof">Proof of payment</label>
          <input
            id="sc-proof" type="file" required accept={ACCEPT}
            onChange={e => setProof(e.target.files?.[0] ?? null)}
            className="w-full text-sm text-gray-700 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
          />
          <p className="text-xs text-gray-400 mt-1">A screenshot, photo or PDF of your payment confirmation.</p>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit" disabled={busy}
          className="w-full bg-blue-700 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-60"
        >
          {busy ? 'Uploading your proof…' : 'Send proof of payment'}
        </button>
      </form>

      <p className="text-xs text-gray-400 text-center mt-4">
        Your proof of payment is stored privately and only shared with our support team.
      </p>
      <p className="text-sm text-center mt-4">
        <Link href="/forgot-password" className="text-blue-700 font-medium hover:underline">Try resetting your password first</Link>
      </p>
    </div>
  )
}

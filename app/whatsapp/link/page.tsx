/**
 * /whatsapp/link?code=… — connects a WhatsApp number to a skdriving account.
 *
 * The bot sends this link. The learner logs in (or registers), sees the last
 * digits of the number, and confirms. Confirming is a deliberate button press,
 * never automatic, so nobody can link their own phone to someone else's paid
 * account by sending them a link.
 *
 * With &then=pay the learner continues to the payment page afterwards.
 */
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { userHasFullAccess } from '@/lib/access'
import { describeLinkCode } from '@/lib/whatsapp/bot'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Link WhatsApp | SK Driving', robots: { index: false, follow: false } }

interface Props { searchParams: { code?: string; then?: string; done?: string } }

function Card({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-md text-center">{children}</div>
    </main>
  )
}

export default async function WhatsAppLinkPage({ searchParams }: Props) {
  const code = (searchParams.code ?? '').replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 20)
  const pay = searchParams.then === 'pay'

  const { data: { user } } = await createClient().auth.getUser()

  if (searchParams.done === '1' && user) {
    const full = await userHasFullAccess(user.id)
    return (
      <Card>
        <div className="text-5xl mb-3" aria-hidden="true">✅</div>
        <h1 className="text-2xl font-extrabold text-blue-700 mb-2">WhatsApp linked</h1>
        <p className="text-sm text-gray-600 mb-6">
          {full
            ? 'You have full access. Go back to WhatsApp and type MENU to choose a test.'
            : 'Get full access to practise on WhatsApp with no time limit. Then go back to WhatsApp and type MENU.'}
        </p>
        {!full && (
          <Link href="/pricing" className="block w-full bg-blue-700 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-800 transition-colors">
            Get full access
          </Link>
        )}
      </Card>
    )
  }

  if (!code) {
    return (
      <Card>
        <h1 className="text-xl font-extrabold text-gray-900 mb-2">Link your WhatsApp</h1>
        <p className="text-sm text-gray-600">Open this page from the link our WhatsApp sends you. Type LINK in the chat to get one.</p>
      </Card>
    )
  }

  if (!user) {
    const back = `/whatsapp/link?code=${code}${pay ? '&then=pay' : ''}`
    redirect(`/login?next=${encodeURIComponent(back)}`)
  }

  const info = await describeLinkCode(code)
  if (!info.valid) {
    return (
      <Card>
        <div className="text-4xl mb-3" aria-hidden="true">⚠️</div>
        <h1 className="text-xl font-extrabold text-gray-900 mb-2">This link can&apos;t be used</h1>
        <p className="text-sm text-gray-600">{info.reason}</p>
      </Card>
    )
  }

  return (
    <Card>
      <div className="text-5xl mb-3" aria-hidden="true">💬</div>
      <h1 className="text-2xl font-extrabold text-blue-700 mb-2">Link WhatsApp to your account?</h1>
      <p className="text-sm text-gray-600 mb-1">WhatsApp number</p>
      <p className="text-lg font-mono font-bold text-gray-900 mb-4">{info.masked}</p>
      <p className="text-sm text-gray-600 mb-6">
        will use your account <strong>{user.email}</strong>. Only confirm if this is your own phone.
      </p>
      <form method="post" action="/api/whatsapp/link">
        <input type="hidden" name="code" value={code} />
        {pay && <input type="hidden" name="then" value="pay" />}
        <button type="submit" className="w-full bg-green-600 text-white font-semibold py-2.5 rounded-lg hover:bg-green-700 transition-colors">
          Yes, link this number
        </button>
      </form>
      <p className="text-xs text-gray-400 mt-4">Not your number? Just close this page.</p>
    </Card>
  )
}

/**
 * /account — learner area showing access-pass status.
 *
 * - Not logged in → login prompt
 * - No active pass → "no pass" state + pricing CTA
 * - Active pass → plan, status, days remaining (or Lifetime), expiry, renew CTA
 */
import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import { hasFullAccess } from '@/lib/access'

export const dynamic = 'force-dynamic'

export default async function AccountPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <main className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-2xl shadow-md p-8">
          <div className="text-5xl mb-4">👤</div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">Log in to view your account</h1>
          <Link
            href="/login"
            className="mt-4 inline-block bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-blue-800 transition-colors"
          >
            Log in
          </Link>
        </div>
      </main>
    )
  }

  const [{ data: grant }, premium] = await Promise.all([
    supabase
      .from('access_grants')
      .select('expires_at, source')
      .eq('user_id', user.id)
      .maybeSingle(),
    hasFullAccess(),
  ])
  const expiresAt = grant?.expires_at ?? null
  const lifetime = !!grant && !expiresAt
  const days = expiresAt
    ? Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0
  const formattedExpiry = expiresAt
    ? new Date(expiresAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })
    : ''

  return (
    <main className="max-w-2xl mx-auto px-4 py-12 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-blue-700">My account</h1>
        <p className="text-sm text-gray-500 truncate">{user.email}</p>
      </div>

      {/* Access status card */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Access</span>
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full ${
              premium ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {premium ? 'Active' : grant ? 'Expired' : 'Pre-qualified'}
          </span>
        </div>

        {premium ? (
          <>
            <div className="text-2xl font-extrabold text-gray-900 mb-1">
              Premium access
            </div>
            {lifetime ? (
              <p className="text-sm text-gray-500">
                ♾️ Lifetime access — you&apos;re set for good. No renewals, ever.
              </p>
            ) : (
              <p className="text-sm text-gray-500">
                <strong className="text-gray-900">{days}</strong> day{days === 1 ? '' : 's'} remaining
                {expiresAt && <> · expires {formattedExpiry}</>}
              </p>
            )}

            {/* Low-time nudge */}
            {!lifetime && days <= 3 && (
              <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
                Your access ends soon — renew to keep practising without interruption.
              </div>
            )}

            {!lifetime && (
              <Link
                href="/pricing"
                className="mt-5 inline-block bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-blue-800 transition-colors text-sm"
              >
                Renew or upgrade
              </Link>
            )}
          </>
        ) : (
          <>
            <div className="text-lg font-bold text-gray-900 mb-1">
              {grant ? 'Your access has expired' : 'Payment required to activate'}
            </div>
            <p className="text-sm text-gray-500 mb-5">
              {grant
                ? 'Renew your premium access to continue using paid features.'
                : 'Your email and password are registered, but premium access remains inactive until payment is verified.'}
            </p>
            <Link
              href="/pricing"
              className="inline-block bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-blue-800 transition-colors text-sm"
            >
              View access passes
            </Link>
          </>
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/courses" className="bg-white rounded-2xl shadow-md p-4 text-center hover:shadow-lg transition-shadow">
          <div className="text-2xl mb-1">📝</div>
          <div className="text-sm font-semibold text-gray-800">Practice tests</div>
        </Link>
        <Link href="/affiliate" className="bg-white rounded-2xl shadow-md p-4 text-center hover:shadow-lg transition-shadow">
          <div className="text-2xl mb-1">🤝</div>
          <div className="text-sm font-semibold text-gray-800">Affiliate dashboard</div>
        </Link>
      </div>
    </main>
  )
}

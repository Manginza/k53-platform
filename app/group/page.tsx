/**
 * /group — Learners Licence preparation WhatsApp group.
 *
 * Members only: a logged-in user with active access (paid, or admin) sees the
 * join button. Everyone else is sent to log in or to pricing. WhatsApp does not
 * let a website add people to a group, so joining is one tap on the invite link.
 */
import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import { hasFullAccess } from '@/lib/access'
import { WHATSAPP_PREP_GROUP_URL } from '@/lib/contact'
import WhatsAppIcon from '@/components/icons/WhatsAppIcon'

export const dynamic = 'force-dynamic'

export default async function GroupPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <main className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-2xl shadow-md p-8">
          <h1 className="text-xl font-bold text-gray-800 mb-2">Log in to join the group</h1>
          <p className="text-gray-600 text-sm mb-6">The Learners Licence preparation group is for paid learners.</p>
          <Link href="/login?next=/group" className="inline-block bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-blue-800 transition-colors">
            Log in
          </Link>
        </div>
      </main>
    )
  }

  if (!(await hasFullAccess())) {
    return (
      <main className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-2xl shadow-md p-8">
          <h1 className="text-xl font-bold text-gray-800 mb-2">Group access needs an active course</h1>
          <p className="text-gray-600 text-sm mb-6">Your access has ended or you have not joined the Learners Licence course yet.</p>
          <Link href="/pricing" className="inline-block bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-blue-800 transition-colors">
            View course access
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-16">
      <div className="bg-white rounded-2xl shadow-md p-8 text-center">
        <h1 className="text-2xl font-extrabold text-gray-800 mb-2">Learners Licence preparation group</h1>
        <p className="text-gray-600 text-sm mb-6">Welcome. Tap below to join the WhatsApp group for your learners preparation.</p>
        <a
          href={WHATSAPP_PREP_GROUP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl transition-colors"
        >
          <WhatsAppIcon className="w-5 h-5" />
          Join the WhatsApp group
        </a>
      </div>
    </main>
  )
}

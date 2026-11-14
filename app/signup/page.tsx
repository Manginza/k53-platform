import type { Metadata } from 'next'
import { NOINDEX } from '@/lib/site'
import { redirect } from 'next/navigation'

// Public signup is disabled — access is arranged via WhatsApp and an
// admin-issued access code. Redirect any old links to the home page.
export const metadata: Metadata = { robots: NOINDEX }

export default function SignupPage() {
  redirect('/')
}

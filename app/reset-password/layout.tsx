import type { Metadata } from 'next'
import { NOINDEX } from '@/lib/site'

// Auth / account / members-only / in-progress pages stay out of search results.
export const metadata: Metadata = {
  title: 'Reset Password',
  description: "Choose a new password for your SK Driving account.",
  robots: NOINDEX,
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}

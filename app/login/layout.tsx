import type { Metadata } from 'next'
import { NOINDEX } from '@/lib/site'

// Auth / account / members-only / in-progress pages stay out of search results.
export const metadata: Metadata = {
  title: 'Log In',
  description: "Log in to your SK Driving account to continue your K53 learner's licence practice tests and study notes.",
  robots: NOINDEX,
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}

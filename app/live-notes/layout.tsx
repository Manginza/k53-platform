import type { Metadata } from 'next'
import { NOINDEX } from '@/lib/site'

// Auth / account / members-only / in-progress pages stay out of search results.
export const metadata: Metadata = {
  title: 'K53 Study Notes (Members)',
  robots: NOINDEX,
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}

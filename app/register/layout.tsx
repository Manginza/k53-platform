import type { Metadata } from 'next'
import { NOINDEX } from '@/lib/site'

// Auth / account / members-only / in-progress pages stay out of search results.
export const metadata: Metadata = {
  title: 'Register Free',
  description: "Create a free SK Driving account and try each Code 8 and Code 10 K53 practice test once.",
  robots: NOINDEX,
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}

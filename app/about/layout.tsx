import type { Metadata } from 'next'
import { canonical } from '@/lib/site'

export const metadata: Metadata = {
  title: 'About SK Driving',
  description: "SK Driving helps South African learners pass the K53 learner's licence test with practice tests, study notes and live lessons.",
  alternates: canonical('/about'),
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}

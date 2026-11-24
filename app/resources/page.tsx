import type { Metadata } from 'next'
import ResourcesClient from '@/components/ResourcesClient'
import { NOINDEX } from '@/lib/site'

// All resource data is static — page is pre-rendered once, access gate is client-side.
export const metadata: Metadata = {
  title: 'K53 Study Resources and PDFs (Members)',
  description: "Members' K53 learner's licence study PDFs: practice tests, memos with highlighted answers and a study guide.",
  // Downloads are members-only, so keep the page out of the index.
  robots: NOINDEX,
}

export default function ResourcesPage() {
  return <ResourcesClient />
}

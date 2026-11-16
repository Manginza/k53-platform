import type { Metadata } from 'next'
import ResourcesClient from '@/components/ResourcesClient'
import { NOINDEX } from '@/lib/site'

// All resource data is static — page is pre-rendered once, access gate is client-side.
export const metadata: Metadata = {
  title: 'K53 Study Resources and PDFs (Members)',
  description: "Members' K53 learner's licence study PDFs: test memos, practice quizzes and the road signs manual.",
  // Downloads are members-only, so keep the page out of the index.
  robots: NOINDEX,
}

export default function ResourcesPage() {
  return <ResourcesClient />
}

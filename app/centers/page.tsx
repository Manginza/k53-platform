import type { Metadata } from 'next'
import CentresDirectory from '@/components/directory/CentresDirectory'
import { DIRECTORY_REVALIDATE, getCentres } from '@/lib/directory'
import { canonical } from '@/lib/site'

// Public directory: static HTML, regenerated hourly (ISR). Legacy
// /centers?province=<Name> URLs are 308-redirected by middleware.ts.
export const revalidate = DIRECTORY_REVALIDATE

const TITLE = "Find Your Nearest Learner's Licence Centre (DLTC)"
const DESCRIPTION = "Find the nearest learner's licence testing centre (DLTC) in all 9 provinces, with addresses, phone numbers, booking steps and what to bring."

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    'learners writing centre', 'learners licence writing centre', 'learners test centre near me',
    'DLTC near me', 'driving licence testing centre', 'where to write learners licence',
    'how to book learners licence test', 'nearest DLTC South Africa',
  ],
  alternates: canonical('/centers'),
  openGraph: { title: TITLE, description: DESCRIPTION, url: '/centers', type: 'website' },
}

export default async function CentersPage() {
  return <CentresDirectory centres={await getCentres()} />
}

import type { Metadata } from 'next'
import SchoolsDirectory from '@/components/directory/SchoolsDirectory'
import { DIRECTORY_REVALIDATE, getSchools } from '@/lib/directory'
import { canonical } from '@/lib/site'

// Public directory: static HTML, regenerated hourly (ISR). Legacy
// /driving-schools?province=<Name> URLs are 308-redirected by middleware.ts.
export const revalidate = DIRECTORY_REVALIDATE

const TITLE = 'Find a Driving School Near You'
const DESCRIPTION = 'Driving schools in all 9 South African provinces. Filter by Code 8, Code 10, Code 14 or motorcycle and see phone numbers, hours and directions.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    'driving school near me', 'K53 driving school', 'cheap driving lessons South Africa',
    'Code 8 driving school', 'Code 10 driving school', 'motorcycle driving school',
    'driving school Johannesburg', 'driving school Cape Town', 'driving school Durban',
  ],
  alternates: canonical('/driving-schools'),
  openGraph: { title: TITLE, description: DESCRIPTION, url: '/driving-schools', type: 'website' },
}

export default async function DrivingSchoolsPage() {
  return <SchoolsDirectory schools={await getSchools()} />
}

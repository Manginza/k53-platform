import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import SchoolsDirectory from '@/components/directory/SchoolsDirectory'
import { DIRECTORY_REVALIDATE, PROVINCES, getSchools, inProvince, provinceBySlug } from '@/lib/directory'
import { canonical } from '@/lib/site'

export const revalidate = DIRECTORY_REVALIDATE
// Only the nine province slugs exist.
export const dynamicParams = false

interface Props { params: { province: string } }

export function generateStaticParams() {
  return PROVINCES.map(p => ({ province: p.slug }))
}

export function generateMetadata({ params }: Props): Metadata {
  const province = provinceBySlug(params.province)
  if (!province) return {}
  const path = `/driving-schools/${province.slug}`
  return {
    title: province.school.title,
    description: province.school.description,
    keywords: province.school.keywords,
    alternates: canonical(path),
    openGraph: { title: province.school.title, description: province.school.description, url: path, type: 'website' },
  }
}

export default async function ProvinceSchoolsPage({ params }: Props) {
  const province = provinceBySlug(params.province)
  if (!province) notFound()
  return <SchoolsDirectory province={province} schools={inProvince(await getSchools(), province)} />
}

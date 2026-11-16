import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import CentresDirectory from '@/components/directory/CentresDirectory'
import { DIRECTORY_REVALIDATE, PROVINCES, getCentres, inProvince, provinceBySlug } from '@/lib/directory'
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
  const path = `/centers/${province.slug}`
  return {
    title: province.centre.title,
    description: province.centre.description,
    keywords: province.centre.keywords,
    alternates: canonical(path),
    openGraph: { title: province.centre.title, description: province.centre.description, url: path, type: 'website' },
  }
}

export default async function ProvinceCentresPage({ params }: Props) {
  const province = provinceBySlug(params.province)
  if (!province) notFound()
  return <CentresDirectory province={province} centres={inProvince(await getCentres(), province)} />
}

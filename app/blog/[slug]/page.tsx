import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { BLOG_POSTS, BASE_URL, getPost, type BlogPost } from '@/lib/blog'
import LearnersLicenceStudyMaterials, { FAQ_ITEMS } from '@/components/blog/LearnersLicenceStudyMaterials'

export const dynamic = 'force-static'

/** slug → article body component. */
const BODIES: Record<string, React.ComponentType<{ post: BlogPost }>> = {
  'learners-licence-study-materials-south-africa': LearnersLicenceStudyMaterials,
}

export function generateStaticParams() {
  return BLOG_POSTS.map(p => ({ slug: p.slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const post = getPost(params.slug)
  if (!post) return {}
  const url = `${BASE_URL}/blog/${post.slug}`
  return {
    title: { absolute: post.seoTitle },
    description: post.description,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      title: post.seoTitle,
      description: post.description,
      images: [{ url: post.image, width: 1200, height: 630, alt: post.imageAlt }],
      publishedTime: post.datePublished,
      modifiedTime: post.dateModified,
      authors: ['SK Driving'],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.seoTitle,
      description: post.description,
      images: [post.image],
    },
  }
}

export default function BlogArticlePage({ params }: { params: { slug: string } }) {
  const post = getPost(params.slug)
  const Body = post ? BODIES[post.slug] : undefined
  if (!post || !Body) notFound()

  const url = `${BASE_URL}/blog/${post.slug}`

  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    image: [`${BASE_URL}${post.image}`],
    datePublished: post.datePublished,
    dateModified: post.dateModified,
    author: { '@type': 'Organization', name: 'SK Driving', url: BASE_URL },
    publisher: {
      '@type': 'Organization',
      name: 'SK Driving',
      logo: { '@type': 'ImageObject', url: `${BASE_URL}/logo-full.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${BASE_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: post.seoTitle, item: url },
    ],
  }

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <Body post={post} />
    </>
  )
}

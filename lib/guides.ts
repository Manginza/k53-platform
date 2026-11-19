/**
 * lib/guides.ts — the public learner's licence guides.
 *
 * One entry per guide page. Titles, descriptions and H1s come from the SEO
 * content brief (19 Nov 2026) and are tested for length in seo-data.test.ts.
 * Every figure on a guide must trace to one of SOURCES below: they are the
 * official pages that were checked on the review date.
 */
import type { Metadata } from 'next'
import { SITE_NAME, absoluteUrl } from '@/lib/site'

/** Date the facts on every guide were last checked against SOURCES. */
export const GUIDES_REVIEWED_ISO = '2026-11-19'
export const GUIDES_REVIEWED_LABEL = '19 November 2026'

export const NATIS_BOOKING_URL = 'https://online.natis.gov.za/#/'

export type GuideId = 'booking' | 'cost' | 'test' | 'codes' | 'requirements' | 'validity'

export interface Guide {
  id: GuideId
  path: string
  /** Full <title>, ≤60 characters, used without the site-name suffix. */
  title: string
  /** Meta description, ≤155 characters. */
  description: string
  h1: string
  /** Short name for breadcrumbs, the footer and related-guide links. */
  label: string
  /** One-line teaser for related-guide cards. */
  teaser: string
}

export const GUIDES: Record<GuideId, Guide> = {
  booking: {
    id: 'booking',
    path: '/how-to-book-a-learners-licence-test',
    title: "How to Book a Learner's Licence Test in South Africa",
    description:
      "Book your South African learner's licence test online via NaTIS or at a DLTC. See the steps, documents, fees and how to confirm your slot.",
    h1: "How to book a learner's licence test in South Africa",
    label: "How to book the test",
    teaser: 'Online on NaTIS (Gauteng) or at your DLTC, step by step.',
  },
  cost: {
    id: 'cost',
    path: '/learners-licence-cost',
    title: "Learner's Licence Cost and Fees in South Africa",
    description:
      "See official learner's licence booking and issue fees in South Africa, with Western Cape and Johannesburg figures and why prices vary by province.",
    h1: "How much does a learner's licence cost in South Africa?",
    label: "Learner's licence cost",
    teaser: 'Booking and issue fees, with official examples.',
  },
  test: {
    id: 'test',
    path: '/learners-licence-test',
    title: "Learner's Licence Test: Questions, Pass Mark and Format",
    description:
      "The K53 learner's licence test has 64 questions in three sections. See the official pass marks, format and how to prepare to pass first time.",
    h1: "South African learner's licence test: questions, pass mark and how to pass",
    label: 'The test and pass mark',
    teaser: '64 questions, three sections and the official pass marks.',
  },
  codes: {
    id: 'codes',
    path: '/learners-licence-codes',
    title: "Learner's Licence Codes 1, 2, 3, 8, 10 and 14 Explained",
    description:
      "Understand official learner's licence codes 1, 2 and 3, how they map to Code 8, 10 and 14, and the minimum age for each category.",
    h1: "Learner's licence codes in South Africa: 1, 2, 3 and Codes 8, 10 and 14",
    label: "Learner's licence codes",
    teaser: 'Codes 1, 2 and 3, and what people mean by Code 8, 10 and 14.',
  },
  requirements: {
    id: 'requirements',
    path: '/learners-licence-requirements',
    title: "Learner's Licence Requirements and Documents in SA",
    description:
      "See the documents, age limits and ID rules for a South African learner's licence, including photos, proof of address and what foreigners may need.",
    h1: "Learner's licence requirements in South Africa",
    label: 'Requirements and documents',
    teaser: 'Age limits, documents, proof of address and foreign applicants.',
  },
  validity: {
    id: 'validity',
    path: '/learners-licence-validity',
    title: "How Long Is a Learner's Licence Valid in South Africa?",
    description:
      "A South African learner's licence is valid for 24 months and cannot be extended. See what happens when it expires and how to apply again.",
    h1: "How long is a learner's licence valid in South Africa?",
    label: 'Validity and expiry',
    teaser: '24 months, no extensions, and the rules while you hold one.',
  },
}

/** Display order for the footer and "more guides" lists. */
export const GUIDE_LIST: Guide[] = [
  GUIDES.booking, GUIDES.cost, GUIDES.test, GUIDES.codes, GUIDES.requirements, GUIDES.validity,
]

export interface Source { name: string; url: string }

/** Official / primary sources checked on GUIDES_REVIEWED_LABEL. */
export const SOURCES = {
  govLearners: {
    name: "South African Government: Apply for a learner's licence",
    url: 'https://www.gov.za/services/driving-licence/apply-learners-licence',
  },
  natisPortal: {
    name: 'NaTIS online booking portal (Department of Transport)',
    url: NATIS_BOOKING_URL,
  },
  natisManual: {
    name: 'NaTIS Learner Driver Manual: Rules of the Road',
    url: 'https://www.natis.gov.za/media/com_natisdownloads/files/1_Rules_of_the_Road_v100_Jun_2012-20260713-173225.pdf',
  },
  westernCape: {
    name: "Western Cape Government: Learner's licence",
    url: 'https://www.westerncape.gov.za/service/learners-licence',
  },
  capeTown: {
    name: "City of Cape Town: Apply for a learner's licence",
    url: 'https://www.capetown.gov.za/city-connect/apply/licences-and-permits/driving-and-vehicles/apply-for-a-learners-licence/',
  },
  joburg: {
    name: 'City of Johannesburg: Licensing',
    url: 'https://joburg.org.za/departments_/Pages/City%20directorates%20including%20departmental%20sub-directorates/Public%20Safety/Li.aspx',
  },
  hessequa: {
    name: "Hessequa Municipality: Computerised Learner's Licence Test (CLLT)",
    url: 'https://www.hessequa.gov.za/computerised-learners-license-test-cllt/',
  },
  kannaland: {
    name: "Kannaland Municipality: Learner's licence",
    url: 'https://www.kannaland.gov.za/learners-licence',
  },
  george: {
    name: 'George Municipality: Driving and learner licensing',
    url: 'https://www.george.gov.za/driving-and-learners-licensing/',
  },
  knysna: {
    name: "Knysna Municipality: Driver's and learner's licence",
    url: 'https://www.knysna.gov.za/live-here/customer-care-centre/drivers-learners-licence/',
  },
  kzn: {
    name: "KwaZulu-Natal Department of Transport: Learner's licence",
    url: 'http://www.kzntransport.gov.za/licencing/licences/learners_licence.htm',
  },
  gautengReport: {
    name: 'Gauteng Department of Roads and Transport: DLTC forensic investigation, executive summary (2021)',
    url: 'https://cmbinary.gauteng.gov.za/Media?Item=1120&Location=%2Ftransport&Type=Documents&path=transport%2FDocuments%2FDepartment+Report%2FDLTC+Executive+Summary+-+Final+Report.pdf',
  },
  r93: {
    name: 'Government Notice R.93 of 2006 (Gazette 28446): learner’s licence test requirements',
    url: 'https://www.gov.za/sites/default/files/gcis_document/201409/28446b.pdf',
  },
  reg99: {
    name: "National Road Traffic Regulations, regulation 99: categories of learner's and driving licences",
    url: 'https://www.acts.co.za/national-road-traffic/r225_99__categories_of_learner',
  },
  nrtaS15: {
    name: 'National Road Traffic Act, section 15: minimum ages',
    url: 'https://www.acts.co.za/national-road-tra/15_disqualification_from_obtaining_or_holding_learner_s_or_driving_licence',
  },
  reg323: {
    name: 'National Road Traffic Regulations, regulation 323: vehicles restricted on freeways',
    url: 'https://www.acts.co.za/national-road-tra/r225_323__special_provisions_r',
  },
  sanews2010: {
    name: "SAnews (23 Feb 2010): Learner's licence now valid for two years",
    url: 'https://www.sanews.gov.za/features/learners-licence-valid-2-years',
  },
  validityNotice2010: {
    name: "Government notice (17 Feb 2010): extension of the validity period of learner's licences",
    url: 'https://www.gov.za/documents/notices/national-road-traffic-act-extension-validity-period-learners-licence-17-feb-2010',
  },
  govTrn: {
    name: 'South African Government: Apply for a traffic register number',
    url: 'https://www.gov.za/services/driving-licence-driving/apply-traffic-register-number',
  },
} satisfies Record<string, Source>

export type SourceId = keyof typeof SOURCES

export interface Faq { question: string; answer: string }

/** FAQPage JSON-LD. Answers must be the exact text rendered on the page. */
export function faqPageSchema(faqs: Faq[], pageUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    url: pageUrl,
    mainEntity: faqs.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  }
}

export function guideArticleSchema(guide: Guide) {
  const url = absoluteUrl(guide.path)
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.h1,
    description: guide.description,
    url,
    mainEntityOfPage: url,
    inLanguage: 'en-ZA',
    datePublished: GUIDES_REVIEWED_ISO,
    dateModified: GUIDES_REVIEWED_ISO,
    author: { '@type': 'Organization', name: SITE_NAME, url: absoluteUrl('/') },
    publisher: { '@id': `${absoluteUrl('/')}/#organization` },
  }
}

export function guideMetadata(guide: Guide): Metadata {
  const url = absoluteUrl(guide.path)
  return {
    title: { absolute: guide.title },
    description: guide.description,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      title: guide.title,
      description: guide.description,
      siteName: SITE_NAME,
      locale: 'en_ZA',
      modifiedTime: GUIDES_REVIEWED_ISO,
    },
    twitter: { card: 'summary', title: guide.title, description: guide.description },
  }
}

/**
 * lib/blog.ts — the SK Driving blog post registry.
 *
 * Each post's body lives in its own component under components/blog/, mapped
 * by slug in app/blog/[slug]/page.tsx. This file holds only the metadata the
 * index, the article route and the SEO/JSON-LD need.
 */
export interface BlogPost {
  slug: string
  /** Article H1. */
  title: string
  /** <title> for the browser tab / search result. */
  seoTitle: string
  /** Meta description. */
  description: string
  /** Short summary shown on the blog index card. */
  excerpt: string
  /** ISO date the article was first published. */
  datePublished: string
  /** ISO date it was last updated. */
  dateModified: string
  /** Social-share image (PNG, 1200x630) under /public. */
  image: string
  /** On-page featured image (SVG) under /public. */
  imageSvg: string
  imageAlt: string
  readMinutes: number
}

export const BASE_URL = 'https://www.skdriving.co.za'

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'how-to-study-for-the-k53-learners-test-in-two-weeks',
    title: "How to Study for the K53 Learner's Test in Two Weeks",
    seoTitle: "How to Study for the K53 Learner's Test in Two Weeks",
    description:
      "A two-week K53 study plan: which days to spend on rules, signs and controls, and how to mark each section before test day.",
    excerpt:
      "Two weeks is enough to cover the three sections if you study daily and score each one separately. Here is what to do on each day, and what a pass actually requires.",
    datePublished: '2026-11-24',
    dateModified: '2026-11-24',
    image: '/blog/how-to-study-for-the-k53-learners-test-in-two-weeks.png',
    imageSvg: '/blog/how-to-study-for-the-k53-learners-test-in-two-weeks.svg',
    imageAlt: "A two-week study plan for the South African K53 learner's licence test.",
    readMinutes: 8,
  },
  {
    slug: 'k53-road-signs-most-people-get-wrong',
    title: 'K53 Road Signs Most People Get Wrong',
    seoTitle: 'K53 Road Signs Most People Get Wrong',
    description:
      "The K53 road signs learners mix up: warnings versus orders, stop versus yield, and how shape and colour tell you what to do.",
    excerpt:
      "Road signs is the strictest section: 23 out of 28. These are the lookalike signs that cost that section, and how to read shape and colour before the symbol.",
    datePublished: '2026-11-23',
    dateModified: '2026-11-23',
    image: '/blog/k53-road-signs-most-people-get-wrong.png',
    imageSvg: '/blog/k53-road-signs-most-people-get-wrong.svg',
    imageAlt: 'South African road signs learners often confuse on the K53 test.',
    readMinutes: 8,
  },
  {
    slug: 'k53-rules-of-the-road-explained',
    title: "Rules of the Road Explained for the Learner's Test",
    seoTitle: "K53 Rules of the Road: Speed, Distance and Right of Way",
    description:
      "K53 rules of the road for the learner's test: speed limits, the two-second gap, right of way, and where you may not stop.",
    excerpt:
      "The general limits are 60, 100 and 120 km/h. Following distance is a time gap, not a guess. Here is how right of way, overtaking and parking are tested.",
    datePublished: '2026-11-22',
    dateModified: '2026-11-22',
    image: '/blog/k53-rules-of-the-road-explained.png',
    imageSvg: '/blog/k53-rules-of-the-road-explained.svg',
    imageAlt: "Rules of the road for the South African learner's licence test.",
    readMinutes: 8,
  },
  {
    slug: 'k53-vehicle-controls-questions-explained',
    title: 'Vehicle Controls Questions Explained',
    seoTitle: 'K53 Vehicle Controls Questions Explained',
    description:
      "How K53 vehicle-controls questions work, which pedal stops the car, and how to read a numbered controls diagram.",
    excerpt:
      "Eight questions, and you need six. The foot brake, the parking brake and the clutch do different jobs. Learn the job, because the numbers can change.",
    datePublished: '2026-11-21',
    dateModified: '2026-11-21',
    image: '/blog/k53-vehicle-controls-questions-explained.png',
    imageSvg: '/blog/k53-vehicle-controls-questions-explained.svg',
    imageAlt: "Numbered vehicle controls diagram used for K53 learner's practice.",
    readMinutes: 7,
  },
  {
    slug: 'what-to-bring-on-learners-licence-test-day',
    title: "What to Bring on Learner's Test Day, and What Happens at the DLTC",
    seoTitle: "What to Bring on Learner's Test Day at the DLTC",
    description:
      "What to take to a South African DLTC on learner's test day, what happens at the centre, and how booking differs by province.",
    excerpt:
      "ID, photos, proof of address and your booking. The eye test is for everyone. Gauteng books on NaTIS. Other provinces should ask the centre.",
    datePublished: '2026-11-20',
    dateModified: '2026-11-20',
    image: '/blog/what-to-bring-on-learners-licence-test-day.png',
    imageSvg: '/blog/what-to-bring-on-learners-licence-test-day.svg',
    imageAlt: "Documents to take to a driving licence testing centre on learner's test day.",
    readMinutes: 7,
  },
  {
    slug: 'common-reasons-people-fail-the-learners-test',
    title: "Common Reasons People Fail the Learner's Test",
    seoTitle: "Why People Fail the K53 Learner's Test",
    description:
      "Why a good overall score can still fail the learner's test, and the section mistakes that cost the attempt.",
    excerpt:
      "53 out of 64 can still be a fail. The test marks three sections, and a memorised paper does not survive a different draw of questions.",
    datePublished: '2026-11-19',
    dateModified: '2026-11-19',
    image: '/blog/common-reasons-people-fail-the-learners-test.png',
    imageSvg: '/blog/common-reasons-people-fail-the-learners-test.svg',
    imageAlt: "How the learner's test is marked in three sections, and why one weak section fails the attempt.",
    readMinutes: 7,
  },
  {
    slug: 'learners-licence-vs-drivers-licence-codes',
    title: "Learner's Licence vs Driver's Licence: Codes 1, 8, 10 and 14",
    seoTitle: "Learner's vs Driver's Licence: Codes 1, 8, 10 and 14",
    description:
      "Code 8, 10 and 14 are driving licences. See which learner's code to book, the minimum ages, and how the theory test differs.",
    excerpt:
      "There is no Code 8 learner's licence. Code 8 usually means a Code 2 learner's. Code 10 and Code 14 usually mean Code 3, from age 18.",
    datePublished: '2026-11-18',
    dateModified: '2026-11-18',
    image: '/blog/learners-licence-vs-drivers-licence-codes.png',
    imageSvg: '/blog/learners-licence-vs-drivers-licence-codes.svg',
    imageAlt: "How South African learner's licence codes relate to Code 8, Code 10 and Code 14.",
    readMinutes: 7,
  },
  {
    slug: 'what-you-can-do-after-passing-your-learners',
    title: "After You Pass: What a Learner's Licence Lets You Do",
    seoTitle: "What You May Do After Passing Your Learner's Licence",
    description:
      "After you pass: the 24-month limit, who must sit beside you, and what a learner's licence does not allow.",
    excerpt:
      "A pass is not a driving licence. You have 24 months, you may not drive a car alone, and a motorcycle learner may not carry a passenger.",
    datePublished: '2026-11-17',
    dateModified: '2026-11-17',
    image: '/blog/what-you-can-do-after-passing-your-learners.png',
    imageSvg: '/blog/what-you-can-do-after-passing-your-learners.svg',
    imageAlt: "What a South African learner's licence allows for 24 months after you pass.",
    readMinutes: 7,
  },
  {
    slug: 'learners-licence-study-materials-south-africa',
    title: "Learners Licence Study Materials: How to Prepare for South Africa's Computerised K53 Test",
    seoTitle: 'Learners Licence Study Materials | Prepare for Your K53 Test',
    description:
      "Looking for learners licence study materials in South Africa? Discover why pass rates are falling and prepare with SK Driving's computerised K53 practice tests.",
    excerpt:
      "Pass rates have reportedly fallen since computerised testing began. Here's why so many South Africans are failing — and how the right learners licence study materials and practice tests help you prepare.",
    datePublished: '2026-10-31',
    dateModified: '2026-10-31',
    image: '/blog/learners-licence-study-materials.png',
    imageSvg: '/blog/learners-licence-study-materials.svg',
    imageAlt: 'South African learners licence study materials and computerised K53 practice test.',
    readMinutes: 6,
  },
]

export function getPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find(p => p.slug === slug)
}

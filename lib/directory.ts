/**
 * lib/directory.ts — server-rendered DLTC centre and driving-school directories.
 *
 * Province pages live at /centers/<slug> and /driving-schools/<slug>. The old
 * ?province=<Name> URLs are 308-redirected to these paths by middleware.ts.
 */
import { publicSelect } from '@/lib/supabase-public'

/** Directory pages are rebuilt at most once an hour. */
export const DIRECTORY_REVALIDATE = 3600

export interface Province {
  name: string
  slug: string
  /** Example towns for the centre directory. */
  centreTowns: string
  /** Example towns for the school directory. */
  schoolTowns: string
  centre: { title: string; description: string; keywords: string[] }
  school: { title: string; description: string; keywords: string[] }
}

export const PROVINCES: Province[] = [
  {
    name: 'Gauteng',
    slug: 'gauteng',
    centreTowns: 'Joburg, Pretoria, Ekurhuleni',
    schoolTowns: 'Soweto, Tembisa, Pretoria',
    centre: {
      title: "Learner's Licence Centres in Gauteng (DLTCs)",
      description: "Learner's licence testing centres (DLTCs) in Gauteng: Johannesburg, Pretoria, Ekurhuleni, Soweto and Midrand, with addresses and phone numbers.",
      keywords: ['learners licence centre Johannesburg', 'learners licence Pretoria', 'DLTC Ekurhuleni', 'learners test Soweto', 'Gauteng DLTC', 'learners test Tembisa'],
    },
    school: {
      title: 'Driving Schools in Gauteng',
      description: 'Driving schools in Gauteng: Soweto, Tembisa, Johannesburg, Pretoria and Centurion. Compare Code 8 and Code 10 schools, phone numbers and hours.',
      keywords: ['driving school Soweto', 'driving school Tembisa', 'Code 10 driving school Gauteng', 'driving school Pretoria', 'driving school Johannesburg'],
    },
  },
  {
    name: 'Western Cape',
    slug: 'western-cape',
    centreTowns: 'Cape Town, Paarl, George',
    schoolTowns: 'Cape Town, Mitchells Plain',
    centre: {
      title: "Learner's Licence Centres in the Western Cape (DLTCs)",
      description: "Learner's licence testing centres (DLTCs) in the Western Cape: Cape Town, Bellville, Mitchells Plain, Khayelitsha, Paarl and George, with addresses.",
      keywords: ['learners licence centre Cape Town', 'DLTC Western Cape', 'learners test Bellville', "learners licence Mitchell's Plain", 'learners licence Khayelitsha'],
    },
    school: {
      title: 'Driving Schools in the Western Cape',
      description: 'Driving schools in the Western Cape: Cape Town, Mitchells Plain, Bellville, Milnerton and Athlone. Compare K53 schools, phone numbers and hours.',
      keywords: ['driving school Cape Town', 'driving school Mitchells Plain', 'K53 lessons Cape Town', 'driving school Bellville'],
    },
  },
  {
    name: 'KwaZulu-Natal',
    slug: 'kwazulu-natal',
    centreTowns: 'Durban, PMB, Richards Bay',
    schoolTowns: 'Durban, Umlazi, Pinetown',
    centre: {
      title: "Learner's Licence Centres in KwaZulu-Natal (DLTCs)",
      description: "Learner's licence testing centres (DLTCs) in KwaZulu-Natal: Durban, Pietermaritzburg, Richards Bay, Newcastle and Ladysmith, with addresses.",
      keywords: ['learners licence centre Durban', 'DLTC KwaZulu-Natal', 'learners test Pietermaritzburg', 'learners licence Richards Bay', 'KZN DLTC'],
    },
    school: {
      title: 'Driving Schools in KwaZulu-Natal',
      description: 'Driving schools in KwaZulu-Natal: Durban, Umlazi, KwaMashu, Amanzimtoti and Pinetown. Code 8, Code 10 and motorcycle schools with contact details.',
      keywords: ['driving school Durban', 'driving school Umlazi', 'K53 lessons KwaZulu-Natal', 'driving school Pinetown'],
    },
  },
  {
    name: 'Eastern Cape',
    slug: 'eastern-cape',
    centreTowns: 'Gqeberha, East London, Mthatha',
    schoolTowns: 'Gqeberha, East London',
    centre: {
      title: "Learner's Licence Centres in the Eastern Cape (DLTCs)",
      description: "Learner's licence testing centres (DLTCs) in the Eastern Cape: Gqeberha, East London, Mthatha and Makhanda, with addresses and phone numbers.",
      keywords: ['learners licence Gqeberha', 'learners licence Port Elizabeth', 'DLTC East London', 'learners test Mthatha', 'Eastern Cape DLTC'],
    },
    school: {
      title: 'Driving Schools in the Eastern Cape',
      description: 'Driving schools in the Eastern Cape: Gqeberha (Port Elizabeth), East London, Mthatha and Mdantsane, with phone numbers and licence codes.',
      keywords: ['driving school Gqeberha', 'driving school East London', 'driving school Port Elizabeth', 'driving school Mthatha'],
    },
  },
  {
    name: 'Mpumalanga',
    slug: 'mpumalanga',
    centreTowns: 'Nelspruit, Secunda, Witbank',
    schoolTowns: 'Nelspruit, Witbank',
    centre: {
      title: "Learner's Licence Centres in Mpumalanga (DLTCs)",
      description: "Learner's licence testing centres (DLTCs) in Mpumalanga: Mbombela (Nelspruit), Secunda, eMalahleni (Witbank) and Standerton, with addresses.",
      keywords: ['learners licence Nelspruit', 'DLTC Mpumalanga', 'learners test Secunda', 'learners licence Witbank', 'Mbombela DLTC'],
    },
    school: {
      title: 'Driving Schools in Mpumalanga',
      description: 'Driving schools in Mpumalanga: Mbombela (Nelspruit), eMalahleni (Witbank) and Secunda, with licence codes, phone numbers and hours.',
      keywords: ['driving school Nelspruit', 'driving school Witbank', 'K53 lessons Mpumalanga'],
    },
  },
  {
    name: 'Limpopo',
    slug: 'limpopo',
    centreTowns: 'Polokwane, Thohoyandou, Mokopane',
    schoolTowns: 'Polokwane, Thohoyandou',
    centre: {
      title: "Learner's Licence Centres in Limpopo (DLTCs)",
      description: "Learner's licence testing centres (DLTCs) in Limpopo: Polokwane, Thohoyandou, Mokopane, Makhado and Lephalale, with addresses and phone numbers.",
      keywords: ['learners licence Polokwane', 'DLTC Limpopo', 'learners test Thohoyandou', 'learners licence Mokopane'],
    },
    school: {
      title: 'Driving Schools in Limpopo',
      description: 'Driving schools in Limpopo: Polokwane, Thohoyandou, Mokopane and Makhado, with licence codes, phone numbers and opening hours.',
      keywords: ['driving school Polokwane', 'K53 lessons Limpopo', 'driving school Thohoyandou'],
    },
  },
  {
    name: 'Free State',
    slug: 'free-state',
    centreTowns: 'Bloemfontein, Kroonstad, Harrismith',
    schoolTowns: 'Bloemfontein, Kroonstad',
    centre: {
      title: "Learner's Licence Centres in the Free State (DLTCs)",
      description: "Learner's licence testing centres (DLTCs) in the Free State: Bloemfontein, Kroonstad, Bethlehem and Harrismith, with addresses and phone numbers.",
      keywords: ['learners licence Bloemfontein', 'DLTC Free State', 'learners test Kroonstad', 'learners licence Bethlehem'],
    },
    school: {
      title: 'Driving Schools in the Free State',
      description: 'Driving schools in the Free State: Bloemfontein, Kroonstad, Bethlehem and Harrismith, with licence codes, phone numbers and opening hours.',
      keywords: ['driving school Bloemfontein', 'K53 lessons Free State'],
    },
  },
  {
    name: 'North West',
    slug: 'north-west',
    centreTowns: 'Mahikeng, Rustenburg, Zeerust',
    schoolTowns: 'Mahikeng, Rustenburg',
    centre: {
      title: "Learner's Licence Centres in North West (DLTCs)",
      description: "Learner's licence testing centres (DLTCs) in North West: Mahikeng, Rustenburg, Zeerust and Klerksdorp, with addresses and phone numbers.",
      keywords: ['learners licence Mahikeng', 'DLTC North West', 'learners test Rustenburg', 'learners licence Zeerust'],
    },
    school: {
      title: 'Driving Schools in North West',
      description: 'Driving schools in North West: Mahikeng, Rustenburg, Klerksdorp and Zeerust, with licence codes, phone numbers and opening hours.',
      keywords: ['driving school Rustenburg', 'driving school Mahikeng', 'K53 lessons North West'],
    },
  },
  {
    name: 'Northern Cape',
    slug: 'northern-cape',
    centreTowns: 'Kimberley, Upington, De Aar',
    schoolTowns: 'Kimberley, Upington',
    centre: {
      title: "Learner's Licence Centres in the Northern Cape (DLTCs)",
      description: "Learner's licence testing centres (DLTCs) in the Northern Cape: Kimberley, Upington, De Aar and Colesburg, with addresses and phone numbers.",
      keywords: ['learners licence Kimberley', 'DLTC Northern Cape', 'learners test Upington', 'learners licence De Aar'],
    },
    school: {
      title: 'Driving Schools in the Northern Cape',
      description: 'Driving schools in the Northern Cape: Kimberley, Upington and De Aar, with licence codes, phone numbers and opening hours.',
      keywords: ['driving school Kimberley', 'K53 lessons Northern Cape', 'driving school Upington'],
    },
  },
]

export function provinceBySlug(slug: string): Province | undefined {
  return PROVINCES.find(p => p.slug === slug)
}

/**
 * Resolve a legacy `?province=` value ("Western Cape", "western-cape",
 * "KWAZULU-NATAL") to a province. Used by the redirect in middleware.ts.
 */
export function provinceFromParam(value: string | null | undefined): Province | undefined {
  if (!value) return undefined
  const key = value.trim().toLowerCase().replace(/[\s_+]+/g, '-')
  return PROVINCES.find(p => p.slug === key)
}

// ─── Data ──────────────────────────────────────────────────────────────────

export interface Centre {
  id: number
  name: string
  province: string
  address: string
  phone: string | null
  is_smart_hub: boolean
}

export interface School {
  id: number
  name: string
  province: string
  suburb: string
  address: string | null
  phone: string | null
  licence_codes: string[]
  hours: string | null
  is_verified: boolean
}

/** Every centre, ordered by province then name. null = unavailable at build time. */
export function getCentres(): Promise<Centre[] | null> {
  return publicSelect<Centre>(
    'dltc_centers',
    'select=id,name,province,address,phone,is_smart_hub&order=province.asc,name.asc',
    { revalidate: DIRECTORY_REVALIDATE, tags: ['dltc_centers'] },
  )
}

/** Every school, verified first, then by name. null = unavailable at build time. */
export function getSchools(): Promise<School[] | null> {
  return publicSelect<School>(
    'driving_schools',
    'select=id,name,province,suburb,address,phone,licence_codes,hours,is_verified&order=is_verified.desc,name.asc',
    { revalidate: DIRECTORY_REVALIDATE, tags: ['driving_schools'] },
  )
}

export function inProvince<T extends { province: string }>(rows: T[] | null, province: Province): T[] | null {
  return rows ? rows.filter(r => r.province === province.name) : null
}

export function mapsUrl(name: string, place: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${place}`)}`
}

/** Plain digits for a tel: link ("011 321-6372" → "0113216372"). */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`
}

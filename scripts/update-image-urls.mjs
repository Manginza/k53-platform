/**
 * Updates image_url for all test_number=2 signs questions to Supabase storage URLs.
 * Run once:  node scripts/update-image-urls.mjs
 */

const SUPABASE_URL = 'https://wzqgjzqylkbwyvzyzywu.supabase.co'
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
const BASE         = 'https://wzqgjzqylkbwyvzyzywu.supabase.co/storage/v1/object/public/resources/code8/test2/images'

const headers = {
  'Content-Type':  'application/json',
  'apikey':        SERVICE_KEY,
  'Authorization': `Bearer ${SERVICE_KEY}`,
}

// Map image_ref (as stored in DB) → exact Supabase storage filename
const IMAGE_MAP = {
  '2c8.1.img.png':   '2c8.1.img.png',
  '2c8.2.img.png':   '2c8.2.img.png',
  '2c8.3.img.png':   '2c8.3.img.png',
  '2c8.4.img.png':   '2c8.4.img.png',
  '2c8.5.img.png':   null,                      // not uploaded to Supabase
  '2c8.6.img.png':   '2c8.6.img.png',
  '2c8.7.png':       '2c8.7.png',
  '2c8.8.img.png':   '2c8.8.img.png',
  '2c8.9.img.png':   '2c8.9.img.png',
  '2c8.10.img.png':  '2c8.10.img.png',
  '2c8.11.img.png':  '2c8.11.img.png',
  '2c8.12.img.png':  '2c8.12.img.png',
  '2c8.13.img.png':  '2c8.13.img.png',
  '2c8.14.img.png':  '2c8.14.img.png',
  '2c8.15.img.png':  '2c8.15.img.png',
  '2c8.16.img.jfif': '2c8.16.img.jfif',
  '2c8.17.img.png':  '2c8.17.img.png',
  '2c8.18.img.png':  '2c8.18.img.png',
  '2c8.19.img.png':  '2c8.19.img.png',
  '2c8.20.img.png':  '2c8.20.img.png',
  '2c8.21.img.png':  '2c8.21.img.png',
  '2c8.22.img.png':  '2c8.22.img%20%282%29.png', // space + (2) in storage filename
  '2c8.23.img.png':  '2c8.23.img.png',
  '2c8.24.img.png':  '2c8.24.img.png',
  '2c8.24.1.img.png':'2c8.24.1.img.png',
  '2c8.25.img.png':  '2c8.25.img.png',
  '2c8.26.img.png':  '2c8.26.img.png',
  '2c8.27.img.png':  '2c8.27.img.png',
  '2c8.28.img.png':  '2c8.28.img.png',
  '2c8.29.img.png':  '2c8.29.img.png',
}

// 1. Fetch all test_number=2 questions that have an image_ref
const res = await fetch(
  `${SUPABASE_URL}/rest/v1/quiz_questions?test_number=eq.2&image_ref=not.is.null&select=id,image_ref`,
  { headers }
)
const questions = await res.json()
console.log(`Found ${questions.length} signs questions to update.\n`)

// 2. Update each one
let updated = 0, skipped = 0

for (const q of questions) {
  const filename = IMAGE_MAP[q.image_ref]

  if (!filename) {
    console.log(`  SKIP  ${q.image_ref}  (not in Supabase storage)`)
    skipped++
    continue
  }

  const image_url = `${BASE}/${filename}`

  const patch = await fetch(
    `${SUPABASE_URL}/rest/v1/quiz_questions?id=eq.${q.id}`,
    {
      method:  'PATCH',
      headers: { ...headers, 'Prefer': 'return=minimal' },
      body:    JSON.stringify({ image_url }),
    }
  )

  if (patch.ok) {
    console.log(`  ✓  id=${q.id}  ${q.image_ref}`)
    updated++
  } else {
    const err = await patch.text()
    console.error(`  ✗  id=${q.id}  ${q.image_ref}  ->  ${patch.status} ${err}`)
  }
}

console.log(`\nDone — ${updated} updated, ${skipped} skipped.`)

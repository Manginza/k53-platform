import { readFileSync } from 'node:fs'

const envText = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
const env = Object.fromEntries(envText.split(/\r?\n/).filter(line => line.includes('=')).map(line => {
  const at = line.indexOf('=')
  return [line.slice(0, at), line.slice(at + 1).trim().replace(/^['"]|['"]$/g, '')]
}))
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY
const questions = JSON.parse(readFileSync(new URL('./final-test-data.json', import.meta.url), 'utf8'))

if (!SUPABASE_URL || !KEY || KEY.startsWith('your-')) {
  console.error('A valid NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.')
  process.exit(1)
}

const headers = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' }
const request = async (path, options = {}) => {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { ...options, headers: { ...headers, ...options.headers } })
  if (!response.ok) throw new Error(`${response.status} ${await response.text()}`)
  const body = await response.text()
  return body ? JSON.parse(body) : null
}

let [course] = await request('courses?code=eq.final-k53&select=id')
if (!course) {
  const created = await request('courses', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({
      code: 'final-k53',
      title: 'Final Test Code 8, 10 and Motorcycle',
      description: 'One comprehensive final test containing Test A, Test B and Test C, with one combined score.',
    }),
  })
  course = created[0]
}

await request(`quiz_questions?course_id=eq.${course.id}`, { method: 'DELETE' })
const rows = questions.map((question, index) => ({
  course_id: course.id,
  test_number: 1,
  question: `Test ${question.section} · Question ${question.number}\n${question.question}`,
  option_a: question.option_a,
  option_b: question.option_b,
  option_c: question.option_c,
  correct_answer: question.correct_answer,
  image_url: question.image_url,
  image_ref: question.image_ref,
  // IDs determine display order, so insert in exact A → B → C sequence.
  _order: index,
}))

for (let offset = 0; offset < rows.length; offset += 50) {
  const batch = rows.slice(offset, offset + 50).map(({ _order, ...row }) => row)
  await request('quiz_questions', { method: 'POST', body: JSON.stringify(batch) })
}

console.log(`Seeded ${rows.length} questions into “Final Test Code 8, 10 and Motorcycle” (course ${course.id}).`)

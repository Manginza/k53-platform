import { readFileSync } from 'fs'
const env = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
const SUPA = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim()
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!KEY?.startsWith('eyJ')) { console.error('need SUPABASE_SERVICE_ROLE_KEY'); process.exit(1) }
const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' }

// NRTR Reg 320(2)(b): urban = 7 days; outside urban = 24 hours
const norm = s => String(s || '').toLowerCase()
const matchOpt = (q, test) => {            // returns 'A'|'B'|'C' whose text satisfies test()
  for (const L of ['A', 'B', 'C']) if (test(norm({ A: q.option_a, B: q.option_b, C: q.option_c }[L]))) return L
  return null
}

const all = await (await fetch(`${SUPA}/rest/v1/quiz_questions?select=*&order=id`, { headers: H })).json()
const parking = all.filter(q => /longest period|left parked|parked .* in one|parked .*(urban|public road)/i.test(q.question) && /(hour|day|days)/i.test(q.option_a + q.option_b + q.option_c))

console.log(`Found ${parking.length} parking-duration questions:\n`)
const updates = []
for (const q of parking) {
  const outside = /\boutside\b/i.test(q.question)
  const wantUrban = !outside
  // urban -> "7 days"; outside -> "24 hours"
  const target = wantUrban
    ? matchOpt(q, t => /\b7\b.*day/.test(t) || /seven day/.test(t))
    : matchOpt(q, t => /\b24\b.*hour/.test(t) || /twenty.?four hour/.test(t))
  const cur = q.correct_answer
  const opt = L => ({ A: q.option_a, B: q.option_b, C: q.option_c }[L])
  console.log(`[id${q.id} c${q.course_id}t${q.test_number}] ${q.question.slice(0, 80)}`)
  console.log(`   area: ${outside ? 'OUTSIDE urban (->24h)' : 'URBAN (->7 days)'}`)
  console.log(`   A)${q.option_a} | B)${q.option_b} | C)${q.option_c}`)
  if (!target) { console.log(`   ⚠ could not find target option — SKIP\n`); continue }
  if (target === cur) { console.log(`   already correct (${cur}: ${opt(cur)})\n`); continue }
  console.log(`   FIX ${cur} (${opt(cur)}) -> ${target} (${opt(target)})\n`)
  updates.push([q.id, target])
}

if (process.argv.includes('--apply')) {
  let n = 0
  for (const [id, to] of updates) {
    const r = await fetch(`${SUPA}/rest/v1/quiz_questions?id=eq.${id}`, { method: 'PATCH', headers: H, body: JSON.stringify({ correct_answer: to }) })
    if (r.ok) { n++; console.log(`✓ id${id} -> ${to}`) } else console.log(`✗ id${id}`, r.status, await r.text())
  }
  console.log(`\n✅ applied ${n}/${updates.length}`)
} else console.log(`(dry run — ${updates.length} to change; re-run with --apply)`)

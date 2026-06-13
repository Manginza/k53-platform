import { readFileSync } from 'fs'
const env = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
const SUPA = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim()
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!KEY?.startsWith('eyJ')) { console.error('need SUPABASE_SERVICE_ROLE_KEY'); process.exit(1) }
const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' }

// Verified corrections [id, from, to, reason]
const FIXES = [
  [96,  'B', 'C', 'Check vehicles behind = mirror = #3 (diagram 2c8.2); #11 is the hooter'],
  [122, 'B', 'A', 'Control used when raining = wiper = #2 (diagram 2c8.2); #5 is the indicator'],
  [56,  'A', 'C', 'Dipped/dim beam furthest = 45 m (confirmed by sibling id188); 100 m is main beam'],
  [47,  'A', 'C', 'May not stop within 6 m of a bridge → "5 m from a bridge" (confirmed by sibling id190)'],
  [66,  'B', 'C', 'Legal stop = 6 m from a railway crossing; 5 m from a pedestrian crossing is illegal (<9 m) (confirmed by sibling id268)'],
  [43,  'B', 'A', 'Seatbelt reg: (ii) reversing-exempt TRUE & (iv) belted-seat-priority TRUE; only (iii) false → (i)(ii)(iv)'],
]

const get = async id => (await (await fetch(`${SUPA}/rest/v1/quiz_questions?id=eq.${id}&select=*`, { headers: H })).json())[0]

let applied = 0
for (const [id, from, to, reason] of FIXES) {
  const q = await get(id)
  if (!q) { console.log(`id${id}: NOT FOUND`); continue }
  const opt = l => ({ A: q.option_a, B: q.option_b, C: q.option_c }[l])
  console.log(`\nid${id}: "${q.question.slice(0, 70)}"`)
  console.log(`   current ${from}) ${opt(from)}`)
  console.log(`   ->      ${to}) ${opt(to)}`)
  console.log(`   reason: ${reason}`)
  if (q.correct_answer !== from) { console.log(`   ⚠ SKIP — current answer is ${q.correct_answer}, not ${from} (already changed?)`); continue }
  if (process.argv.includes('--apply')) {
    const r = await fetch(`${SUPA}/rest/v1/quiz_questions?id=eq.${id}`, { method: 'PATCH', headers: { ...H, Prefer: 'return=representation' }, body: JSON.stringify({ correct_answer: to }) })
    if (r.ok) { console.log('   ✓ APPLIED'); applied++ } else console.log('   ✗ FAILED', r.status, await r.text())
  }
}
console.log(process.argv.includes('--apply') ? `\n✅ applied ${applied}/${FIXES.length}` : `\n(dry run — re-run with --apply to write)`)

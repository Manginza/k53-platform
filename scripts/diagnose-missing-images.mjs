import { readFileSync, writeFileSync } from 'fs'
const env = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
const SUPA = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim()
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SRK
const H = { apikey: KEY, Authorization: `Bearer ${KEY}` }

const all = await (await fetch(`${SUPA}/rest/v1/quiz_questions?select=*&order=course_id,test_number,id`, { headers: H })).json()
writeFileSync(new URL('../quiz-dump.json', import.meta.url), JSON.stringify(all))

// "expects an image" heuristic: text refers to a shown sign/marking/signal, or numeric (control-diagram) answers
const expectsImage = q => {
  const t = q.question.toLowerCase()
  const refsPic = /\bthis (sign|road sign|road marking|marking|signal|light|symbol|diagram|picture|control|board)\b|\bshown\b|\bdepicted\b|\billustrated\b|\bthe (picture|sketch|diagram|sign) (above|shown|below)\b|sketch|which number|which numbers|number\.\.\.|use number/.test(t)
  const numeric = [q.option_a, q.option_b, q.option_c].some(o => /^\s*\d+(\s*(and|&|,)\s*\d+)*\s*$/i.test(String(o).trim()))
  return refsPic || numeric
}

const head = async url => { try { const r = await fetch(url, { method: 'HEAD' }); return r.status } catch { return 0 } }

const noImage = []     // expects an image but image_url is null/empty
const broken = []      // has image_url but it 404s / errors
const okImg = []

for (const q of all) {
  if (q.image_url) {
    const s = await head(q.image_url)
    if (s === 200) okImg.push(q); else broken.push({ ...q, _status: s })
  } else if (expectsImage(q)) {
    noImage.push(q)
  }
}

console.log(`Total: ${all.length}  | with working image: ${okImg.length}  | BROKEN image link: ${broken.length}  | expects image but NONE set: ${noImage.length}\n`)

console.log('=== BROKEN image links (image_url set but 404/err) ===')
for (const q of broken) console.log(`  [id${q.id} c${q.course_id}t${q.test_number}] status ${q._status} | ref:${q.image_ref} | ${q.question.slice(0,55)}\n     url: ${q.image_url}`)

console.log('\n=== Expects an image but has NONE ===')
for (const q of noImage) console.log(`  [id${q.id} c${q.course_id}t${q.test_number}] ref:${q.image_ref ?? '(none)'} | ${q.question.slice(0,70)}`)

writeFileSync(new URL('../missing-images.json', import.meta.url), JSON.stringify({ broken, noImage }, null, 1))
console.log('\nwrote missing-images.json')

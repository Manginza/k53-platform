import { readFileSync } from 'fs'
const env = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
const SUPA = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim()
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SRK
const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' }
const APPLY = process.argv.includes('--apply')
const PUB = `${SUPA}/storage/v1/object/public/resources/`
const head = async u => { try { return (await fetch(u, { method: 'HEAD' })).status } catch { return 0 } }
const base = u => decodeURIComponent(String(u).split('/').pop())

// One-off: copy the comma-typo file to its correct name so id187's URL works
async function fixCommaFile() {
  const src = 'code10/test 1/C10.14,img.png', dst = 'code10/test 1/C10.14.img.png'
  if (await head(PUB + encodeURI(dst)) === 200) { console.log('  (C10.14 already correct)'); return }
  if (!APPLY) { console.log('  WOULD copy', src, '->', dst); return }
  const r = await fetch(`${SUPA}/storage/v1/object/copy`, { method: 'POST', headers: H, body: JSON.stringify({ bucketId: 'resources', sourceKey: src, destinationKey: dst }) })
  console.log(r.ok ? '  ✓ copied C10.14,img.png -> C10.14.img.png' : '  ✗ copy failed ' + r.status + ' ' + await r.text())
}

const all = await (await fetch(`${SUPA}/rest/v1/quiz_questions?select=id,course_id,test_number,question,image_ref,image_url&image_url=not.is.null&order=id`, { headers: H })).json()

console.log('Repairing C10.14 filename:')
await fixCommaFile()

console.log('\nRepointing broken image links:')
const updates = []
for (const q of all) {
  if (await head(q.image_url) === 200) continue        // already working
  const fname = base(q.image_url)
  let newUrl = null, note = ''
  const u = q.image_url.toLowerCase()
  if (/code10\/test ?2/.test(u)) newUrl = PUB + encodeURI('code10/test 2/' + fname)
  else if (/code8\/test ?2/.test(u)) {
    // code8 test2 images live in a /images/ subfolder; 2c8.5 is missing -> use the controls diagram
    const target = fname === '2c8.5.img.png' ? '2c8.2.img.png' : fname
    if (target !== fname) note = `(${fname} missing -> controls diagram ${target})`
    newUrl = PUB + encodeURI('code8/test2/images/' + target)
  } else if (/code10\/test ?1/.test(u)) continue       // handled by the copy above
  if (!newUrl) { console.log(`  ? id${q.id}: can't map ${q.image_url}`); continue }
  const ok = await head(newUrl)
  console.log(`  id${q.id} [${fname}] ${ok === 200 ? 'OK' : 'STILL ' + ok} ${note}`)
  if (ok === 200) updates.push([q.id, newUrl])
}

console.log(`\n${updates.length} links to repoint.`)
if (APPLY) {
  let n = 0
  for (const [id, url] of updates) {
    const r = await fetch(`${SUPA}/rest/v1/quiz_questions?id=eq.${id}`, { method: 'PATCH', headers: H, body: JSON.stringify({ image_url: url }) })
    if (r.ok) n++; else console.log('  ✗ id' + id, r.status)
  }
  console.log(`✅ repointed ${n}/${updates.length}`)
} else console.log('(dry run — re-run with --apply)')

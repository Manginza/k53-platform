import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const SUPABASE_URL   = 'https://wzqgjzqylkbwyvzyzywu.supabase.co'
const BUCKET         = 'resources'
const SHARED_FOLDER  = 'code8/shared'
const TEST1_FOLDER   = 'code8/test1'
const IMAGE_EXT      = '.png'

const CSV_PATH = join(__dirname, 'code8-test1-questions.csv')

// ── Parse CSV (handles quoted fields with commas inside) ──────────────────
function parseCSV(raw) {
  const lines = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')
  return lines
    .filter(l => l.trim() !== '')
    .map(line => {
      const fields = []
      let cur = ''
      let inQuotes = false
      for (let i = 0; i < line.length; i++) {
        const ch = line[i]
        if (ch === '"') {
          if (inQuotes && line[i + 1] === '"') { cur += '"'; i++ }
          else inQuotes = !inQuotes
        } else if (ch === ',' && !inQuotes) {
          fields.push(cur); cur = ''
        } else {
          cur += ch
        }
      }
      fields.push(cur)
      return fields
    })
}

function csvEscape(val) {
  if (val === null || val === undefined) return ''
  const s = String(val)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"'
  }
  return s
}

// ── Build public URL from image_ref ──────────────────────────────────────
function buildImageUrl(imageRef) {
  if (!imageRef || imageRef.trim() === '') return ''

  const ref  = imageRef.trim()
  const base = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}`

  if (ref === 'controls-diagram') {
    return `${base}/${SHARED_FOLDER}/${ref}${IMAGE_EXT}`
  }

  // road sign images: e.g. C81.q1.img → code8/test1/C81.q1.img.png
  return `${base}/${TEST1_FOLDER}/${ref}${IMAGE_EXT}`
}

// ── Main ─────────────────────────────────────────────────────────────────
const raw    = readFileSync(CSV_PATH, 'utf8')
const rows   = parseCSV(raw)
const header = rows[0]
const data   = rows.slice(1)

// Column indexes
const COL = {}
header.forEach((h, i) => { COL[h.trim()] = i })

console.log(`\nColumns detected: ${header.join(' | ')}`)
console.log(`Total data rows:  ${data.length}\n`)

const updated = []
const skipped = []

const newData = data.map((row, idx) => {
  const newRow    = [...row]
  const imageRef  = (row[COL['image_ref']] || '').trim()
  const imageUrl  = buildImageUrl(imageRef)
  const oldUrl    = (row[COL['image_url']] || '').trim()

  newRow[COL['image_url']] = imageUrl

  if (imageUrl && imageUrl !== oldUrl) {
    updated.push({ rowNum: idx + 2, imageRef, imageUrl })
  } else if (!imageUrl) {
    skipped.push({ rowNum: idx + 2, question: (row[COL['question']] || '').slice(0, 60) })
  }

  return newRow
})

// Write updated CSV
const outLines = [
  header.map(csvEscape).join(','),
  ...newData.map(row => row.map(csvEscape).join(','))
]
writeFileSync(CSV_PATH, outLines.join('\r\n'), 'utf8')

// ── Report ────────────────────────────────────────────────────────────────
console.log(`✓ UPDATED rows (${updated.length}):`)
console.log('─'.repeat(90))
updated.forEach(({ rowNum, imageRef, imageUrl }) => {
  console.log(`  Row ${String(rowNum).padStart(2)} | ref: ${imageRef.padEnd(22)} | url: ${imageUrl}`)
})

console.log(`\n— SKIPPED (no image_ref, rules-of-the-road) (${skipped.length}):`)
console.log('─'.repeat(90))
skipped.forEach(({ rowNum, question }) => {
  console.log(`  Row ${String(rowNum).padStart(2)} | "${question}..."`)
})

console.log(`\n✓ CSV saved: ${CSV_PATH}`)
console.log(`  Updated: ${updated.length} rows  |  Skipped: ${skipped.length} rows\n`)

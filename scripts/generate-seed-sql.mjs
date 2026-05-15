import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CSV_PATH = join(__dirname, '..', 'code8-test1-questions.csv')
const OUT_PATH = join(__dirname, 'seed-questions.sql')

// ── Proper CSV parser (handles quoted fields containing commas) ───────────
function parseCSV(raw) {
  const lines = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')
  return lines.filter(l => l.trim()).map(line => {
    const fields = []
    let cur = '', inQ = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') {
        if (inQ && line[i + 1] === '"') { cur += '"'; i++ }
        else inQ = !inQ
      } else if (ch === ',' && !inQ) {
        fields.push(cur); cur = ''
      } else cur += ch
    }
    fields.push(cur)
    return fields
  })
}

// Escape single quotes for SQL
function sql(val) {
  if (!val || val.trim() === '') return 'NULL'
  return `'${val.replace(/'/g, "''")}'`
}

const rows   = parseCSV(readFileSync(CSV_PATH, 'utf8'))
const header = rows[0].map(h => h.trim())
const data   = rows.slice(1)

const COL = {}
header.forEach((h, i) => { COL[h] = i })

const lines = []
lines.push(`-- =================================================================`)
lines.push(`-- K53 Platform — Seed: Code 8 Test 1 Questions`)
lines.push(`-- Generated: ${new Date().toISOString()}`)
lines.push(`-- Run in: Supabase Dashboard → SQL Editor → New Query`)
lines.push(`-- =================================================================`)
lines.push(``)
lines.push(`DO $$`)
lines.push(`DECLARE`)
lines.push(`  v_course_id bigint;`)
lines.push(`BEGIN`)
lines.push(`  -- Get the Code 8 course id`)
lines.push(`  SELECT id INTO v_course_id FROM courses WHERE code = 'code8';`)
lines.push(``)
lines.push(`  IF v_course_id IS NULL THEN`)
lines.push(`    RAISE EXCEPTION 'Course with code=code8 not found. Did you run schema.sql first?';`)
lines.push(`  END IF;`)
lines.push(``)
lines.push(`  -- Clear existing test 1 questions for this course (safe to re-run)`)
lines.push(`  DELETE FROM quiz_questions WHERE course_id = v_course_id AND test_number = 1;`)
lines.push(``)
lines.push(`  -- Insert all 62 questions`)
lines.push(`  INSERT INTO quiz_questions`)
lines.push(`    (course_id, test_number, question, option_a, option_b, option_c, correct_answer, image_url, image_ref)`)
lines.push(`  VALUES`)

const valueRows = []
let skipped = 0

for (const row of data) {
  const q    = (row[COL['question']]       || '').trim()
  const a    = (row[COL['option_a']]       || '').trim()
  const b    = (row[COL['option_b']]       || '').trim()
  const c    = (row[COL['option_c']]       || '').trim()
  const ans  = (row[COL['correct_answer']] || '').trim()
  const url  = (row[COL['image_url']]      || '').trim()
  const ref  = (row[COL['image_ref']]      || '').trim()
  const test = (row[COL['test_number']]    || '1').trim()

  if (!q || !a || !b || !c || !ans) { skipped++; continue }

  valueRows.push(
    `    (v_course_id, ${test}, ${sql(q)}, ${sql(a)}, ${sql(b)}, ${sql(c)}, ${sql(ans)}, ${sql(url)}, ${sql(ref)})`
  )
}

lines.push(valueRows.join(',\n') + ';')
lines.push(``)
lines.push(`  RAISE NOTICE 'Inserted % questions for course_id=%', ${valueRows.length}, v_course_id;`)
lines.push(`END $$;`)

const output = lines.join('\n')
writeFileSync(OUT_PATH, output, 'utf8')

console.log(`\n✓ SQL seed file written to: ${OUT_PATH}`)
console.log(`  Questions inserted:  ${valueRows.length}`)
if (skipped) console.log(`  Rows skipped (incomplete data): ${skipped}`)
console.log(`\nNext step:`)
console.log(`  1. Open: scripts/seed-questions.sql`)
console.log(`  2. Copy all contents`)
console.log(`  3. Paste into Supabase SQL Editor → Run`)

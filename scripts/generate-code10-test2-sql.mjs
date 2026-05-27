import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const TXT_PATH = join(__dirname, '..', 'code 10 test 2', 'gemini-code-1779896844431.txt')
const OUT_PATH = join(__dirname, 'migrations', 'seed-code10-test2.sql')

// CSV parser that handles quoted strings with commas and newlines
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

function sql(val) {
  if (!val || val.trim() === '') return 'NULL'
  return `'${val.replace(/'/g, "''")}'`
}

const rows = parseCSV(readFileSync(TXT_PATH, 'utf8'))
const header = rows[0]
const data = rows.slice(1)

const lines = []
lines.push(`-- =================================================================`)
lines.push(`-- K53 Platform — Seed: Code 10 Test 2 Questions`)
lines.push(`-- Generated: ${new Date().toISOString()}`)
lines.push(`-- Run in: Supabase Dashboard → SQL Editor → New Query`)
lines.push(`-- =================================================================`)
lines.push(``)
lines.push(`DO $$`)
lines.push(`DECLARE`)
lines.push(`  v_course_id bigint;`)
lines.push(`BEGIN`)
lines.push(`  -- Get the Code 10 course id`)
lines.push(`  SELECT id INTO v_course_id FROM courses WHERE code = 'code10';`)
lines.push(``)
lines.push(`  IF v_course_id IS NULL THEN`)
lines.push(`    RAISE EXCEPTION 'Course with code=code10 not found. Did you run schema.sql first?';`)
lines.push(`  END IF;`)
lines.push(``)
lines.push(`  -- Clear existing test 2 questions for this course (safe to re-run)`)
lines.push(`  DELETE FROM quiz_questions WHERE course_id = v_course_id AND test_number = 2;`)
lines.push(``)
lines.push(`  -- Insert all questions`)
lines.push(`  INSERT INTO quiz_questions`)
lines.push(`    (course_id, test_number, question, option_a, option_b, option_c, correct_answer, image_url, image_ref)`)
lines.push(`  VALUES`)

const valueRows = []
let skipped = 0

data.forEach((row, idx) => {
  const idStr = (row[0] || '').trim()
  const question = (row[1] || '').trim()
  const optionA = (row[2] || '').trim()
  const optionB = (row[3] || '').trim()
  const optionC = (row[4] || '').trim()
  const correctAns = (row[5] || '').trim()

  if (!question || !optionA || !optionB || !correctAns) {
    skipped++
    return
  }

  // Map image ref and image URL
  let imageRef = null
  let imageUrl = null

  if (idStr && !idStr.includes('rs')) {
    let filename = idStr
    // Resolve duplicate ids to their unique image counterparts
    // Index 32 is Line 34: 2c10.12.img.png
    // Index 34 is Line 36: 2c10.12.1.img.png
    // Index 40 is Line 42: 2c10.17.img.png
    // Index 41 is Line 43: 2c10.17.1.img.png
    if (idStr === '2c10.12.img' && idx === 34) {
      filename = '2c10.12.1.img'
    } else if (idStr === '2c10.17.img' && idx === 41) {
      filename = '2c10.17.1.img'
    }

    imageRef = `${filename}.png`
    imageUrl = `/images/code10/test2/${imageRef}`
  }

  valueRows.push(
    `    (v_course_id, 2, ${sql(question)}, ${sql(optionA)}, ${sql(optionB)}, ${sql(optionC)}, ${sql(correctAns)}, ${sql(imageUrl)}, ${sql(imageRef)})`
  )
})

lines.push(valueRows.join(',\n') + ';')
lines.push(``)
lines.push(`  RAISE NOTICE 'Inserted % questions for course_id=%', ${valueRows.length}, v_course_id;`)
lines.push(`END $$;`)

const output = lines.join('\n')
writeFileSync(OUT_PATH, output, 'utf8')

console.log(`\n✓ SQL seed file written to: ${OUT_PATH}`)
console.log(`  Questions parsed:  ${valueRows.length}`)
if (skipped) console.log(`  Rows skipped: ${skipped}`)

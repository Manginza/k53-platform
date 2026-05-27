import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const TXT_PATH = join(__dirname, '..', 'code 10 test 2', 'gemini-code-1779896844431.txt')

const SUPABASE_URL = 'https://wzqgjzqylkbwyvzyzywu.supabase.co'
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

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

const rows = parseCSV(readFileSync(TXT_PATH, 'utf8'))
const data = rows.slice(1)

const questions = []

data.forEach((row, idx) => {
  const idStr = (row[0] || '').trim()
  const question = (row[1] || '').trim()
  const optionA = (row[2] || '').trim()
  const optionB = (row[3] || '').trim()
  const optionC = (row[4] || '').trim()
  const correctAns = (row[5] || '').trim()

  if (!question || !optionA || !optionB || !correctAns) {
    return
  }

  let imageRef = null
  let imageUrl = null

  if (idStr && !idStr.includes('rs')) {
    let filename = idStr
    if (idStr === '2c10.12.img' && idx === 34) {
      filename = '2c10.12.1.img'
    } else if (idStr === '2c10.17.img' && idx === 41) {
      filename = '2c10.17.1.img'
    }
    imageRef = `${filename}.png`
    imageUrl = `/images/code10/test2/${imageRef}`
  }

  questions.push({
    course_id: 3, // Code 10 course id
    test_number: 2,
    question,
    option_a: optionA,
    option_b: optionB,
    option_c: optionC || null,
    correct_answer: correctAns,
    image_url: imageUrl,
    image_ref: imageRef,
  })
})

console.log(`Inserting ${questions.length} questions for Code 10 Test 2...`)

// First clear existing Test 2 questions
const deleteRes = await fetch(`${SUPABASE_URL}/rest/v1/quiz_questions?course_id=eq.3&test_number=eq.2`, {
  method: 'DELETE',
  headers: {
    'apikey': KEY,
    'Authorization': `Bearer ${KEY}`,
  }
})

if (!deleteRes.ok) {
  console.error(`Warning: Clear existing questions failed with status ${deleteRes.status}`)
}

const res = await fetch(`${SUPABASE_URL}/rest/v1/quiz_questions`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': KEY,
    'Authorization': `Bearer ${KEY}`,
    'Prefer': 'return=minimal',
  },
  body: JSON.stringify(questions),
})

if (res.ok) {
  console.log(`✓ Seeded ${questions.length} questions successfully (status ${res.status})`)
} else {
  const text = await res.text()
  console.error(`✗ Seed failed (${res.status}):`, text)
}

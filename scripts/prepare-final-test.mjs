import { readFileSync, writeFileSync, mkdirSync, readdirSync, copyFileSync } from 'node:fs'
import { basename, extname, join, resolve } from 'node:path'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'

const ROOT = resolve(new URL('..', import.meta.url).pathname.replace(/^\/(.:)/, '$1'))
const PDF = process.argv.find(arg => arg.startsWith('--pdf='))?.slice(6)
  ?? 'C:/Users/Administrator/Downloads/New-Age-K53-Manual-PDFDrive.pdf (1).pdf'
const IMAGE_SOURCE = join(ROOT, 'Motocycle,code8and10finaltest')
const IMAGE_DEST = join(ROOT, 'public', 'images', 'final-test')
const DATA_DEST = join(ROOT, 'scripts', 'final-test-data.json')

const ANSWERS = {
  A: 'ACACCABBBBAACACBABABCBCCBACBCACC',
  B: 'BBCBACABBCBBACCBCCAAACACBCBBAABAABBACCAACBCCABACBACABBCBABAC',
  C: 'CCAABACBBCCBACBABBBCBACCCACBCCBCBCCBCBBBAABCACBAAAAACBBBCBBC',
}

function clean(value) {
  return value
    .replace(/fi\s+/g, 'fi')
    .replace(/fl\s+/g, 'fl')
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,;:?!])/g, '$1')
    .trim()
}

async function extractPage(pageNumber, document) {
  const page = await document.getPage(pageNumber)
  const content = await page.getTextContent()
  const width = page.getViewport({ scale: 1 }).width
  const columns = [[], []]

  for (const item of content.items) {
    const text = item.str?.trim()
    const x = item.transform?.[4]
    const y = item.transform?.[5]
    if (!text || y < 50 || y > 760) continue
    columns[x < width / 2 ? 0 : 1].push({ text, x, y })
  }

  return columns.map(column => {
    const lines = []
    for (const item of column.sort((a, b) => b.y - a.y || a.x - b.x)) {
      let line = lines.find(candidate => Math.abs(candidate.y - item.y) < 1.5)
      if (!line) {
        line = { y: item.y, items: [] }
        lines.push(line)
      }
      line.items.push(item)
    }
    return lines.map(line => line.items.sort((a, b) => a.x - b.x).map(item => item.text).join(' ')).join('\n')
  }).join('\n')
}

function parseQuestions(section, text, answers) {
  const starts = [...text.matchAll(/^([1-9]|[1-5]\d|60)\.\s+/gm)]
  const matches = starts.map((match, index) => ({
    number: Number(match[1]),
    body: text.slice(match.index + match[0].length, starts[index + 1]?.index ?? text.length).trim(),
  }))
  const questions = matches.flatMap(match => {
    const number = match.number
    const body = match.body
    const options = body.match(/^([\s\S]*?)\s+A\.\s*([\s\S]*?)\s+B\.\s*([\s\S]*?)\s+C\.\s*([\s\S]*)$/)
    // Page one also contains numbered test instructions in the opposite
    // column; unlike real questions they do not contain A/B/C choices.
    if (!options) return []
    return [{
      section,
      number,
      question: clean(options[1]),
      option_a: clean(options[2]),
      option_b: clean(options[3]),
      option_c: clean(options[4]),
      correct_answer: answers[number - 1],
      image_url: null,
      image_ref: null,
    }]
  })

  const expected = section === 'A' ? 32 : 60
  if (questions.length !== expected) throw new Error(`Test ${section}: expected ${expected} questions, parsed ${questions.length}`)
  questions.forEach((question, index) => {
    if (question.number !== index + 1) throw new Error(`Test ${section}: missing or duplicate question near ${index + 1}`)
    if (!question.correct_answer) throw new Error(`Test ${section}, question ${question.number}: missing memo answer`)
  })
  return questions
}

function imageIndex() {
  const index = new Map()
  for (const name of readdirSync(IMAGE_SOURCE)) index.set(name.toLowerCase(), name)
  return index
}

function findImage(index, section, number) {
  // The first groups use one shared labelled-controls diagram in the manual.
  if (section === 'A' && number <= 9) return index.get('1.png')
  if (section === 'A' && number >= 10 && number <= 18) return index.get('10.png')

  const prefix = section === 'A' ? '' : section.toLowerCase()
  for (const extension of ['png', 'jpg', 'jpeg']) {
    const found = index.get(`${prefix}${number}.${extension}`)
    if (found) return found
  }
  return null
}

function attachImages(questions) {
  const index = imageIndex()
  mkdirSync(IMAGE_DEST, { recursive: true })
  for (const question of questions) {
    const sourceName = findImage(index, question.section, question.number)
    if (!sourceName) continue
    const extension = extname(sourceName).toLowerCase()
    const outputName = `test-${question.section.toLowerCase()}-q${question.number}${extension}`
    copyFileSync(join(IMAGE_SOURCE, sourceName), join(IMAGE_DEST, outputName))
    question.image_url = `/images/final-test/${outputName}`
    question.image_ref = basename(sourceName)
  }
}

const data = new Uint8Array(readFileSync(PDF))
const document = await getDocument({ data }).promise
let text = ''
for (let page = 1; page <= 11; page++) text += `${await extractPage(page, document)}\n`
await document.destroy()

const startA = text.indexOf('\nTEST A\n')
const startB = text.indexOf('\nTEST B\n', startA + 1)
const startC = text.indexOf('\nTEST C\n', startB + 1)
if (startA < 0 || startB < 0 || startC < 0) throw new Error('Could not find all three test headings in the PDF')

const tests = [
  ...parseQuestions('A', text.slice(startA + 8, startB), ANSWERS.A),
  ...parseQuestions('B', text.slice(startB + 8, startC), ANSWERS.B),
  ...parseQuestions('C', text.slice(startC + 8), ANSWERS.C),
]

// Remove a handful of diagram labels/column-edge artefacts introduced by PDF
// text extraction. The wording below is visible in the rendered manual.
const corrections = {
  'A:9:option_c': 'Only (i) and (iii) are correct.',
  'A:31:option_a': 'Change lanes only if it is safe to do so. Indicate in time to show what you intend doing.',
  'A:31:option_b': 'Check in the mirrors and blind spots to see what other traffic is doing.',
  'A:32:option_a': 'The road ahead winds from left to right.',
  'A:32:option_c': 'There are concealed entrances ahead, first from the left, then from the right.',
  'B:17:option_b': 'There is a detour to the left at this point.',
  'B:19:question': 'At the next intersection, vehicles travelling in the lane marked with the arrow labelled “E”…',
  'B:30:option_a': 'You must stop before the white line and proceed when it is safe to do so.',
}
for (const question of tests) {
  for (const field of ['question', 'option_a', 'option_b', 'option_c']) {
    const replacement = corrections[`${question.section}:${question.number}:${field}`]
    if (replacement) question[field] = replacement
  }
}

attachImages(tests)
writeFileSync(DATA_DEST, `${JSON.stringify(tests, null, 2)}\n`)

const imageCounts = Object.fromEntries(['A', 'B', 'C'].map(section => [section, tests.filter(q => q.section === section && q.image_url).length]))
console.log(`Prepared ${tests.length} questions (A: 32, B: 60, C: 60)`)
console.log(`Images assigned — A: ${imageCounts.A}, B: ${imageCounts.B}, C: ${imageCounts.C}`)
console.log(`Data: ${DATA_DEST}`)
console.log(`Images: ${IMAGE_DEST}`)

// Parse Code 10 Test 2 Word doc XML to extract correct answers (green-bordered paragraphs)
import { readFileSync } from 'fs'

const xml = readFileSync('C:/Temp/code10test2/word/document.xml', 'utf8')

// Split into paragraphs
const paraRegex = /<w:p[ >][\s\S]*?<\/w:p>/g
const paras = xml.match(paraRegex) || []

// Extract text from a paragraph
function getText(para) {
  const matches = [...para.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)]
  return matches.map(m => m[1]).join('').trim()
}

// Check if paragraph has green border (correct answer)
function isCorrect(para) {
  return para.includes('w:color="90ee90"') || para.includes("w:color='90ee90'")
}

// Check if paragraph has list numbering (option A/B/C)
function hasListNum(para) {
  return para.includes('<w:numId') && para.includes('<w:ilvl')
}

// Parse results
const results = []
let currentQuestion = null
let currentOptions = []

for (const para of paras) {
  const text = getText(para)
  if (!text) continue

  // Detect image ref or question start (e.g., "2c10.1.img What does...")
  // or a standalone question line
  const isOption = /^[ABC]\.\s/.test(text)

  if (isOption) {
    const letter = text[0]
    const correct = isCorrect(para)
    currentOptions.push({ letter, text: text.slice(3).trim(), correct })
  } else {
    // It's a question or header line
    if (currentQuestion && currentOptions.length > 0) {
      const correctOpt = currentOptions.find(o => o.correct)
      results.push({
        question: currentQuestion,
        correctAnswer: correctOpt ? correctOpt.letter : '?',
        options: currentOptions
      })
    }
    currentQuestion = text
    currentOptions = []
  }
}
// Last question
if (currentQuestion && currentOptions.length > 0) {
  const correctOpt = currentOptions.find(o => o.correct)
  results.push({
    question: currentQuestion,
    correctAnswer: correctOpt ? correctOpt.letter : '?',
    options: currentOptions
  })
}

// Print results
results.forEach((r, i) => {
  console.log(`Q${i+1}: ${r.question.substring(0, 60)}... → ${r.correctAnswer}`)
})
console.log(`\nTotal questions parsed: ${results.length}`)

import fs from 'fs'

const questions = JSON.parse(fs.readFileSync('questions_dump.json', 'utf8'))

const code8T3 = questions.filter(q => q.course && q.course.includes('Code 8') && q.test_number === 3)

let md = '# Code 8 Test 3\n\n'
code8T3.forEach((q, i) => {
  md += `### ${i + 1}. ${q.question}\n`
  md += `- A: ${q.option_a}\n`
  md += `- B: ${q.option_b}\n`
  md += `- C: ${q.option_c}\n`
  md += `**Correct Answer:** ${q.correct_answer}\n`
  if (q.image_ref) md += `*Image:* ${q.image_ref}\n`
  md += '\n'
})

fs.writeFileSync('C:\\Users\\Administrator\\.gemini\\antigravity\\brain\\311237c9-7876-41db-a027-5eeb6a4c1c26\\scratch\\code8_review.md', md)
console.log(`Dumped ${code8T3.length} Test 3 questions.`)

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const supabaseUrl = 'https://wzqgjzqylkbwyvzyzywu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6cWdqenF5bGtid3l2enl6eXd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2OTAzMzEsImV4cCI6MjA5NDI2NjMzMX0.nMf6uVn3n7u9AAlnh-6-5ZbBeZGQlBjMAL3eIfFz92M'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function fetchQuestions() {
  const { data: courses } = await supabase.from('courses').select('*')
  
  const { data: questions, error } = await supabase
    .from('quiz_questions')
    .select('*')

  if (error) {
    console.error('Error fetching questions:', error)
    return
  }

  console.log(`Fetched ${questions.length} questions.`)
  
  // Map course IDs to names
  const courseMap = {}
  courses.forEach(c => courseMap[c.id] = c.title)

  const output = questions.map(q => ({
    id: q.id,
    course: courseMap[q.course_id],
    test_number: q.test_number,
    question: q.question,
    option_a: q.option_a,
    option_b: q.option_b,
    option_c: q.option_c,
    correct_answer: q.correct_answer,
    image_ref: q.image_ref
  }))

  fs.writeFileSync('questions_dump.json', JSON.stringify(output, null, 2))
  console.log('Saved to questions_dump.json')
}

fetchQuestions()

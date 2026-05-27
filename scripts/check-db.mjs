import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wzqgjzqylkbwyvzyzywu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6cWdqenF5bGtid3l2enl6eXd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2OTAzMzEsImV4cCI6MjA5NDI2NjMzMX0.nMf6uVn3n7u9AAlnh-6-5ZbBeZGQlBjMAL3eIfFz92M'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function check() {
  const { data: courses } = await supabase.from('courses').select('*')
  console.log('Courses in database:', courses)

  const { data: counts, error } = await supabase
    .from('quiz_questions')
    .select('test_number')
    .eq('course_id', 3)
  
  if (error) {
    console.error('Error fetching questions:', error)
  } else {
    const grouped = {}
    counts.forEach(q => {
      grouped[q.test_number] = (grouped[q.test_number] || 0) + 1
    })
    console.log('Question counts for Code 10 (course_id = 3) by test number:', grouped)
  }
}

check()

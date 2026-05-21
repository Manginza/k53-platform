import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://wzqgjzqylkbwyvzyzywu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6cWdqenF5bGtid3l2enl6eXd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2OTAzMzEsImV4cCI6MjA5NDI2NjMzMX0.nMf6uVn3n7u9AAlnh-6-5ZbBeZGQlBjMAL3eIfFz92M'
)

const BUCKET = 'Code 10 Memo Slide Show'
const FOLDER = 'code 10 Memo Part 1'

const { data, error } = await supabase.storage
  .from(BUCKET)
  .list(FOLDER, { limit: 500, sortBy: { column: 'name', order: 'asc' } })

if (error) {
  console.error('Error:', error.message)
  process.exit(1)
}

console.log(`Files in "${BUCKET}/${FOLDER}": ${data.length}`)
data.forEach(f => {
  console.log(`  ${f.name}`)
})

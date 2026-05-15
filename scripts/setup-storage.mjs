import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wzqgjzqylkbwyvzyzywu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6cWdqenF5bGtid3l2enl6eXd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2OTAzMzEsImV4cCI6MjA5NDI2NjMzMX0.nMf6uVn3n7u9AAlnh-6-5ZbBeZGQlBjMAL3eIfFz92M'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

const BUCKET = 'resources'
const FOLDERS = [
  'code8/shared/.gitkeep',
  'code8/test1/.gitkeep',
]

async function createFolders() {
  console.log(`\nCreating folder structure in bucket: "${BUCKET}"\n`)

  for (const path of FOLDERS) {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(path, new Blob(['']), { upsert: true })

    const folder = path.replace('/.gitkeep', '/')
    if (error) {
      console.error(`  ✗ ${folder}  →  ${error.message}`)
    } else {
      const publicUrl = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
      const folderUrl = publicUrl.replace('.gitkeep', '')
      console.log(`  ✓ ${folder}`)
      console.log(`    URL: ${folderUrl}`)
    }
  }

  console.log('\nDone.\n')
}

createFolders()

import { createClient } from '@supabase/supabase-js'
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const SUPABASE_URL = 'https://wzqgjzqylkbwyvzyzywu.supabase.co'
const BUCKET = 'resources'
const STORAGE_FOLDER = 'code10/test 2'

// Try service role key first, fall back to anon key
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6cWdqenF5bGtid3l2enl6eXd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2OTAzMzEsImV4cCI6MjA5NDI2NjMzMX0.nMf6uVn3n7u9AAlnh-6-5ZbBeZGQlBjMAL3eIfFz92M'

const supabase = createClient(SUPABASE_URL, KEY)

const sourceDir = join(__dirname, '..', 'code 10 test 2')
const files = readdirSync(sourceDir).filter(f => f.toLowerCase().endsWith('.png'))

console.log(`\nUploading ${files.length} images to ${BUCKET}/${STORAGE_FOLDER}/\n`)

const results = []

for (const filename of files) {
  const filePath = join(sourceDir, filename)
  const fileBuffer = readFileSync(filePath)
  const storagePath = `${STORAGE_FOLDER}/${filename}`

  process.stdout.write(`  Uploading: ${filename}... `)

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, fileBuffer, {
      contentType: 'image/png',
      upsert: true,
    })

  if (error) {
    console.log(`✗  ${error.message}`)
    results.push({ filename, success: false, error: error.message })
  } else {
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath)
    console.log(`✓`)
    results.push({ filename, success: true, url: data.publicUrl })
  }
}

console.log('\n' + '─'.repeat(80))
console.log('RESULTS:\n')

const succeeded = results.filter(r => r.success)
const failed = results.filter(r => !r.success)

succeeded.forEach(r => console.log(`✓  ${r.filename}\n   ${r.url}\n`))

if (failed.length) {
  console.log('\nFAILED:')
  failed.forEach(r => console.log(`✗  ${r.filename} — ${r.error}`))
}

console.log(`\nDone: ${succeeded.length}/${results.length} uploaded successfully`)

#!/usr/bin/env node
/**
 * scripts/generate-explanations.mjs
 *
 * Creates Learn Mode explanation rows for questions that don't have one yet,
 * in batches, using the correct answer ALREADY stored on each question. It
 * never changes a question's correct_answer, and it never invents rules,
 * distances or fines: when it cannot produce confident content it writes a
 * stub with needs_review = true and null prose for a human (or an LLM pass
 * plugged into draftExplanation) to complete in the admin review screen.
 *
 * Usage:
 *   node scripts/generate-explanations.mjs            # all questions missing a row
 *   node scripts/generate-explanations.mjs --limit 50 # first 50 only
 *   node scripts/generate-explanations.mjs --seed-only # just the worked example
 *
 * Requires a REAL service-role key (RLS blocks writes otherwise):
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY  (read from .env.local)
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

// ── env ──────────────────────────────────────────────────────────────────────
function loadEnv() {
  const env = { ...process.env }
  try {
    const txt = readFileSync(join(ROOT, '.env.local'), 'utf8')
    for (const line of txt.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/)
      if (m && !(m[1] in env)) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '')
    }
  } catch { /* rely on process.env */ }
  return env
}

function keyLooksServiceRole(key) {
  if (!key) return false
  if (key.startsWith('sb_secret_')) return true
  if (key.startsWith('sb_publishable_')) return false
  const parts = key.split('.')
  if (parts.length !== 3) return false
  try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString())
    return payload.role === 'service_role'
  } catch { return false }
}

// ── the generator boundary ─────────────────────────────────────────────────
/**
 * Produce explanation content for a question, or null to leave it for review.
 *
 * Default implementation deliberately returns null: it does NOT fabricate
 * legislative content. Plug an LLM or hand-authoring here, and keep the
 * contract — return null (→ needs_review) rather than guess, and never
 * contradict `question.correct_answer`.
 */
async function draftExplanation(_question) {
  return null
}

/**
 * Guard: refuse content that names a different correct option than the one
 * stored on the question. Returns true when the draft is safe to store.
 */
function agreesWithStoredAnswer(draft, correctLetter) {
  if (!draft) return true
  const text = `${draft.why ?? ''} ${draft.common_mistake ?? ''}`
  const claimed = text.match(/\banswer\s+is\s+([ABCD])\b/i)?.[1]?.toUpperCase()
  if (claimed && claimed !== correctLetter) return false
  return true
}

async function main() {
  const env = loadEnv()
  const url = env.NEXT_PUBLIC_SUPABASE_URL
  const key = env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) { console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY'); process.exit(1) }
  if (!keyLooksServiceRole(key)) {
    console.error('SUPABASE_SERVICE_ROLE_KEY is not a service-role key — RLS will block writes. Aborting.')
    process.exit(1)
  }

  const args = process.argv.slice(2)
  const seedOnly = args.includes('--seed-only')
  const limitArg = args.indexOf('--limit')
  const limit = limitArg >= 0 ? Number(args[limitArg + 1]) : Infinity

  const db = createClient(url, key, { auth: { persistSession: false } })

  // ── Seed the worked example (attach only if a matching question exists) ──
  const example = JSON.parse(readFileSync(join(__dirname, 'learn-mode-example.json'), 'utf8'))
  const { data: candidates } = await db
    .from('quiz_questions')
    .select('id, question, image_ref')
    .or(example.match.question_contains.map(t => `question.ilike.%${t}%`).join(','))
  const match = (candidates ?? [])[0]
  if (match) {
    await db.from('question_explanations').upsert({
      question_id: match.id, ...example.explanation,
      reviewed: true, needs_review: false, source: 'seed', updated_at: new Date().toISOString(),
    }, { onConflict: 'question_id' })
    console.log(`Seeded worked example onto question #${match.id}.`)
  } else {
    console.log('No question matches the worked keep-left example; it stands as the format template in scripts/learn-mode-example.json.')
  }
  if (seedOnly) { console.log('Seed-only run complete.'); return }

  // ── Draft rows for questions that have none ──────────────────────────────
  const { data: questions, error } = await db
    .from('quiz_questions')
    .select('id, question, option_a, option_b, option_c, correct_answer')
    .order('id')
  if (error) { console.error('Failed to read questions:', error.message); process.exit(1) }

  const { data: existing } = await db.from('question_explanations').select('question_id')
  const have = new Set((existing ?? []).map(r => r.question_id))

  let drafted = 0, stubbed = 0, flagged = 0, processed = 0
  for (const q of questions ?? []) {
    if (have.has(q.id)) continue
    if (processed >= limit) break
    processed++

    const draft = await draftExplanation(q)
    if (draft && !agreesWithStoredAnswer(draft, q.correct_answer)) {
      // Content disagreed with the stored answer — never override the answer; flag instead.
      await db.from('question_explanations').upsert({
        question_id: q.id, why: null, practical: null, common_mistake: null, alt_questions: [],
        reviewed: false, needs_review: true, source: 'generated', updated_at: new Date().toISOString(),
      }, { onConflict: 'question_id' })
      flagged++
      continue
    }

    await db.from('question_explanations').upsert({
      question_id: q.id,
      why: draft?.why ?? null,
      practical: draft?.practical ?? null,
      common_mistake: draft?.common_mistake ?? null,
      alt_questions: draft?.alt_questions ?? [],
      related_href: draft?.related_href ?? null,
      reviewed: false,
      needs_review: true,
      source: 'generated',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'question_id' })
    if (draft) drafted++; else stubbed++
  }

  console.log(`Done. Processed ${processed}: ${drafted} drafted, ${stubbed} stubbed for review, ${flagged} flagged (answer mismatch).`)
  console.log('Review and approve at /admin/learn-review before learners see them.')
}

main().catch(e => { console.error(e); process.exit(1) })

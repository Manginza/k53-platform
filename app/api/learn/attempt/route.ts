/**
 * POST /api/learn/attempt — record that the signed-in learner answered a
 * question, and whether it was correct. Returns how many attempts came before
 * this one so the client can decide whether to auto-open the Learn panel.
 *
 * Anonymous visitors have no durable record, so this returns { tracked:false }
 * and the client shows the panel after every answer for them. Body:
 * { questionId:number, correct:boolean }.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import { recordQuestionAttempt } from '@/lib/learn-mode'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ tracked: false, attemptCountBefore: 0 })

  let questionId = 0
  let correct = false
  try {
    const b = await req.json()
    questionId = Number(b.questionId)
    correct = Boolean(b.correct)
  } catch { /* handled below */ }

  if (!questionId || !Number.isFinite(questionId)) {
    return NextResponse.json({ error: 'questionId required' }, { status: 400 })
  }

  try {
    const before = await recordQuestionAttempt(createAdminClient(), user.id, questionId, correct)
    return NextResponse.json({ tracked: true, attemptCountBefore: before })
  } catch (error) {
    console.error('[learn/attempt] record failed', error instanceof Error ? error.message : error)
    // Fail open: let the client treat it as a first encounter and show the panel.
    return NextResponse.json({ tracked: false, attemptCountBefore: 0 })
  }
}

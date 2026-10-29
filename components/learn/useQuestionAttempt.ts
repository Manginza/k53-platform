'use client'

/**
 * useQuestionAttempt — records each answer against the signed-in learner's
 * per-question history and returns whether the Learn panel should auto-open.
 * Resolves to a fail-open decision (show the panel) on any network error.
 */
import { useCallback } from 'react'
import { decideLearnPanel, type LearnPanelDecision } from '@/lib/learn-mode-logic'

export function useQuestionAttempt() {
  const record = useCallback(async (questionId: number, correct: boolean): Promise<LearnPanelDecision> => {
    try {
      const res = await fetch('/api/learn/attempt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId, correct }),
      })
      const data = await res.json()
      return decideLearnPanel({
        attemptCountBefore: typeof data.attemptCountBefore === 'number' ? data.attemptCountBefore : 0,
        wasCorrect: correct,
        tracked: Boolean(data.tracked),
      })
    } catch {
      return { autoShow: true, showButton: true }
    }
  }, [])

  return { record }
}

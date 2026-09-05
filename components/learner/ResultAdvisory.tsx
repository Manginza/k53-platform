'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import NextStepCard from '@/components/learner/NextStepCard'
import type { NextStep } from '@/lib/learner-progress'

type Option = 'A' | 'B' | 'C'

interface Props {
  courseId: number
  testNumber: number
  submissionKey: string
  answers: Record<number, Option>
  questionIds: number[]
}

interface SaveResult {
  attemptCount: number
  nextStep: NextStep
}

export default function ResultAdvisory(props: Props) {
  const { courseId, testNumber, submissionKey, answers, questionIds } = props
  const [result, setResult] = useState<SaveResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/progress/practice-attempt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId, testNumber, submissionKey, answers, questionIds }),
    }).then(async response => {
      const body = await response.json()
      if (!response.ok) throw new Error(body.error ?? 'Unable to save progress.')
      if (!cancelled) setResult(body)
    }).catch(reason => {
      if (!cancelled) setError(reason instanceof Error ? reason.message : 'Unable to save progress.')
    })
    return () => { cancelled = true }
  }, [courseId, testNumber, submissionKey, answers, questionIds])

  if (result) return <NextStepCard nextStep={result.nextStep} attemptCount={result.attemptCount} />

  if (error) {
    const loginRequired = error.toLowerCase().includes('log in')
    return (
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
        <h2 className="font-bold">Your result is ready</h2>
        <p className="mt-1">{error}</p>
        {loginRequired && <Link href="/login" className="mt-3 inline-block font-bold text-blue-700 hover:underline">Log in to track progress →</Link>}
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-blue-100 bg-white p-5 text-sm text-gray-500" aria-live="polite">
      Saving your result and preparing your next step…
    </section>
  )
}

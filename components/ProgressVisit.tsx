'use client'

import { useEffect } from 'react'
import type { LearnerSection } from '@/lib/learner-progress'

export default function ProgressVisit({ section }: { section: LearnerSection }) {
  useEffect(() => {
    fetch('/api/progress/section', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section, action: 'visited' }),
      keepalive: true,
    }).catch(() => {})
  }, [section])

  return null
}


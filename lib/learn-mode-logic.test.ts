import { describe, it, expect } from 'vitest'
import { decideLearnPanel } from './learn-mode-logic'

describe('decideLearnPanel', () => {
  it('first time, correct → auto-shows', () => {
    expect(decideLearnPanel({ attemptCountBefore: 0, wasCorrect: true, tracked: true }))
      .toEqual({ autoShow: true, showButton: true })
  })

  it('first time, wrong → auto-shows', () => {
    expect(decideLearnPanel({ attemptCountBefore: 0, wasCorrect: false, tracked: true }))
      .toEqual({ autoShow: true, showButton: true })
  })

  it('repeat, correct → does NOT auto-show, button stays', () => {
    expect(decideLearnPanel({ attemptCountBefore: 1, wasCorrect: true, tracked: true }))
      .toEqual({ autoShow: false, showButton: true })
    expect(decideLearnPanel({ attemptCountBefore: 5, wasCorrect: true, tracked: true }).autoShow)
      .toBe(false)
  })

  it('repeat, wrong → auto-opens', () => {
    expect(decideLearnPanel({ attemptCountBefore: 1, wasCorrect: false, tracked: true }))
      .toEqual({ autoShow: true, showButton: true })
  })

  it('untracked (anonymous) → always shows after answering', () => {
    expect(decideLearnPanel({ attemptCountBefore: 0, wasCorrect: true, tracked: false }).autoShow).toBe(true)
    expect(decideLearnPanel({ attemptCountBefore: 9, wasCorrect: true, tracked: false }).autoShow).toBe(true)
  })
})

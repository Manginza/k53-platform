import { describe, it, expect } from 'vitest'
import { decideLearnPanel, isValidAltQuestion } from './learn-mode-logic'

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

describe('isValidAltQuestion', () => {
  const original = 'When seeing this sign the driver knows that he/she must...'

  it('accepts a well-formed alternative', () => {
    expect(isValidAltQuestion(
      { question: 'What does this sign mean?', options: ['Keep left', 'Keep right', 'Stop'], correct: 0, reason: 'r' },
      original,
    )).toBe(true)
  })

  it('rejects an out-of-range correct index', () => {
    expect(isValidAltQuestion(
      { question: 'Q', options: ['a', 'b'], correct: 2, reason: 'r' }, original,
    )).toBe(false)
  })

  it('rejects fewer than two options', () => {
    expect(isValidAltQuestion(
      { question: 'Q', options: ['only one'], correct: 0, reason: 'r' }, original,
    )).toBe(false)
  })

  it('rejects a verbatim copy of the original question', () => {
    expect(isValidAltQuestion(
      { question: original, options: ['a', 'b'], correct: 0, reason: 'r' }, original,
    )).toBe(false)
  })
})

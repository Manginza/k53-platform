import { describe, expect, it } from 'vitest'
import { categoryFor, isMotorcycleQuestion, isSplitTest, orderForTest, passedSplit, sectionScores } from './quiz-format'

describe('isMotorcycleQuestion', () => {
  it('matches the motorcycle ranges from the manual', () => {
    expect(isMotorcycleQuestion({ question: 'Test A · Question 10' })).toBe(true)
    expect(isMotorcycleQuestion({ question: 'Test A · Question 18' })).toBe(true)
    expect(isMotorcycleQuestion({ question: 'Test A · Question 9' })).toBe(false)
    expect(isMotorcycleQuestion({ question: 'Test C · Question 25' })).toBe(true)
    expect(isMotorcycleQuestion({ question: 'Test C · Question 24' })).toBe(false)
    expect(isMotorcycleQuestion({ question: 'Test B · Question 12' })).toBe(false)
    expect(isMotorcycleQuestion({ question: 'When may you overtake?' })).toBe(false)
  })
})

describe('orderForTest', () => {
  const rows = [
    { id: 1, question: 'Sign', image_url: '/a.png' },
    { id: 2, question: 'Rule', image_url: null },
    { id: 3, question: 'Test A · Question 10', image_url: null },
  ]

  it('puts rules before signs on a split test', () => {
    expect(orderForTest(rows, true, false).map(row => row.id)).toEqual([2, 3, 1])
  })

  it('drops motorcycle questions when asked', () => {
    expect(orderForTest(rows, false, true).map(row => row.id)).toEqual([1, 2])
  })

  it('only treats Code 8 and Code 10 test 2 as split', () => {
    expect(isSplitTest('code8', 2)).toBe(true)
    expect(isSplitTest('code10', 2)).toBe(true)
    expect(isSplitTest('code8', 1)).toBe(false)
    expect(isSplitTest('final-k53', 2)).toBe(false)
  })
})

describe('section scores', () => {
  it('scores rules and signs separately and applies the pass mark of 22', () => {
    const questions = [
      { id: 1, image_url: null },
      { id: 2, image_url: '/sign.png' },
    ]
    const scores = sectionScores(questions, [{ q: 1, ok: true }, { q: 2, ok: false }])
    expect(scores).toEqual({ rules: { correct: 1, total: 1 }, signs: { correct: 0, total: 1 } })
    expect(passedSplit(22, 22)).toBe(true)
    expect(passedSplit(22, 21)).toBe(false)
  })

  it('classifies a sign picture separately from a controls question', () => {
    expect(categoryFor({ question: 'What does this sign mean?', image_url: '/a.png', image_ref: null })).toBe('Road Signs & Markings')
    expect(categoryFor({ question: 'The clutch is used to…', image_url: null, image_ref: null })).toBe('Vehicle Controls')
    expect(categoryFor({ question: 'You must stop at a red light.', image_url: null, image_ref: null })).toBe('Rules of the Road')
  })
})

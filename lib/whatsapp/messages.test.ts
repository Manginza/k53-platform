import { describe, expect, it } from 'vitest'
import {
  classifyText, countsAsFreeAttempt, maskNumber, needsSplitDelivery,
  optionLetters, questionBody, readLearnerMessage, resultText,
} from './messages'

describe('classifyText', () => {
  it('accepts a typed answer and rejects a word that merely contains the letter', () => {
    expect(classifyText('b')).toEqual({ type: 'answer', letter: 'B' })
    expect(classifyText('(c)')).toEqual({ type: 'answer', letter: 'C' })
    expect(classifyText('A.')).toEqual({ type: 'answer', letter: 'A' })
    expect(classifyText('bye')).toEqual({ type: 'other' })
    expect(classifyText('cab')).toEqual({ type: 'other' })
  })

  it('recognises the command words, including punctuation', () => {
    expect(classifyText('STOP!').type).toBe('stop')
    expect(classifyText('full-access').type).toBe('buy')
    expect(classifyText('log in').type).toBe('link')
    expect(classifyText('?').type).toBe('help')
    expect(classifyText('hello').type).toBe('menu')
  })
})

describe('readLearnerMessage', () => {
  it('reads taps, typed text, and ignores reactions', () => {
    expect(readLearnerMessage({ type: 'text', text: { body: 'hi' } })).toEqual({ action: 'reply', text: 'hi', replyId: undefined })
    expect(readLearnerMessage({ type: 'interactive', interactive: { button_reply: { id: 'ans:1:0:A' } } }))
      .toEqual({ action: 'reply', text: undefined, replyId: 'ans:1:0:A' })
    expect(readLearnerMessage({ type: 'reaction' })).toEqual({ action: 'ignore' })
    expect(readLearnerMessage({ type: 'image' })).toEqual({ action: 'unsupported' })
  })
})

describe('question text', () => {
  it('hides a blank option C and splits a message WhatsApp would reject', () => {
    const body = questionBody(
      { question: 'Is this a stop sign?', option_a: 'True.', option_b: 'False.', option_c: '   ' },
      0, 10, 90,
    )
    expect(body).toContain('*A*  True.')
    expect(body).toContain('*B*  False.')
    expect(body).not.toContain('*C*')
    expect(body).toContain('1:30 left')
    expect(optionLetters({ option_a: 'True.', option_b: 'False.', option_c: '' })).toEqual(['A', 'B'])
    expect(needsSplitDelivery(body)).toBe(false)
    expect(needsSplitDelivery('x'.repeat(1025))).toBe(true)
  })
})

describe('free attempts and scores', () => {
  it('does not burn a free try that was opened and immediately replaced', () => {
    expect(countsAsFreeAttempt(0, 'replaced')).toBe(false)
    expect(countsAsFreeAttempt(0, null)).toBe(false)
    expect(countsAsFreeAttempt(0, 'stopped')).toBe(true)
    expect(countsAsFreeAttempt(1, 'replaced')).toBe(true)
    expect(countsAsFreeAttempt(3, 'time')).toBe(true)
  })

  it('states the pass mark once the test is over', () => {
    const text = resultText({
      reason: 'completed', label: 'Code 8 · Test 2', correct: 40, total: 60, answered: 60,
      split: { rules: { correct: 22, total: 30 }, signs: { correct: 18, total: 30 } },
    })
    expect(text).toContain('Rules of the Road: *22* of 30')
    expect(text).toContain('Road Signs & Controls: *18* of 30')
    expect(text).toContain('both sections must be passed')
  })

  it('masks a phone number', () => {
    expect(maskNumber('27821234567')).toBe('+27 ••• ••• 4567')
  })
})

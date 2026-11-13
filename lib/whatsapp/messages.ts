/**
 * lib/whatsapp/messages.ts — pure WhatsApp conversation text.
 *
 * No database and no network, so the wording and the routing rules can be
 * tested on their own. The bot in lib/whatsapp/bot.ts is the only caller.
 */
import { SPLIT_PASS_MARK, STANDARD_PASS_PERCENT, type SectionScore } from '@/lib/quiz-format'
import { LIMITS } from '@/lib/whatsapp/api'

export type Letter = 'A' | 'B' | 'C'

export type TextCommand =
  | { type: 'answer'; letter: Letter }
  | { type: 'stop' }
  | { type: 'buy' }
  | { type: 'link' }
  | { type: 'help' }
  | { type: 'menu' }
  | { type: 'other' }

const STOP = new Set(['stop', 'quit', 'end', 'exit', 'cancel'])
const BUY = new Set(['buy', 'pay', 'access', 'price', 'pricing', 'full access'])
const LINK = new Set(['link', 'account', 'login', 'log in'])
const MENU = new Set(['menu', 'hi', 'hello', 'hey', 'start', 'tests', 'test'])

/** What a typed message is asking for. Buttons are handled separately. */
export function classifyText(raw: string | undefined): TextCommand {
  const text = (raw ?? '').trim()
  const typed = /^\(?\s*([abc])\s*[).]?$/i.exec(text)
  if (typed) return { type: 'answer', letter: typed[1].toUpperCase() as Letter }
  if (/^\?+$/.test(text)) return { type: 'help' }
  const word = text.toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim()
  if (STOP.has(word)) return { type: 'stop' }
  if (BUY.has(word)) return { type: 'buy' }
  if (LINK.has(word)) return { type: 'link' }
  if (word === 'help') return { type: 'help' }
  if (MENU.has(word)) return { type: 'menu' }
  return { type: 'other' }
}

export interface LearnerMessageInput {
  type?: string
  text?: { body?: string }
  interactive?: { button_reply?: { id?: string }; list_reply?: { id?: string } }
  button?: { payload?: string; text?: string }
}

export type LearnerMessage =
  | { action: 'ignore' }
  | { action: 'unsupported' }
  | { action: 'reply'; text?: string; replyId?: string }

const SILENT_TYPES = new Set(['reaction', 'system', 'unsupported', 'ephemeral', 'request_welcome'])

/**
 * Turn one Cloud API message into something the bot can answer.
 * Reactions and system notes are ignored. Pictures and voice notes get a
 * short explanation, because the bot only marks taps and typed answers.
 */
export function readLearnerMessage(message: LearnerMessageInput): LearnerMessage {
  if (message.type && SILENT_TYPES.has(message.type)) return { action: 'ignore' }
  const replyId = message.interactive?.button_reply?.id
    || message.interactive?.list_reply?.id
    || message.button?.payload
    || undefined
  const text = message.text?.body ?? (!replyId ? message.button?.text : undefined)
  if (replyId || (text != null && text.trim() !== '')) return { action: 'reply', text, replyId }
  return { action: 'unsupported' }
}

/** Letters that have option text. A blank option C is a true/false question. */
export function optionLetters(question: { option_a?: string | null; option_b?: string | null; option_c?: string | null }): Letter[] {
  const letters: Letter[] = []
  if (question.option_a?.trim()) letters.push('A')
  if (question.option_b?.trim()) letters.push('B')
  if (question.option_c?.trim()) letters.push('C')
  return letters.length > 0 ? letters : ['A', 'B', 'C']
}

export function clock(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}

export function questionBody(
  question: { question: string; option_a: string; option_b: string; option_c?: string | null },
  position: number,
  total: number,
  secondsRemaining: number | null,
): string {
  const head = `*Question ${position + 1} of ${total}*${secondsRemaining != null ? `   ⏱ ${clock(secondsRemaining)} left` : ''}`
  const lines = [head, '', question.question.trim(), '']
  for (const letter of optionLetters(question)) {
    const text = letter === 'A' ? question.option_a : letter === 'B' ? question.option_b : question.option_c
    lines.push(`*${letter}*  ${(text ?? '').trim()}`)
  }
  return lines.join('\n')
}

/** True when a message is too long for one WhatsApp button bubble (1 024). */
export function needsSplitDelivery(body: string): boolean {
  return body.length > LIMITS.body
}

/**
 * A free try has been used once the learner answered anything, or they
 * deliberately ended it. Opening a test and immediately picking another
 * (finish reason "replaced", nothing answered) does not use the try up.
 */
export function countsAsFreeAttempt(position: number, finishReason: string | null): boolean {
  if (position > 0) return true
  return finishReason === 'completed' || finishReason === 'time' || finishReason === 'stopped'
}

export function maskNumber(waId: string): string {
  const digits = waId.replace(/\D/g, '')
  return digits.length > 4 ? `+${digits.slice(0, 2)} ••• ••• ${digits.slice(-4)}` : digits
}

export function resultText(input: {
  reason: 'completed' | 'time' | 'stopped'
  label: string
  correct: number
  total: number
  answered: number
  split: { rules: SectionScore; signs: SectionScore } | null
}): string {
  const title = input.reason === 'completed'
    ? '🏁 *Test complete!*'
    : input.reason === 'time'
      ? '⏰ *Time is up!*'
      : '🛑 *Test ended.*'
  const pct = input.total ? Math.round((input.correct / input.total) * 100) : 0
  const lines = [
    `${title}  ${input.label}`,
    `Correct: *${input.correct}* of ${input.total} (${pct}%)`,
  ]
  if (input.answered < input.total) {
    lines.push(`You answered ${input.answered} of ${input.total}. Questions you did not reach count as incorrect.`)
  }
  if (input.split) {
    lines.push(
      `Rules of the Road: *${input.split.rules.correct}* of ${input.split.rules.total}`,
      `Road Signs & Controls: *${input.split.signs.correct}* of ${input.split.signs.total}`,
    )
    if (input.reason !== 'stopped') {
      const passed = input.split.rules.correct >= SPLIT_PASS_MARK && input.split.signs.correct >= SPLIT_PASS_MARK
      lines.push(
        `Pass mark: ${SPLIT_PASS_MARK} in each section — ${passed ? 'you passed.' : 'both sections must be passed.'}`,
      )
    }
    return lines.join('\n')
  }
  if (input.reason !== 'stopped') {
    lines.push(pct >= STANDARD_PASS_PERCENT
      ? 'You passed. The pass mark is 75%.'
      : 'The pass mark is 75%. Keep practising.')
  }
  return lines.join('\n')
}

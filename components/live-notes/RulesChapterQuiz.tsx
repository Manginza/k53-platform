'use client'

/**
 * RulesChapterQuiz — client-scored quiz shown at the end of a Rules of the
 * Road chapter. No login required; matches the course practice-test style.
 */
import { useState } from 'react'
import type { RoadRuleQuestion, Choice } from '@/lib/rules-of-the-road'
import { RULES_PASS_MARK } from '@/lib/rules-of-the-road'

export default function RulesChapterQuiz({ questions }: { questions: RoadRuleQuestion[] }) {
  const [answers, setAnswers] = useState<Record<number, Choice>>({})
  const [submitted, setSubmitted] = useState(false)

  const total = questions.length
  const answeredCount = Object.keys(answers).length
  const score = questions.filter((q, i) => answers[i] === q.answer).length
  const pct = total ? Math.round((score / total) * 100) : 0
  const passed = pct >= RULES_PASS_MARK

  const select = (qi: number, opt: Choice) => {
    if (submitted) return
    setAnswers(a => ({ ...a, [qi]: opt }))
  }

  const reset = () => {
    setAnswers({})
    setSubmitted(false)
    if (typeof window !== 'undefined') window.scrollTo({ top: document.getElementById('chapter-quiz')?.offsetTop ?? 0, behavior: 'smooth' })
  }

  const optClass = (qi: number, key: Choice, q: RoadRuleQuestion) => {
    const base = 'w-full text-left px-4 py-3 rounded-xl border-2 transition-all flex items-start gap-3 text-sm'
    const selected = answers[qi] === key
    if (!submitted) {
      return `${base} ${selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-300'} cursor-pointer`
    }
    if (key === q.answer) return `${base} border-green-500 bg-green-50 cursor-default`
    if (selected) return `${base} border-red-400 bg-red-50 cursor-default`
    return `${base} border-gray-100 bg-gray-50 opacity-60 cursor-default`
  }

  return (
    <section id="chapter-quiz" className="mt-10 scroll-mt-20">
      <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-4 mb-5">
        <h2 className="text-lg font-extrabold text-green-900">Chapter quiz</h2>
        <p className="text-sm text-green-700">
          {total} questions · {RULES_PASS_MARK}% to pass. Answer all questions, then submit.
        </p>
      </div>

      <div className="space-y-5">
        {questions.map((q, qi) => (
          <div key={qi} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <p className="font-semibold text-gray-900 mb-3">
              <span className="text-gray-400 mr-2">{qi + 1}.</span>{q.question}
            </p>
            <div className="space-y-2">
              {(['A', 'B', 'C'] as Choice[]).map(key => (
                <button key={key} onClick={() => select(qi, key)} disabled={submitted} className={optClass(qi, key, q)}>
                  <span className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                    submitted && key === q.answer ? 'border-green-500 bg-green-500 text-white'
                      : submitted && answers[qi] === key ? 'border-red-400 bg-red-400 text-white'
                      : answers[qi] === key ? 'border-blue-500 text-blue-600' : 'border-gray-300 text-gray-500'
                  }`}>{key}</span>
                  <span className="pt-0.5">{q.options[key]}</span>
                </button>
              ))}
            </div>
            {submitted && (
              <div className={`mt-3 text-sm rounded-xl px-4 py-3 ${answers[qi] === q.answer ? 'bg-green-50 text-green-800' : 'bg-amber-50 text-amber-800'}`}>
                <span className="font-semibold">{answers[qi] === q.answer ? '✓ Correct. ' : `Correct answer: ${q.answer}. `}</span>
                {q.explanation}
              </div>
            )}
          </div>
        ))}
      </div>

      {!submitted ? (
        <button
          onClick={() => { setSubmitted(true); window.scrollTo({ top: document.getElementById('chapter-quiz')?.offsetTop ?? 0, behavior: 'smooth' }) }}
          disabled={answeredCount < total}
          className="mt-5 w-full bg-blue-700 text-white font-bold py-3.5 rounded-xl hover:bg-blue-800 transition-colors disabled:opacity-50"
        >
          {answeredCount < total ? `Answer all questions (${answeredCount}/${total})` : 'Submit answers'}
        </button>
      ) : (
        <div className={`mt-5 rounded-2xl p-6 text-center text-white ${passed ? 'bg-green-600' : 'bg-red-500'}`}>
          <div className="text-4xl font-extrabold">{pct}%</div>
          <div className="font-bold mt-1">{passed ? '🎉 You passed!' : 'Keep practising'}</div>
          <div className="text-white/80 text-sm">{score} out of {total} correct</div>
          <button onClick={reset} className="mt-4 bg-white/20 hover:bg-white/30 font-semibold px-5 py-2 rounded-lg text-sm">
            Try again
          </button>
        </div>
      )}
    </section>
  )
}

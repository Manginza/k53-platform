/**
 * SampleQuestionList — renders one section of the free K53 sample questions
 * with every option, the correct answer and the reason, all in server HTML.
 * Shared by the web page and the printable page (`variant="print"`).
 */
import Image from 'next/image'
import type { Letter, SampleSection } from '@/lib/k53-sample-questions'

const LETTERS: Letter[] = ['A', 'B', 'C']

export default function SampleQuestionList({
  section,
  startNumber,
  variant = 'web',
}: {
  section: SampleSection
  /** Number of the first question, so numbering runs across sections. */
  startNumber: number
  variant?: 'web' | 'print'
}) {
  const print = variant === 'print'
  return (
    <>
      {section.diagram && (
        <figure className={print ? 'my-4 break-inside-avoid' : 'my-6 bg-white border border-gray-200 rounded-2xl p-4'}>
          <Image
            src={section.diagram.src}
            alt={section.diagram.alt}
            width={section.diagram.width}
            height={section.diagram.height}
            className="mx-auto w-full max-w-md h-auto"
          />
          <figcaption className="text-xs text-gray-600 mt-3 text-center leading-relaxed">{section.diagram.caption}</figcaption>
        </figure>
      )}

      <ol className={print ? 'space-y-4' : 'space-y-4'}>
        {section.questions.map((q, i) => {
          const n = startNumber + i
          return (
            <li
              key={q.sourceId}
              id={`q${n}`}
              className={print
                ? 'break-inside-avoid border-b border-gray-300 pb-3'
                : 'bg-white border border-gray-200 rounded-2xl p-5 shadow-sm'}
            >
              <div className={q.image ? 'flex flex-col sm:flex-row gap-4' : ''}>
                {q.image && (
                  <Image
                    src={q.image}
                    alt={q.imageAlt ?? 'Road sign for this question'}
                    width={print ? 110 : 140}
                    height={print ? 110 : 140}
                    className="object-contain shrink-0 self-start bg-white rounded-lg border border-gray-100 p-1"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className={print ? 'font-semibold text-sm text-black' : 'font-semibold text-gray-900 leading-snug'}>
                    <span className="text-gray-500 mr-1">{n}.</span>{q.question}
                  </h3>
                  <ul className="mt-2 space-y-1.5">
                    {LETTERS.map(letter => {
                      const correct = letter === q.answer
                      return (
                        <li
                          key={letter}
                          className={print
                            ? `text-sm ${correct ? 'font-bold' : ''}`
                            : `text-sm rounded-lg px-3 py-2 border ${correct ? 'bg-green-50 border-green-300 text-green-900 font-semibold' : 'bg-gray-50 border-gray-100 text-gray-700'}`}
                        >
                          <span className="font-bold mr-1.5">{letter}.</span>
                          {q.options[letter]}
                          {correct && <span className={print ? ' ml-1' : 'sr-only'}> (correct answer)</span>}
                        </li>
                      )
                    })}
                  </ul>
                  <p className={print ? 'mt-1.5 text-xs text-gray-800' : 'mt-3 text-sm text-gray-700'}>
                    <strong>Answer: {q.answer}.</strong> {q.reason}
                  </p>
                </div>
              </div>
            </li>
          )
        })}
      </ol>
    </>
  )
}

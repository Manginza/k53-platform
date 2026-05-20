'use client'

import { useState, useEffect, useCallback } from 'react'

// ─── Slide list ───────────────────────────────────────────────────────────────
// All unique slides in numerical order.
// Slides 1 and 66–72 don't exist in the bucket.
const SLIDE_NUMBERS: number[] = [
  ...Array.from({ length: 64 }, (_, i) => i + 2),   // 2 – 65
  ...Array.from({ length: 58 }, (_, i) => i + 73),  // 73 – 130
]

const BASE =
  'https://wzqgjzqylkbwyvzyzywu.supabase.co/storage/v1/object/public/' +
  'Code%2010%20Memo%20Slide%20Show/code%2010%20Memo%20Part%201/'

const slideUrl = (n: number) => `${BASE}${n}.png`

// ─── Component ────────────────────────────────────────────────────────────────
export default function BookSlideshow() {
  const [index, setIndex] = useState(0)
  const total = SLIDE_NUMBERS.length

  const prev = useCallback(() => setIndex(i => Math.max(0, i - 1)), [])
  const next = useCallback(() => setIndex(i => Math.min(total - 1, i + 1)), [total])

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [prev, next])

  const url = slideUrl(SLIDE_NUMBERS[index])

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 max-w-3xl mx-auto">
      {/* ── Header bar ── */}
      <div className="flex items-center justify-between bg-blue-700 px-6 py-4">
        <div>
          <p className="text-xs font-semibold text-blue-200 uppercase tracking-widest mb-0.5">
            Study Resource
          </p>
          <h3 className="text-white font-extrabold text-lg leading-tight">
            Code 10 Memo &mdash; Part 1
          </h3>
        </div>
        <span className="bg-blue-600 text-blue-100 text-sm font-mono px-3 py-1.5 rounded-full shrink-0">
          {index + 1} / {total}
        </span>
      </div>

      {/* ── Slide image ── */}
      <div className="relative w-full bg-gray-50" style={{ paddingBottom: '75%' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={url}
          src={url}
          alt={`Code 10 Memo Part 1 — slide ${index + 1} of ${total}`}
          className="absolute inset-0 w-full h-full object-contain p-2"
          loading="eager"
        />
      </div>

      {/* ── Navigation bar ── */}
      <div className="flex items-center justify-between gap-4 px-6 py-4 bg-gray-50 border-t border-gray-100">
        {/* Prev */}
        <button
          onClick={prev}
          disabled={index === 0}
          aria-label="Previous slide"
          className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-white border border-gray-200
                     text-gray-700 font-semibold text-sm
                     hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700
                     disabled:opacity-30 disabled:cursor-not-allowed
                     transition-all"
        >
          ← Prev
        </button>

        {/* Dot indicators */}
        <div className="flex items-center gap-1.5">
          {[-2, -1, 0, 1, 2].map(offset => {
            const idx = index + offset
            if (idx < 0 || idx >= total) return <span key={offset} className="w-2 h-2" />
            return (
              <button
                key={offset}
                onClick={() => setIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`rounded-full transition-all ${
                  offset === 0
                    ? 'w-3 h-3 bg-blue-600'
                    : 'w-2 h-2 bg-gray-300 hover:bg-blue-300'
                }`}
              />
            )
          })}
        </div>

        {/* Next */}
        <button
          onClick={next}
          disabled={index === total - 1}
          aria-label="Next slide"
          className="flex items-center gap-1.5 px-5 py-2 rounded-lg
                     bg-blue-600 text-white font-semibold text-sm
                     hover:bg-blue-700
                     disabled:opacity-30 disabled:cursor-not-allowed
                     transition-all"
        >
          Next →
        </button>
      </div>

      {/* ── Footer hint ── */}
      <p className="text-center text-xs text-gray-400 pb-3 -mt-1">
        Use ← → arrow keys to navigate
      </p>
    </div>
  )
}

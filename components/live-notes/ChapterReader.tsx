'use client'

import { useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'
import type { User } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!

function pageUrl(n: number) {
  return `${SUPABASE_URL}/storage/v1/object/public/resources/Live%20Notes/${n}.jpg`
}

interface Page    { id: string; page_number: number; alt_text: string | null }
interface Chapter { id: string; chapter_number: number | null; title: string; page_start: number; page_end: number; total_pages: number }
interface Progress { marked_complete: boolean; pages_read: number }

interface Props {
  chapter:     Chapter
  pages:       Page[]
  progress:    Progress | null
  user:        User | null
  prevChapter: number | null
  nextChapter: number | null
}

export default function ChapterReader({ chapter, pages, progress, user, prevChapter, nextChapter }: Props) {
  const supabase = createClient()

  const [currentIdx, setCurrentIdx] = useState(0)
  const [marking, setMarking]       = useState(false)
  const [marked, setMarked]         = useState(progress?.marked_complete ?? false)

  const touchStartX = useRef<number | null>(null)

  const totalPages  = pages.length
  const currentPage = pages[currentIdx]
  const isLastPage  = currentIdx === totalPages - 1
  const canTakeQuiz = marked && chapter.chapter_number !== null

  const go = useCallback((dir: 1 | -1) => {
    setCurrentIdx(i => Math.max(0, Math.min(totalPages - 1, i + dir)))
  }, [totalPages])

  const markComplete = async () => {
    if (!user || marking) return
    setMarking(true)
    const { error } = await supabase.from('ln_user_chapter_progress').upsert({
      user_id:          user.id,
      chapter_id:       chapter.id,
      marked_complete:  true,
      completed_at:     new Date().toISOString(),
      pages_read:       totalPages,
      last_page_viewed: currentPage?.page_number ?? chapter.page_end,
      updated_at:       new Date().toISOString(),
    }, { onConflict: 'user_id,chapter_id' })
    if (!error) setMarked(true)
    setMarking(false)
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">

      {/* ── Top bar ─────────────────────────────────────────────── */}
      <div className="bg-gray-900 border-b border-gray-700 px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2 sticky top-14 z-40">
        <Link href="/live-notes" className="text-gray-400 hover:text-white text-sm flex items-center gap-1 shrink-0">
          ‹ <span className="hidden sm:inline">Back</span>
        </Link>

        <div className="flex-1 text-center min-w-0">
          <div className="text-white text-xs sm:text-sm font-semibold truncate">
            <span className="text-green-400 mr-1">Ch {chapter.chapter_number}.</span>
            <span className="hidden sm:inline">{chapter.title}</span>
            <span className="sm:hidden">{chapter.title.length > 28 ? chapter.title.slice(0, 28) + '…' : chapter.title}</span>
          </div>
          <div className="text-gray-400 text-xs mt-0.5">
            Page {currentPage?.page_number} · {currentIdx + 1} / {totalPages}
          </div>
        </div>

        {canTakeQuiz ? (
          <Link
            href={`/live-notes/chapter/${chapter.chapter_number}/quiz`}
            className="bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap shrink-0"
          >
            Quiz →
          </Link>
        ) : (
          <div className="w-14 sm:w-20 shrink-0" />
        )}
      </div>

      {/* Progress bar */}
      <div className="bg-gray-800 h-1 shrink-0">
        <div
          className="bg-green-500 h-1 transition-all duration-300"
          style={{ width: `${((currentIdx + 1) / totalPages) * 100}%` }}
        />
      </div>

      {/* ── Image viewer ─────────────────────────────────────────── */}
      <div
        className="flex-1 flex items-start justify-center relative bg-gray-900 overflow-auto"
        onTouchStart={e => { touchStartX.current = e.touches[0].clientX }}
        onTouchEnd={e => {
          if (touchStartX.current === null) return
          const dx = e.changedTouches[0].clientX - touchStartX.current
          if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1)
          touchStartX.current = null
        }}
      >
        {/* Desktop floating prev arrow */}
        <button
          onClick={() => go(-1)}
          disabled={currentIdx === 0}
          className="hidden lg:flex absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/40 text-white rounded-full items-center justify-center hover:bg-black/60 disabled:opacity-20 transition-all text-2xl z-10 select-none"
          aria-label="Previous page"
        >
          ‹
        </button>

        {/* Page image */}
        <div className="w-full max-w-3xl mx-auto p-2 sm:p-4 lg:p-6">
          {currentPage && (
            /* eslint-disable @next/next/no-img-element */
            <img
              key={currentPage.page_number}
              src={pageUrl(currentPage.page_number)}
              alt={currentPage.alt_text ?? `Manual page ${currentPage.page_number}`}
              className="w-full rounded-lg shadow-2xl"
              style={{ maxHeight: '78vh', objectFit: 'contain', margin: '0 auto', display: 'block' }}
            />
          )}
        </div>

        {/* Desktop floating next arrow */}
        <button
          onClick={() => go(1)}
          disabled={currentIdx === totalPages - 1}
          className="hidden lg:flex absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/40 text-white rounded-full items-center justify-center hover:bg-black/60 disabled:opacity-20 transition-all text-2xl z-10 select-none"
          aria-label="Next page"
        >
          ›
        </button>

        {/* Preload next */}
        {currentIdx < totalPages - 1 && pages[currentIdx + 1] && (
          <img src={pageUrl(pages[currentIdx + 1].page_number)} alt="" aria-hidden className="hidden" />
        )}
      </div>

      {/* ── Bottom controls ──────────────────────────────────────── */}
      <div className="bg-gray-900 border-t border-gray-700 px-4 sm:px-6 py-3 sm:py-4 shrink-0">
        {/* Mobile/tablet: prev + action + next */}
        <div className="flex items-stretch gap-2 sm:gap-3 max-w-2xl mx-auto lg:hidden">
          <button
            onClick={() => go(-1)}
            disabled={currentIdx === 0}
            className="flex-1 py-3 rounded-xl bg-gray-700 text-white font-semibold disabled:opacity-30 hover:bg-gray-600 transition-colors text-sm"
          >
            ‹ Prev
          </button>

          {isLastPage ? (
            <div className="flex-[2] flex flex-col gap-2">
              {!marked ? (
                <button
                  onClick={markComplete}
                  disabled={!user || marking}
                  className="w-full py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 disabled:opacity-50 transition-colors text-sm"
                >
                  {marking ? 'Saving…' : !user ? 'Login to mark complete' : '✓ Mark as Read'}
                </button>
              ) : (
                <div className="w-full py-3 rounded-xl bg-green-900/60 text-green-300 font-bold text-sm text-center">
                  ✓ Chapter Read
                </div>
              )}
              {canTakeQuiz && (
                <Link
                  href={`/live-notes/chapter/${chapter.chapter_number}/quiz`}
                  className="w-full py-3 rounded-xl bg-white text-green-700 font-bold text-center block text-sm hover:bg-green-50 transition-colors"
                >
                  Take Quiz →
                </Link>
              )}
            </div>
          ) : (
            <button
              onClick={() => go(1)}
              className="flex-[2] py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors text-sm"
            >
              Next ›
            </button>
          )}
        </div>

        {/* Desktop: horizontal controls */}
        <div className="hidden lg:flex items-center justify-between gap-4 max-w-3xl mx-auto">
          <div className="flex items-center gap-3">
            {prevChapter && (
              <Link href={`/live-notes/chapter/${prevChapter}`} className="text-gray-400 hover:text-white text-sm transition-colors">
                ‹ Ch {prevChapter}
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3">
            {isLastPage && !marked && (
              <button
                onClick={markComplete}
                disabled={!user || marking}
                className="px-6 py-2.5 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 disabled:opacity-50 transition-colors text-sm"
              >
                {marking ? 'Saving…' : '✓ Mark as Read'}
              </button>
            )}
            {isLastPage && marked && (
              <div className="px-6 py-2.5 rounded-xl bg-green-900/60 text-green-300 font-bold text-sm text-center">
                ✓ Chapter Read
              </div>
            )}
            {canTakeQuiz && (
              <Link
                href={`/live-notes/chapter/${chapter.chapter_number}/quiz`}
                className="px-6 py-2.5 rounded-xl bg-white text-green-700 font-bold text-sm hover:bg-green-50 transition-colors"
              >
                Take Quiz →
              </Link>
            )}
            <span className="text-gray-500 text-xs">
              {currentIdx + 1} / {totalPages}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {nextChapter && (
              <Link href={`/live-notes/chapter/${nextChapter}`} className="text-gray-400 hover:text-white text-sm transition-colors">
                Ch {nextChapter} ›
              </Link>
            )}
          </div>
        </div>

        {/* Chapter nav — mobile */}
        <div className="flex justify-between mt-2 text-xs text-gray-600 max-w-2xl mx-auto lg:hidden">
          {prevChapter ? <Link href={`/live-notes/chapter/${prevChapter}`} className="hover:text-gray-300">‹ Ch {prevChapter}</Link> : <span />}
          {nextChapter ? <Link href={`/live-notes/chapter/${nextChapter}`} className="hover:text-gray-300">Ch {nextChapter} ›</Link> : <span />}
        </div>
      </div>
    </div>
  )
}

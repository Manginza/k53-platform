'use client'

import { useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import type { User } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!

function pageUrl(n: number) {
  // Public bucket: resources/Live Notes/{n}.jpg
  return `${SUPABASE_URL}/storage/v1/object/public/resources/Live%20Notes/${n}.jpg`
}

interface Page { id: string; page_number: number; alt_text: string | null }
interface Chapter {
  id: string
  chapter_number: number | null
  title: string
  page_start: number
  page_end: number
  total_pages: number
}
interface Progress { marked_complete: boolean; pages_read: number }

interface Props {
  chapter: Chapter
  pages: Page[]
  progress: Progress | null
  user: User | null
  prevChapter: number | null
  nextChapter: number | null
}

export default function ChapterReader({ chapter, pages, progress, user, prevChapter, nextChapter }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [currentIdx, setCurrentIdx] = useState(0)
  const [marking, setMarking]     = useState(false)
  const [marked, setMarked]       = useState(progress?.marked_complete ?? false)

  const touchStartX = useRef<number | null>(null)

  const totalPages = pages.length
  const currentPage = pages[currentIdx]
  const isLastPage = currentIdx === totalPages - 1
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
      {/* Top bar */}
      <div className="bg-gray-900 border-b border-gray-700 px-4 py-3 flex items-center justify-between gap-2">
        <Link href="/live-notes" className="text-gray-400 hover:text-white text-sm flex items-center gap-1">
          ‹ Back
        </Link>
        <div className="flex-1 text-center">
          <div className="text-white text-xs font-semibold truncate max-w-[180px] sm:max-w-xs mx-auto">
            Ch {chapter.chapter_number} — {chapter.title}
          </div>
          <div className="text-gray-400 text-xs mt-0.5">
            Page {currentPage?.page_number} · {currentIdx + 1} of {totalPages}
          </div>
        </div>
        {canTakeQuiz ? (
          <Link
            href={`/live-notes/chapter/${chapter.chapter_number}/quiz`}
            className="bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap"
          >
            Take Quiz →
          </Link>
        ) : (
          <div className="w-20 sm:w-24" />
        )}
      </div>

      {/* Progress bar */}
      <div className="bg-gray-800 h-1">
        <div
          className="bg-green-500 h-1 transition-all duration-300"
          style={{ width: `${((currentIdx + 1) / totalPages) * 100}%` }}
        />
      </div>

      {/* Image viewer */}
      <div
        className="flex-1 flex items-start justify-center overflow-auto bg-gray-900 p-2 sm:p-4"
        onTouchStart={e => { touchStartX.current = e.touches[0].clientX }}
        onTouchEnd={e => {
          if (touchStartX.current === null) return
          const dx = e.changedTouches[0].clientX - touchStartX.current
          if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1)
          touchStartX.current = null
        }}
      >
        {currentPage && (
          /* eslint-disable @next/next/no-img-element */
          <img
            key={currentPage.page_number}
            src={pageUrl(currentPage.page_number)}
            alt={currentPage.alt_text ?? `Manual page ${currentPage.page_number}`}
            className="max-w-full w-full rounded shadow-lg"
            style={{ maxHeight: '80vh', objectFit: 'contain' }}
          />
        )}
        {/* Preload next page silently */}
        {currentIdx < totalPages - 1 && pages[currentIdx + 1] && (
          <img
            src={pageUrl(pages[currentIdx + 1].page_number)}
            alt=""
            aria-hidden
            className="hidden"
          />
        )}
      </div>

      {/* Bottom controls */}
      <div className="bg-gray-900 border-t border-gray-700 px-4 py-4">
        <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
          <button
            onClick={() => go(-1)}
            disabled={currentIdx === 0}
            className="flex-1 py-3 rounded-xl bg-gray-700 text-white font-semibold disabled:opacity-30 hover:bg-gray-600 transition-colors text-sm"
          >
            ‹ Prev
          </button>

          {isLastPage ? (
            <div className="flex-1 flex flex-col gap-2">
              {!marked ? (
                <button
                  onClick={markComplete}
                  disabled={!user || marking}
                  className="w-full py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 disabled:opacity-50 transition-colors text-sm"
                >
                  {marking ? 'Saving…' : !user ? 'Login to mark complete' : '✓ Mark as Read'}
                </button>
              ) : (
                <div className="w-full py-3 rounded-xl bg-green-900 text-green-300 font-bold text-sm text-center">
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
              className="flex-1 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors text-sm"
            >
              Next ›
            </button>
          )}
        </div>

        {/* Chapter nav */}
        <div className="flex justify-between mt-3 text-xs text-gray-500 max-w-lg mx-auto">
          {prevChapter ? (
            <Link href={`/live-notes/chapter/${prevChapter}`} className="hover:text-gray-300">
              ‹ Ch {prevChapter}
            </Link>
          ) : <span />}
          {nextChapter ? (
            <Link href={`/live-notes/chapter/${nextChapter}`} className="hover:text-gray-300">
              Ch {nextChapter} ›
            </Link>
          ) : <span />}
        </div>
      </div>
    </div>
  )
}

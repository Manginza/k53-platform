'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'
import type { User } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!

interface Page    { id: string; page_number: number; alt_text: string | null }
interface Chapter {
  id: string; chapter_number: number | null; title: string
  page_start: number; page_end: number; total_pages: number
}
interface Progress { marked_complete: boolean; pages_read: number }

interface Props {
  chapter: Chapter; pages: Page[]; progress: Progress | null
  user: User | null; prevChapter: number | null; nextChapter: number | null
  // Manual config — defaults preserve the original Road Signs "Live Notes" behaviour
  basePath?: string        // route prefix, e.g. '/live-notes' or '/live-notes/k53'
  imageFolder?: string     // storage folder under the public `resources` bucket
  imageExt?: string        // image file extension (no dot)
  progressTable?: string   // user-progress table name
  quizAlwaysAvailable?: boolean  // when true, the quiz link shows without requiring "mark as read"
}

const ZOOM_STEP = 0.25
const ZOOM_MIN  = 0.5
const ZOOM_MAX  = 4

export default function ChapterReader({
  chapter, pages, progress, user, prevChapter, nextChapter,
  basePath = '/live-notes',
  imageFolder = 'Live Notes',
  imageExt = 'jpg',
  progressTable = 'ln_user_chapter_progress',
  quizAlwaysAvailable = false,
}: Props) {
  const supabase = createClient()

  const pageUrl = (n: number) =>
    `${SUPABASE_URL}/storage/v1/object/public/resources/${encodeURIComponent(imageFolder)}/${n}.${imageExt}`

  const [currentIdx, setCurrentIdx] = useState(0)
  const [marking, setMarking]       = useState(false)
  const [marked, setMarked]         = useState(progress?.marked_complete ?? false)
  const [fullscreen, setFullscreen] = useState(false)
  const [zoom, setZoom]             = useState(1)

  const touchStartX    = useRef<number | null>(null)
  const fsScrollRef    = useRef<HTMLDivElement>(null)

  const totalPages  = pages.length
  const currentPage = pages[currentIdx]
  const isLastPage  = currentIdx === totalPages - 1
  const canTakeQuiz = (quizAlwaysAvailable || marked) && chapter.chapter_number !== null

  const go = useCallback((dir: 1 | -1) => {
    setCurrentIdx(i => Math.max(0, Math.min(totalPages - 1, i + dir)))
    setZoom(1)  // reset zoom on page change
    fsScrollRef.current?.scrollTo(0, 0)
  }, [totalPages])

  const openFullscreen  = () => { setFullscreen(true);  setZoom(1) }
  const closeFullscreen = () => { setFullscreen(false); setZoom(1) }

  const zoomIn  = () => setZoom(z => Math.min(ZOOM_MAX, +(z + ZOOM_STEP).toFixed(2)))
  const zoomOut = () => setZoom(z => Math.max(ZOOM_MIN, +(z - ZOOM_STEP).toFixed(2)))
  const resetZoom = () => setZoom(1)

  // Keyboard shortcuts for fullscreen viewer
  useEffect(() => {
    if (!fullscreen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape')       closeFullscreen()
      else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') go(1)
      else if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   go(-1)
      else if (e.key === '+' || e.key === '=') { e.preventDefault(); zoomIn() }
      else if (e.key === '-')                  { e.preventDefault(); zoomOut() }
      else if (e.key === '0')                  { e.preventDefault(); resetZoom() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullscreen, go])

  // Scroll-wheel zoom in fullscreen
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!fullscreen) return
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
      setZoom(z => {
        const next = e.deltaY < 0 ? z + ZOOM_STEP : z - ZOOM_STEP
        return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, +next.toFixed(2)))
      })
    }
  }, [fullscreen])

  const markComplete = async () => {
    if (!user || marking) return
    setMarking(true)
    const { error } = await supabase.from(progressTable).upsert({
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

  // ── Fullscreen overlay ────────────────────────────────────────────────────
  if (fullscreen && currentPage) {
    return (
      <div className="fixed inset-0 z-[200] bg-black flex flex-col" onWheel={handleWheel}>

        {/* FS top bar */}
        <div className="flex items-center justify-between px-3 sm:px-5 py-2.5 bg-black/90 border-b border-gray-800 shrink-0 gap-2">
          {/* Left: chapter info */}
          <div className="text-white text-xs sm:text-sm font-medium truncate min-w-0 flex-1">
            <span className="text-green-400 mr-1">Ch {chapter.chapter_number}.</span>
            <span className="hidden sm:inline">{chapter.title} · </span>
            Page {currentPage.page_number} ({currentIdx + 1}/{totalPages})
          </div>

          {/* Centre: zoom controls */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button
              onClick={zoomOut}
              disabled={zoom <= ZOOM_MIN}
              className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-30 text-lg font-bold transition-colors"
              title="Zoom out (−)"
            >−</button>
            <button
              onClick={resetZoom}
              className="min-w-[52px] sm:min-w-[60px] h-8 sm:h-9 px-2 rounded-lg bg-gray-700 text-white text-xs sm:text-sm font-mono hover:bg-gray-600 transition-colors"
              title="Reset zoom (0)"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              onClick={zoomIn}
              disabled={zoom >= ZOOM_MAX}
              className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-30 text-lg font-bold transition-colors"
              title="Zoom in (+)"
            >+</button>

            {/* Preset buttons — desktop only */}
            <div className="hidden lg:flex items-center gap-1 ml-1">
              {[1, 1.5, 2, 3].map(z => (
                <button
                  key={z}
                  onClick={() => setZoom(z)}
                  className={`h-8 px-2.5 rounded-lg text-xs font-medium transition-colors ${
                    zoom === z ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {z === 1 ? 'Fit' : `${z}×`}
                </button>
              ))}
            </div>
          </div>

          {/* Right: close */}
          <button
            onClick={closeFullscreen}
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg bg-gray-700 text-white hover:bg-red-600 transition-colors text-lg shrink-0 ml-1"
            title="Exit fullscreen (Esc)"
          >✕</button>
        </div>

        {/* FS hint bar */}
        <div className="bg-gray-900 px-4 py-1 text-center text-xs text-gray-500 shrink-0 hidden lg:block">
          Ctrl+scroll to zoom · Arrow keys to navigate · Esc to close
        </div>

        {/* FS image scroll area */}
        <div
          ref={fsScrollRef}
          className="flex-1 overflow-auto flex items-start justify-center bg-gray-950"
          style={{ cursor: zoom > 1 ? 'grab' : 'default' }}
        >
          <div
            className="p-4 sm:p-6 lg:p-10"
            style={{
              minWidth: zoom > 1 ? `${zoom * 100}%` : undefined,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            {/* eslint-disable @next/next/no-img-element */}
            <img
              key={currentPage.page_number}
              src={pageUrl(currentPage.page_number)}
              alt={currentPage.alt_text ?? `Manual page ${currentPage.page_number}`}
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: 'top center',
                transition: 'transform 0.15s ease',
                // When zoom > 1, let transform expand it; don't constrain width
                maxWidth: zoom <= 1 ? '100%' : 'none',
                display: 'block',
                // At zoom = 1, fill most of the viewport height nicely
                maxHeight: zoom <= 1 ? 'calc(100vh - 130px)' : 'none',
                objectFit: 'contain',
                boxShadow: '0 8px 40px rgba(0,0,0,0.8)',
                borderRadius: '4px',
              }}
            />
          </div>
        </div>

        {/* FS bottom navigation */}
        <div className="shrink-0 bg-black/90 border-t border-gray-800 px-3 sm:px-5 py-2.5 flex items-center justify-between gap-3">
          <button
            onClick={() => go(-1)}
            disabled={currentIdx === 0}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-700 text-white text-sm font-semibold hover:bg-gray-600 disabled:opacity-30 transition-colors"
          >
            ‹ <span className="hidden sm:inline">Prev</span>
          </button>

          {/* Page dots (compact) */}
          <div className="flex gap-1 overflow-x-auto max-w-[200px] sm:max-w-sm lg:max-w-lg py-1">
            {pages.map((p, i) => (
              <button
                key={p.id}
                onClick={() => { setCurrentIdx(i); setZoom(1); fsScrollRef.current?.scrollTo(0,0) }}
                className={`flex-shrink-0 w-2.5 h-2.5 rounded-full transition-colors ${
                  i === currentIdx ? 'bg-green-400' : 'bg-gray-600 hover:bg-gray-400'
                }`}
                aria-label={`Page ${p.page_number}`}
              />
            ))}
          </div>

          <button
            onClick={() => go(1)}
            disabled={currentIdx === totalPages - 1}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-30 transition-colors"
          >
            <span className="hidden sm:inline">Next</span> ›
          </button>
        </div>
      </div>
    )
  }

  // ── Normal reader view ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">

      {/* Top bar */}
      <div className="bg-gray-900 border-b border-gray-700 px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2 sticky top-14 z-40">
        <Link href={basePath} className="text-gray-400 hover:text-white text-sm flex items-center gap-1 shrink-0">
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

        <div className="flex items-center gap-2 shrink-0">
          {/* Fullscreen button */}
          <button
            onClick={openFullscreen}
            className="text-gray-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-gray-700"
            title="Open fullscreen viewer"
            aria-label="Open fullscreen viewer"
          >
            {/* Expand icon — four corners */}
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M1 6V1h5M12 1h5v5M17 12v5h-5M6 17H1v-5" />
            </svg>
          </button>

          {canTakeQuiz && (
            <Link
              href={`${basePath}/chapter/${chapter.chapter_number}/quiz`}
              className="bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap"
            >
              Quiz →
            </Link>
          )}
          {!canTakeQuiz && <div className="w-14 sm:w-20" />}
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-gray-800 h-1 shrink-0">
        <div
          className="bg-green-500 h-1 transition-all duration-300"
          style={{ width: `${((currentIdx + 1) / totalPages) * 100}%` }}
        />
      </div>

      {/* Image viewer */}
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
        {/* Desktop prev arrow */}
        <button
          onClick={() => go(-1)}
          disabled={currentIdx === 0}
          className="hidden lg:flex absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/40 text-white rounded-full items-center justify-center hover:bg-black/60 disabled:opacity-20 transition-all text-2xl z-10 select-none"
          aria-label="Previous page"
        >‹</button>

        {/* Page image + fullscreen hint */}
        <div className="w-full max-w-4xl mx-auto p-2 sm:p-4 lg:p-6 relative">
          {currentPage && (
            <>
              {/* eslint-disable @next/next/no-img-element */}
              <img
                key={currentPage.page_number}
                src={pageUrl(currentPage.page_number)}
                alt={currentPage.alt_text ?? `Manual page ${currentPage.page_number}`}
                className="w-full rounded-lg shadow-2xl cursor-pointer"
                style={{ maxHeight: '78vh', objectFit: 'contain', margin: '0 auto', display: 'block' }}
                onClick={openFullscreen}
                title="Click to open fullscreen viewer"
              />
              {/* Click-to-expand hint on desktop */}
              <div className="hidden lg:flex absolute bottom-8 right-8 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full gap-1.5 items-center pointer-events-none">
                <svg width="12" height="12" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M1 6V1h5M12 1h5v5M17 12v5h-5M6 17H1v-5" />
                </svg>
                Click to expand
              </div>
            </>
          )}
        </div>

        {/* Desktop next arrow */}
        <button
          onClick={() => go(1)}
          disabled={currentIdx === totalPages - 1}
          className="hidden lg:flex absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/40 text-white rounded-full items-center justify-center hover:bg-black/60 disabled:opacity-20 transition-all text-2xl z-10 select-none"
          aria-label="Next page"
        >›</button>

        {/* Preload next */}
        {currentIdx < totalPages - 1 && pages[currentIdx + 1] && (
          <img src={pageUrl(pages[currentIdx + 1].page_number)} alt="" aria-hidden className="hidden" />
        )}
      </div>

      {/* Bottom controls */}
      <div className="bg-gray-900 border-t border-gray-700 px-4 sm:px-6 py-3 sm:py-4 shrink-0">

        {/* Mobile/tablet */}
        <div className="flex items-stretch gap-2 sm:gap-3 max-w-2xl mx-auto lg:hidden">
          <button
            onClick={() => go(-1)}
            disabled={currentIdx === 0}
            className="flex-1 py-3 rounded-xl bg-gray-700 text-white font-semibold disabled:opacity-30 hover:bg-gray-600 transition-colors text-sm"
          >‹ Prev</button>

          {isLastPage ? (
            <div className="flex-[2] flex flex-col gap-2">
              {!marked ? (
                <button
                  onClick={markComplete}
                  disabled={!user || marking}
                  className="w-full py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 disabled:opacity-50 transition-colors text-sm"
                >
                  {marking ? 'Saving…' : !user ? 'Login to mark' : '✓ Mark as Read'}
                </button>
              ) : (
                <div className="w-full py-3 rounded-xl bg-green-900/60 text-green-300 font-bold text-sm text-center">
                  ✓ Chapter Read
                </div>
              )}
              {canTakeQuiz && (
                <Link
                  href={`${basePath}/chapter/${chapter.chapter_number}/quiz`}
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
            >Next ›</button>
          )}
        </div>

        {/* Desktop */}
        <div className="hidden lg:flex items-center justify-between gap-4 max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            {prevChapter && (
              <Link href={`${basePath}/chapter/${prevChapter}`} className="text-gray-400 hover:text-white text-sm transition-colors">
                ‹ Ch {prevChapter}
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Fullscreen button — desktop bar */}
            <button
              onClick={openFullscreen}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-700 text-white text-sm font-medium hover:bg-gray-600 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M1 6V1h5M12 1h5v5M17 12v5h-5M6 17H1v-5" />
              </svg>
              Full Screen
            </button>

            {isLastPage && !marked && (
              <button
                onClick={markComplete}
                disabled={!user || marking}
                className="px-5 py-2 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 disabled:opacity-50 transition-colors text-sm"
              >
                {marking ? 'Saving…' : '✓ Mark as Read'}
              </button>
            )}
            {isLastPage && marked && (
              <div className="px-5 py-2 rounded-xl bg-green-900/60 text-green-300 font-bold text-sm">
                ✓ Chapter Read
              </div>
            )}
            {canTakeQuiz && (
              <Link
                href={`${basePath}/chapter/${chapter.chapter_number}/quiz`}
                className="px-5 py-2 rounded-xl bg-white text-green-700 font-bold text-sm hover:bg-green-50 transition-colors"
              >
                Take Quiz →
              </Link>
            )}
            <span className="text-gray-600 text-xs">{currentIdx + 1} / {totalPages}</span>
          </div>

          <div className="flex items-center gap-4">
            {nextChapter && (
              <Link href={`${basePath}/chapter/${nextChapter}`} className="text-gray-400 hover:text-white text-sm transition-colors">
                Ch {nextChapter} ›
              </Link>
            )}
          </div>
        </div>

        {/* Mobile chapter nav */}
        <div className="flex justify-between mt-2 text-xs text-gray-600 max-w-2xl mx-auto lg:hidden">
          {prevChapter ? <Link href={`${basePath}/chapter/${prevChapter}`} className="hover:text-gray-300">‹ Ch {prevChapter}</Link> : <span />}
          {nextChapter ? <Link href={`${basePath}/chapter/${nextChapter}`} className="hover:text-gray-300">Ch {nextChapter} ›</Link> : <span />}
        </div>
      </div>
    </div>
  )
}

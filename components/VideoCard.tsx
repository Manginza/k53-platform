'use client'

import { useState } from 'react'

interface YouTubeCardProps {
  id: string
  index: number
  url: string
  title?: string
}

interface DriveCardProps {
  fileId: string
  index: number
  url: string
}

// ── YouTube card — thumbnail from YouTube CDN, iframe only on click ────────
export function YouTubeCard({ id, index, url, title }: YouTubeCardProps) {
  const [playing, setPlaying] = useState(false)
  const thumbnail = `https://img.youtube.com/vi/${id}/hqdefault.jpg`
  const accessibleTitle = title ?? `YouTube video ${index + 1}`

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden group">
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        {playing ? (
          <iframe
            src={`https://www.youtube.com/embed/${id}?autoplay=1`}
            title={accessibleTitle}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        ) : (
          <button
            onClick={() => setPlaying(true)}
            className="absolute inset-0 w-full h-full focus:outline-none"
            aria-label={`Play ${accessibleTitle}`}
          >
            {/* Thumbnail */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumbnail}
              alt={`${accessibleTitle} thumbnail`}
              className="w-full h-full object-cover"
            />
            {/* Dark overlay on hover */}
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
            {/* Play button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </button>
        )}
      </div>

      <div className="px-4 py-3 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-red-500 uppercase tracking-wide">YouTube</span>
          <p className="text-sm font-semibold text-gray-800 mt-0.5">{title ?? `Video ${index + 1}`}</p>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold text-red-500 hover:text-red-700 hover:underline"
        >
          Open ↗
        </a>
      </div>
    </div>
  )
}

// ── Google Drive card — placeholder poster, iframe only on click ──────────
export function DriveCard({ fileId, index, url }: DriveCardProps) {
  const [playing, setPlaying] = useState(false)
  const embedUrl = `https://drive.google.com/file/d/${fileId}/preview`

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden group">
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        {playing ? (
          <iframe
            src={embedUrl}
            title={`Drive video ${index + 1}`}
            allow="autoplay"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        ) : (
          <button
            onClick={() => setPlaying(true)}
            className="absolute inset-0 w-full h-full bg-gradient-to-br from-blue-600 to-blue-800 focus:outline-none"
            aria-label={`Play Google Drive video ${index + 1}`}
          >
            {/* Grid pattern background */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 19px,white 19px,white 20px),repeating-linear-gradient(90deg,transparent,transparent 19px,white 19px,white 20px)',
              }}
            />
            {/* Drive icon */}
            <div className="absolute top-3 right-3 opacity-40">
              <svg className="w-6 h-6 text-white" viewBox="0 0 87.3 78" fill="none">
                <path d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3L27.5 53H0c0 1.55.4 3.1 1.2 4.5z" fill="white"/>
                <path d="M43.65 25L29.9 1.4C28.55.55 27 .05 25.35 0L6.6 32.6h26.8z" fill="white" opacity=".7"/>
                <path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5H60.8l5.65 10.7z" fill="white" opacity=".5"/>
                <path d="M43.65 25L57.4 1.4C56.05.55 54.5.05 52.85 0H34.45c-1.65 0-3.2.55-4.55 1.4z" fill="white" opacity=".4"/>
                <path d="M60.8 53H27.5L13.75 76.8c1.35.85 2.9 1.2 4.55 1.2h50.7c1.65 0 3.2-.4 4.55-1.2z" fill="white" opacity=".6"/>
                <path d="M73.4 32.6L60.8 11.2c-1.35-.85-2.9-1.2-4.55-1.2H34.45c-1.65 0-3.2.35-4.55 1.2L43.65 34h29.75z" fill="white" opacity=".3"/>
              </svg>
            </div>
            {/* Play button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-white/30 transition-all border border-white/40">
                <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
            {/* Label */}
            <div className="absolute bottom-3 left-3 text-white/80 text-xs font-medium">
              Click to load video
            </div>
          </button>
        )}
      </div>

      <div className="px-4 py-3 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-blue-500 uppercase tracking-wide">Google Drive</span>
          <p className="text-sm font-semibold text-gray-800 mt-0.5">Video {index + 1}</p>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
        >
          Open ↗
        </a>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { ACCESS_PRICE } from '@/lib/contact'
import { isAdminEmail } from '@/lib/admin-emails'
import { useLang } from '@/lib/language-context'
import type { User } from '@supabase/supabase-js'

const LINKS = [
  { href: '/',                 label: 'Home' },
  { href: '/courses',          label: 'Practice Tests' },
  { href: '/centers',          label: 'Find a Centre' },
  { href: '/live-notes',       label: 'Live Notes' },
  { href: '/live-notes/rules', label: 'Road Rules' },
  { href: '/videos',           label: 'Videos' },
]

const ABOUT_LINKS = [
  { href: '/about',      label: 'About Us' },
  { href: '/manifesto',  label: 'Manifesto' },
  { href: '/affiliate',  label: 'Become an Affiliate' },
  { href: '/trainer',    label: 'Become a Trainer' },
  { href: '/pricing',    label: 'Pricing' },
]

export default function Navbar() {
  const supabase = useMemo(() => createClient(), [])
  const router   = useRouter()
  const pathname = usePathname()

  const [user, setUser] = useState<User | null>(null)
  const [open, setOpen] = useState(false)
  const [aboutOpen, setAboutOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const aboutRef = useRef<HTMLDivElement>(null)
  const langRef = useRef<HTMLDivElement>(null)
  const { lang, setLang, langs, currentLabel } = useLang()

  useEffect(() => { setOpen(false); setAboutOpen(false); setLangOpen(false) }, [pathname])

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setUser(s?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [supabase])

  // Close About and Language dropdowns when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (aboutRef.current && !aboutRef.current.contains(e.target as Node)) setAboutOpen(false)
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const isAdmin = isAdminEmail(user?.email)

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    if (href === '/live-notes') return pathname.startsWith('/live-notes') && !pathname.startsWith('/live-notes/rules')
    return pathname === href || pathname.startsWith(href)
  }

  const isAboutActive = ABOUT_LINKS.some(l => pathname === l.href || pathname.startsWith(l.href))

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="bg-blue-700 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="text-lg font-extrabold tracking-tight hover:text-blue-200 transition-colors shrink-0">
          K53 Learner&apos;s
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {LINKS.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors hover:bg-blue-600 ${
                isActive(l.href)
                  ? 'bg-blue-800 text-white'
                  : 'text-blue-100 hover:text-white'
              }`}
            >
              {l.label}
            </Link>
          ))}

          {/* About dropdown */}
          <div ref={aboutRef} className="relative">
            <button
              onClick={() => setAboutOpen(o => !o)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors hover:bg-blue-600 ${
                isAboutActive ? 'bg-blue-800 text-white' : 'text-blue-100 hover:text-white'
              }`}
            >
              About
              <svg
                className={`w-3 h-3 transition-transform ${aboutOpen ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {aboutOpen && (
              <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-100 py-1 min-w-[180px] z-50">
                {ABOUT_LINKS.map(l => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={`block px-4 py-2.5 text-sm transition-colors hover:bg-blue-50 ${
                      pathname === l.href ? 'text-blue-700 font-semibold' : 'text-gray-700'
                    }`}
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Language dropdown */}
          <div ref={langRef} className="relative">
            <button
              onClick={() => setLangOpen(o => !o)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-blue-100 hover:text-white hover:bg-blue-600 transition-colors"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
              Language
              <svg
                className={`w-3 h-3 transition-transform ${langOpen ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {langOpen && (
              <div className="absolute top-full right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-100 py-1 min-w-[160px] z-50">
                {langs.map(l => (
                  <button
                    key={l.code}
                    onClick={() => { setLang(l.code); setLangOpen(false) }}
                    className={`w-full text-left flex items-center justify-between px-4 py-2.5 text-sm transition-colors hover:bg-blue-50 ${
                      lang === l.code ? 'text-blue-700 font-semibold' : 'text-gray-700'
                    }`}
                  >
                    {l.label}
                    {lang === l.code && (
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Desktop right side */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          {isAdmin ? (
            <button
              onClick={logout}
              className="bg-white text-blue-700 font-semibold px-3 py-1.5 rounded-lg text-xs hover:bg-blue-100 transition-colors"
            >
              Logout
            </button>
          ) : (
            <Link
              href="/pricing"
              className="bg-green-500 text-white font-semibold px-3 py-1.5 rounded-lg text-xs hover:bg-green-600 transition-colors"
            >
              Get full access · {ACCESS_PRICE}
            </Link>
          )}
        </div>

        {/* Mobile: hamburger */}
        <div className="flex md:hidden items-center gap-1">
          <button
            onClick={() => setOpen(o => !o)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-blue-600 transition-colors"
          >
            <div className="w-5 h-[18px] relative flex flex-col justify-between">
              <span className={`absolute top-0 left-0 w-full h-0.5 bg-white rounded transition-all duration-200 ${open ? 'rotate-45 top-[8px]' : ''}`} />
              <span className={`absolute top-[8px] left-0 w-full h-0.5 bg-white rounded transition-all duration-200 ${open ? 'opacity-0 translate-x-2' : ''}`} />
              <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-white rounded transition-all duration-200 ${open ? '-rotate-45 bottom-[8px]' : ''}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      <div className={`md:hidden overflow-hidden transition-all duration-200 ${open ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="bg-blue-800 border-t border-blue-600 px-4 pt-2 pb-4">
          <div className="space-y-0.5 mb-3">
            {LINKS.map(l => (
              <Link
                key={l.href}
                href={l.href}
                className={`flex items-center px-3 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive(l.href)
                    ? 'bg-blue-700 text-white'
                    : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                }`}
              >
                {l.label}
              </Link>
            ))}

            {/* About section on mobile */}
            <div className="pt-1">
              <p className="px-3 py-1 text-xs font-bold text-blue-400 uppercase tracking-widest">About</p>
              {ABOUT_LINKS.map(l => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    pathname === l.href
                      ? 'bg-blue-700 text-white'
                      : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </div>

            {/* Language section on mobile */}
            <div className="pt-1">
              <p className="px-3 py-1 text-xs font-bold text-blue-400 uppercase tracking-widest">Language</p>
              <div className="grid grid-cols-2 gap-1 px-1">
                {langs.map(l => (
                  <button
                    key={l.code}
                    onClick={() => setLang(l.code)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                      lang === l.code
                        ? 'bg-blue-700 text-white'
                        : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                    }`}
                  >
                    {l.label}
                    {lang === l.code && (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-blue-700 pt-3">
            {isAdmin ? (
              <button
                onClick={logout}
                className="w-full bg-white text-blue-700 font-semibold py-3 rounded-xl text-sm hover:bg-blue-100 transition-colors"
              >
                Logout
              </button>
            ) : (
              <Link
                href="/pricing"
                className="block text-center bg-green-500 text-white font-semibold py-3 rounded-xl text-sm hover:bg-green-600 transition-colors"
              >
                Get full access · {ACCESS_PRICE}
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

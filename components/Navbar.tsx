'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import type { User } from '@supabase/supabase-js'

const LINKS = [
  { href: '/',           label: 'Home' },
  { href: '/courses',    label: 'Courses' },
  { href: '/live-notes', label: 'Live Notes' },
  { href: '/pricing',    label: 'Pricing' },
  { href: '/videos',     label: 'Videos' },
  { href: '/resources',  label: 'Resources' },
  { href: '/affiliate',  label: 'Affiliate' },
]

export default function Navbar() {
  const supabase = useMemo(() => createClient(), [])
  const router   = useRouter()
  const pathname = usePathname()

  const [user, setUser] = useState<User | null>(null)
  const [open, setOpen] = useState(false)

  // Close mobile menu whenever route changes
  useEffect(() => { setOpen(false) }, [pathname])

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setUser(s?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [supabase])

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
                pathname === l.href || (l.href !== '/' && pathname.startsWith(l.href))
                  ? 'bg-blue-800 text-white'
                  : 'text-blue-100 hover:text-white'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          {user ? (
            <>
              <span className="text-blue-200 text-xs truncate max-w-[130px] hidden lg:block">{user.email}</span>
              <button
                onClick={logout}
                className="bg-white text-blue-700 font-semibold px-3 py-1.5 rounded-lg text-xs hover:bg-blue-100 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-blue-100 hover:text-white transition-colors px-2">
                Login
              </Link>
              <Link
                href="/signup"
                className="bg-white text-blue-700 font-semibold px-3 py-1.5 rounded-lg text-xs hover:bg-blue-100 transition-colors"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        {/* Mobile: quick login link + hamburger */}
        <div className="flex md:hidden items-center gap-1">
          {!user && (
            <Link href="/login" className="text-xs text-blue-200 hover:text-white transition-colors px-2 py-1">
              Login
            </Link>
          )}
          <button
            onClick={() => setOpen(o => !o)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-blue-600 transition-colors"
          >
            {/* Animated hamburger → X */}
            <div className="w-5 h-[18px] relative flex flex-col justify-between">
              <span className={`absolute top-0 left-0 w-full h-0.5 bg-white rounded transition-all duration-200 ${open ? 'rotate-45 top-[8px]' : ''}`} />
              <span className={`absolute top-[8px] left-0 w-full h-0.5 bg-white rounded transition-all duration-200 ${open ? 'opacity-0 translate-x-2' : ''}`} />
              <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-white rounded transition-all duration-200 ${open ? '-rotate-45 bottom-[8px]' : ''}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-200 ${open ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="bg-blue-800 border-t border-blue-600 px-4 pt-2 pb-4">
          {/* Nav links */}
          <div className="space-y-0.5 mb-3">
            {LINKS.map(l => (
              <Link
                key={l.href}
                href={l.href}
                className={`flex items-center px-3 py-3 rounded-xl text-sm font-medium transition-colors ${
                  pathname === l.href || (l.href !== '/' && pathname.startsWith(l.href))
                    ? 'bg-blue-700 text-white'
                    : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Auth */}
          <div className="border-t border-blue-700 pt-3">
            {user ? (
              <div className="space-y-2">
                <p className="text-xs text-blue-300 px-3 truncate">{user.email}</p>
                <button
                  onClick={logout}
                  className="w-full bg-white text-blue-700 font-semibold py-3 rounded-xl text-sm hover:bg-blue-100 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <Link
                  href="/login"
                  className="flex-1 text-center py-3 rounded-xl text-sm font-medium border border-blue-600 text-blue-100 hover:bg-blue-700 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="flex-1 text-center bg-white text-blue-700 font-semibold py-3 rounded-xl text-sm hover:bg-blue-100 transition-colors"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

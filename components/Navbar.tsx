'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { ACCESS_PRICE } from '@/lib/contact'
import { isAdminEmail } from '@/lib/admin-emails'
import type { User } from '@supabase/supabase-js'

const LINKS = [
  { href: '/',                          label: 'Home' },
  { href: '/k53-learners-study-guide',  label: 'Study Guide' },
  { href: '/courses',                   label: 'Practice Tests' },
  { href: '/centers',                   label: 'Find a Centre' },
  { href: '/live-notes',                label: 'Live Notes' },
  { href: '/videos',                    label: 'Videos' },
]

export default function Navbar() {
  const supabase = useMemo(() => createClient(), [])
  const router   = useRouter()
  const pathname = usePathname()

  const [user, setUser] = useState<User | null>(null)
  const [open, setOpen] = useState(false)
  useEffect(() => { setOpen(false) }, [pathname])

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setUser(s?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [supabase])

  const isAdmin = isAdminEmail(user?.email)
  const navLinks = user ? [...LINKS, { href: '/account', label: 'My Progress' }] : LINKS

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    if (href === '/live-notes') return pathname.startsWith('/live-notes') && !pathname.startsWith('/live-notes/rules')
    return pathname === href || pathname.startsWith(href)
  }

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="bg-brand-800 text-white shadow-nav sticky top-0 z-50 backdrop-blur-sm bg-opacity-[0.97]">
      <div className="section-container h-16 flex items-center justify-between gap-6">

        {/* Logo */}
        <Link href="/" className="shrink-0 hover:opacity-90 transition-opacity">
          <Image src="/logo-nav.png" alt="SK Driving" width={160} height={50} className="h-10 w-auto" priority />
        </Link>

        {/* Desktop nav links */}
        <div className="hidden lg:flex items-center gap-0.5 flex-1 justify-center">
          {navLinks.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`relative px-3.5 py-2 rounded-lg text-[13px] font-semibold tracking-wide transition-all duration-200 ${
                isActive(l.href)
                  ? 'bg-white/15 text-white'
                  : 'text-blue-200 hover:text-white hover:bg-white/10'
              }`}
            >
              {l.label}
              {isActive(l.href) && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-accent-400 rounded-full" />
              )}
            </Link>
          ))}
        </div>

        {/* Desktop right side */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          {isAdmin || user ? (
            <button
              onClick={logout}
              className="bg-white/15 text-white font-semibold px-4 py-2 rounded-lg text-xs hover:bg-white/25 transition-all duration-200 border border-white/20"
            >
              Logout
            </button>
          ) : null}
          {!isAdmin && (
            <Link
              href="/pricing"
              className="bg-accent-400 text-brand-900 font-bold px-5 py-2.5 rounded-full text-xs hover:bg-accent-500 transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.97]"
            >
              Get full access · {ACCESS_PRICE}
            </Link>
          )}
        </div>

        {/* Mobile: hamburger */}
        <div className="flex lg:hidden items-center gap-1">
          <button
            onClick={() => setOpen(o => !o)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="w-11 h-11 flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors"
          >
            <div className="w-5 h-[18px] relative flex flex-col justify-between">
              <span className={`absolute top-0 left-0 w-full h-0.5 bg-white rounded-full transition-all duration-200 ${open ? 'rotate-45 top-[8px]' : ''}`} />
              <span className={`absolute top-[8px] left-0 w-full h-0.5 bg-white rounded-full transition-all duration-200 ${open ? 'opacity-0 translate-x-2' : ''}`} />
              <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-white rounded-full transition-all duration-200 ${open ? '-rotate-45 bottom-[8px]' : ''}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      <div className={`lg:hidden overflow-hidden transition-all duration-300 ease-out ${open ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="bg-brand-900 border-t border-white/10 px-4 pt-2 pb-4">
          <div className="space-y-0.5 mb-3">
            {navLinks.map(l => (
              <Link
                key={l.href}
                href={l.href}
                className={`flex items-center px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive(l.href)
                    ? 'bg-white/15 text-white'
                    : 'text-blue-200 hover:bg-white/10 hover:text-white'
                }`}
              >
                {l.label}
                {isActive(l.href) && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-accent-400" />
                )}
              </Link>
            ))}
          </div>

          <div className="border-t border-white/10 pt-3 flex flex-col gap-2">
            {!isAdmin && (
              <Link
                href="/pricing"
                className="block text-center bg-accent-400 text-brand-900 font-bold py-3.5 rounded-xl text-sm hover:bg-accent-500 transition-all duration-200 shadow-sm"
              >
                Get full access · {ACCESS_PRICE}
              </Link>
            )}
            {(isAdmin || user) && (
              <button
                onClick={logout}
                className="w-full bg-white/15 text-white font-semibold py-3.5 rounded-xl text-sm hover:bg-white/25 transition-all duration-200 border border-white/10"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

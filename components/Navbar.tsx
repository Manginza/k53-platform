'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

const links = [
  { href: '/', label: 'Home' },
  { href: '/international-student-programme', label: 'International Students' },
  { href: '/supplier-development-programme', label: 'Supplier Development' },
  { href: '/manifesto', label: 'Manifesto' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  useEffect(() => setOpen(false), [pathname])

  return (
    <nav className="sticky top-0 z-50 bg-[#19182d] text-white shadow-nav">
      <div className="section-container flex h-20 items-center justify-between gap-6">
        <Link href="/" className="shrink-0 text-lg font-extrabold tracking-tight" aria-label="Social Enterprise Academy home">
          <span className="block text-xs font-bold uppercase tracking-[0.22em] text-[#ffcb05]">Social Enterprise</span>
          Academy <span className="text-[#e1569c]">South Africa</span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                pathname === link.href ? 'bg-white/15 text-white' : 'text-white/75 hover:bg-white/10 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <a href="mailto:Jamy@socialenterprise.academy" className="ml-3 rounded-full bg-[#ffcb05] px-5 py-2.5 text-sm font-bold text-[#19182d] transition-colors hover:bg-[#ffd633]">
            Email us
          </a>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="sea-navigation"
          className="rounded-lg p-3 hover:bg-white/10 lg:hidden"
        >
          <span className="sr-only">{open ? 'Close navigation' : 'Open navigation'}</span>
          <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current" strokeWidth="2" aria-hidden="true">
            <path d={open ? 'M6 6l12 12M18 6L6 18' : 'M4 7h16M4 12h16M4 17h16'} strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div id="sea-navigation" className={`overflow-hidden border-t border-white/10 transition-all lg:hidden ${open ? 'max-h-80' : 'max-h-0'}`}>
        <div className="section-container flex flex-col gap-1 py-3">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="rounded-lg px-4 py-3 text-sm font-semibold text-white/85 hover:bg-white/10">
              {link.label}
            </Link>
          ))}
          <a href="mailto:Jamy@socialenterprise.academy" className="mt-2 rounded-lg bg-[#ffcb05] px-4 py-3 text-center text-sm font-bold text-[#19182d]">
            Email us
          </a>
        </div>
      </div>
    </nav>
  )
}

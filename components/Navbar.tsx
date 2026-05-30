'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import type { User } from '@supabase/supabase-js'

export default function Navbar() {
  const supabase = createClient()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="bg-blue-700 text-white shadow-md">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-extrabold tracking-tight hover:text-blue-200 transition-colors">
          K53 Learner&apos;s
        </Link>
        <div className="flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="hover:text-blue-200 transition-colors">Home</Link>
          <Link href="/courses" className="hover:text-blue-200 transition-colors">Courses</Link>
          <Link href="/live-notes" className="hover:text-blue-200 transition-colors">Live Notes</Link>
          <Link href="/videos" className="hover:text-blue-200 transition-colors">Videos</Link>
          <Link href="/resources" className="hover:text-blue-200 transition-colors">Resources</Link>

          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-blue-200 text-xs hidden sm:block truncate max-w-[140px]">{user.email}</span>
              <button
                onClick={handleLogout}
                className="bg-white text-blue-700 font-semibold px-3 py-1 rounded-lg text-xs hover:bg-blue-100 transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="hover:text-blue-200 transition-colors">Login</Link>
              <Link href="/signup" className="bg-white text-blue-700 font-semibold px-3 py-1 rounded-lg text-xs hover:bg-blue-100 transition-colors">
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

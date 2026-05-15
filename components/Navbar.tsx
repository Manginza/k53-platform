import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="bg-blue-700 text-white shadow-md">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-extrabold tracking-tight hover:text-blue-200 transition-colors">
          K53 Learner&apos;s
        </Link>
        <div className="flex gap-6 text-sm font-medium">
          <Link href="/" className="hover:text-blue-200 transition-colors">Home</Link>
          <Link href="/courses" className="hover:text-blue-200 transition-colors">Courses</Link>
          <Link href="/videos" className="hover:text-blue-200 transition-colors">Videos</Link>
          <Link href="/resources" className="hover:text-blue-200 transition-colors">Resources</Link>
        </div>
      </div>
    </nav>
  )
}

/**
 * Footer — site footer with a WhatsApp access CTA, an access-code link, and a
 * deliberately discreet round admin-login button in the bottom-right corner
 * that blends into the footer colour.
 */
import Link from 'next/link'
import { WHATSAPP_URL, ACCESS_PRICE, ACCESS_DURATION_DAYS } from '@/lib/contact'

export default function Footer() {
  return (
    <footer className="relative bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <div className="text-lg font-extrabold text-white">K53 Learner&apos;s</div>
            <p className="text-sm text-gray-400 mt-2 max-w-xs">
              Practise free with 3-minute timed tests. Unlock everything for {ACCESS_PRICE} ({ACCESS_DURATION_DAYS} days).
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:items-end">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-600 text-white font-semibold px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors w-max"
            >
              Get full access on WhatsApp
            </a>
            <Link href="/pricing" className="text-sm text-gray-400 hover:text-white transition-colors">
              Pay by card →
            </Link>
            <Link href="/affiliate" className="text-sm text-gray-400 hover:text-white transition-colors">
              Earn 30% — become an affiliate →
            </Link>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} K53 Learner&apos;s. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-4 text-xs text-gray-500 justify-center md:justify-end">
            <Link href="/about" className="hover:text-gray-300 transition-colors">About Us</Link>
            <Link href="/contact" className="hover:text-gray-300 transition-colors">Contact Us</Link>
            <Link href="/privacy-policy" className="hover:text-gray-300 transition-colors">Privacy Policy</Link>
            <Link href="/terms-and-conditions" className="hover:text-gray-300 transition-colors">Terms & Conditions</Link>
            <Link href="/cookie-policy" className="hover:text-gray-300 transition-colors">Cookie Policy</Link>
          </div>

          {/* Discreet admin login — blends into the footer */}
          <Link
            href="/login"
            aria-label="Admin login"
            title="Admin login"
            className="w-7 h-7 rounded-full bg-gray-800 hover:bg-gray-700 border border-gray-700 flex items-center justify-center text-gray-600 hover:text-gray-400 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0-1.657 0-3 0-3a3 3 0 016 0v3m-9 0h12a1 1 0 011 1v6a1 1 0 01-1 1H7a1 1 0 01-1-1v-6a1 1 0 011-1z" />
            </svg>
          </Link>
        </div>
      </div>
    </footer>
  )
}

/**
 * Footer — site footer with a WhatsApp access CTA, an access-code link, and a
 * deliberately discreet round admin-login button in the bottom-right corner
 * that blends into the footer colour.
 */
import Link from 'next/link'
import { WHATSAPP_URL, ACCESS_PRICE, ACCESS_DURATION_DAYS } from '@/lib/contact'
import { FREE_TRIAL_MINUTES } from '@/lib/free-trial'

export default function Footer() {
  return (
    <footer className="relative bg-brand-950 text-gray-300 mt-16">
      <div className="section-container py-12 sm:py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <div className="text-xl font-extrabold text-white tracking-tight">K53 Learner&apos;s</div>
            <p className="text-sm text-gray-400 mt-3 max-w-xs leading-relaxed">
              Practise free with {FREE_TRIAL_MINUTES}-minute trial tests. Unlock everything for {ACCESS_PRICE} ({ACCESS_DURATION_DAYS} days).
            </p>
            <div className="flex flex-col gap-2 mt-5">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-green-700 transition-all duration-200 w-max"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M17.47 14.38c-.3-.15-1.74-.86-2-.95-.27-.1-.47-.15-.66.15-.2.3-.77.95-.94 1.15-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.6.13-.14.3-.35.44-.53.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.66-1.6-.9-2.18-.24-.57-.48-.5-.66-.5l-.57-.01c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.08 1.74-.71 1.98-1.4.24-.68.24-1.27.17-1.4-.07-.13-.27-.2-.57-.35z"/>
                  <path d="M12.05 2A9.95 9.95 0 002 12c0 1.97.53 3.93 1.53 5.62L2 22l4.53-1.18A9.96 9.96 0 0012.05 22C17.52 22 22 17.52 22 12S17.52 2 12.05 2z"/>
                </svg>
                Get full access on WhatsApp
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div className="lg:col-span-1">
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Quick Links</h4>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
              <Link href="/pricing" className="text-sm text-gray-400 hover:text-white transition-colors">Pay by card</Link>
              <Link href="/affiliate" className="text-sm text-gray-400 hover:text-white transition-colors">Become an affiliate</Link>
              <Link href="/trainer" className="text-sm text-gray-400 hover:text-white transition-colors">Become a Trainer</Link>
              <Link href="/k53-learners-study-guide" className="text-sm text-gray-400 hover:text-white transition-colors">Free K53 Study Guide</Link>
              <Link href="/manifesto" className="text-sm text-gray-400 hover:text-white transition-colors">Manifesto</Link>
              <Link href="/resources" className="text-sm text-gray-400 hover:text-white transition-colors">Resources</Link>
            </div>
          </div>

          {/* Company & legal */}
          <div className="lg:col-span-1">
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Company</h4>
            <div className="grid grid-cols-2 sm:grid-cols-1 gap-x-6 gap-y-2.5">
              <Link href="/about" className="text-sm text-gray-400 hover:text-white transition-colors">About Us</Link>
              <Link href="/contact" className="text-sm text-gray-400 hover:text-white transition-colors">Contact Us</Link>
              <Link href="/privacy-policy" className="text-sm text-gray-400 hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms-and-conditions" className="text-sm text-gray-400 hover:text-white transition-colors">Terms & Conditions</Link>
              <Link href="/cookie-policy" className="text-sm text-gray-400 hover:text-white transition-colors">Cookie Policy</Link>
              <Link href="/admin" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">Admin</Link>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} K53 Learner&apos;s. All rights reserved.
          </p>
          <p className="text-xs text-gray-600">
            South Africa&apos;s K53 exam prep platform
          </p>
        </div>
      </div>
    </footer>
  )
}

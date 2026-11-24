import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { POLICIES_UPDATED } from '@/lib/legal'
import { canonical } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'Cookies on skdriving.co.za: essential cookies, Google Analytics, Google AdSense, the Meta Pixel, and how the cookie banner and Consent Mode work.',
  alternates: canonical('/cookie-policy'),
}

function Ext({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline underline-offset-2 hover:text-blue-800">
      {children}
    </a>
  )
}

export default function CookiePolicy() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-16 sm:px-6 sm:py-24">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Cookie Policy</h1>
      <p className="text-sm text-gray-500 mb-8">Last updated: {POLICIES_UPDATED}</p>

      <div className="text-gray-600 leading-relaxed space-y-4">
        <p>
          This policy explains the cookies and similar technologies on skdriving.co.za. It sits alongside our{' '}
          <Link href="/privacy-policy" className="text-blue-700 underline underline-offset-2 hover:text-blue-800">Privacy Policy</Link>,
          which describes the personal information we collect and your rights.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">What cookies are</h2>
        <p>
          Cookies are small text files a site stores on your device through your browser. They can remember that you
          are signed in, remember a choice you made, or recognise a browser on a later visit. We also use similar
          storage in your browser, such as local storage, for the cookie choice described below. Pixels are small
          snippets of code that can set cookies and record that a page was opened.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">How consent works</h2>
        <p>
          A cookie banner appears at the bottom of the page until you choose. <strong className="text-gray-800">Accept</strong> allows
          analytics, advertising and Meta cookies. <strong className="text-gray-800">Decline</strong> leaves the site
          on essential cookies only. Either choice is stored in this browser under the name{' '}
          <code className="text-gray-800">k53_cookie_consent</code>. The banner does not show again unless you clear
          that stored choice (clear site data for skdriving.co.za in your browser, then reload).
        </p>
        <p>
          We use Google Consent Mode v2. Before you choose, and if you tap Decline, the site tells Google to deny
          these types of storage:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li><code className="text-gray-800">analytics_storage</code> — analytics cookies, including Google Analytics;</li>
          <li><code className="text-gray-800">ad_storage</code> — advertising cookies, including AdSense;</li>
          <li><code className="text-gray-800">ad_user_data</code> — sending user data to Google for advertising;</li>
          <li><code className="text-gray-800">ad_personalization</code> — personalised ads.</li>
        </ul>
        <p>
          The Meta Pixel is set to revoked consent at the same time, so it does not store its cookie until you accept.
          When you tap Accept, we update those four Google signals to granted and grant Meta Pixel consent. Essential
          cookies do not wait for this choice. They are needed for the site to work.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Cookies we use</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border border-gray-200">
            <thead className="bg-gray-50 text-gray-900">
              <tr>
                <th className="p-3 border-b font-semibold">Category</th>
                <th className="p-3 border-b font-semibold">Who sets it</th>
                <th className="p-3 border-b font-semibold">Purpose</th>
                <th className="p-3 border-b font-semibold">Examples</th>
              </tr>
            </thead>
            <tbody>
              <tr className="align-top">
                <td className="p-3 border-b font-semibold text-gray-800">Essential</td>
                <td className="p-3 border-b">SK Driving (sign-in is provided by Supabase)</td>
                <td className="p-3 border-b">
                  Keep you signed in, remember a referral link you followed, and remember your cookie choice.
                  These are not used for advertising.
                </td>
                <td className="p-3 border-b">
                  Sign-in session cookies. Referral cookie <code>sk_ref</code> (about 30 days, only if you arrive
                  from a referral link). Cookie choice stored as <code>k53_cookie_consent</code>.
                </td>
              </tr>
              <tr className="align-top">
                <td className="p-3 border-b font-semibold text-gray-800">Analytics</td>
                <td className="p-3 border-b">Google Analytics 4 and Google Tag Manager</td>
                <td className="p-3 border-b">
                  Count visits and see which pages help people study. Tag Manager (GTM-M995P8CW) loads our Analytics
                  tag (G-ZZVWLTP51S). It does not itself show ads. These cookies are set only after you tap Accept.
                </td>
                <td className="p-3 border-b"><code>_ga</code>, <code>_ga_ZZVWLTP51S</code></td>
              </tr>
              <tr className="align-top">
                <td className="p-3 border-b font-semibold text-gray-800">Advertising</td>
                <td className="p-3 border-b">Google AdSense</td>
                <td className="p-3 border-b">
                  Show ads and measure them. Third-party vendors, including Google, use cookies to serve ads based
                  on your prior visits. Google&apos;s advertising cookies let Google and its partners serve ads based
                  on your visits to this site and other sites. The AdSense script (publisher ca-pub-4650201068372958)
                  is only added on public pages. It is not added on sign-in, account, admin, payment, quiz or
                  members&apos; pages. Personalised advertising cookies are used only after you tap Accept.
                </td>
                <td className="p-3 border-b"><code>IDE</code>, <code>__gads</code></td>
              </tr>
              <tr className="align-top">
                <td className="p-3 font-semibold text-gray-800">Meta Pixel</td>
                <td className="p-3">Meta</td>
                <td className="p-3">
                  Measure visits and our own promotions (Pixel ID 1492132475472276). The pixel cookie is stored only
                  after you tap Accept.
                </td>
                <td className="p-3"><code>_fbp</code></td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Cookie names can change when Google or Meta update their products. The names above are the usual ones these
          services set. Google and Meta describe their own cookies in the links below.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Opting out of Google ads</h2>
        <p>You can refuse personalised ads and some third-party advertising cookies even if you previously tapped Accept:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            Opt out of personalised ads at{' '}
            <Ext href="https://adssettings.google.com">https://adssettings.google.com</Ext>.
          </li>
          <li>
            Read how Google uses data for advertising at{' '}
            <Ext href="https://policies.google.com/technologies/ads">https://policies.google.com/technologies/ads</Ext>.
          </li>
          <li>
            Opt out of some third-party vendors at{' '}
            <Ext href="https://www.aboutads.info">https://www.aboutads.info</Ext>.
          </li>
        </ul>
        <p>
          You can also block or delete cookies in your browser settings. Blocking every cookie can sign you out and
          can stop parts of the site from remembering you. Declining on our banner, or clearing{' '}
          <code className="text-gray-800">k53_cookie_consent</code>, stops us from asking Google and Meta to store
          analytics and advertising cookies on later visits.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Changes</h2>
        <p>
          If the cookies we use change, we will update this page and the date at the top. The current version is the
          one dated {POLICIES_UPDATED}.
        </p>
      </div>
    </main>
  )
}

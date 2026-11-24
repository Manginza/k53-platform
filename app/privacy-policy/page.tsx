import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { WHATSAPP_DISPLAY, WHATSAPP_LINK } from '@/lib/contact'
import { POLICIES_UPDATED } from '@/lib/legal'
import { canonical } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How SK Driving collects, uses and shares personal information on skdriving.co.za, including ads, analytics and your POPIA rights.',
  alternates: canonical('/privacy-policy'),
}

function Ext({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline underline-offset-2 hover:text-blue-800">
      {children}
    </a>
  )
}

export default function PrivacyPolicy() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-16 sm:px-6 sm:py-24">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-8">Last updated: {POLICIES_UPDATED}</p>

      <div className="text-gray-600 leading-relaxed space-y-4">
        <p>
          This policy explains what SK Driving does with personal information when you use skdriving.co.za.
          It is written in plain English. Our <Link href="/cookie-policy" className="text-blue-700 underline underline-offset-2 hover:text-blue-800">Cookie Policy</Link> covers
          cookies in more detail.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Who we are</h2>
        <p>
          SK Driving operates the website skdriving.co.za (https://www.skdriving.co.za). We provide K53
          learner&apos;s licence practice tests and study material for people in South Africa.
        </p>
        <p>
          To contact us about this policy or your personal information, use our{' '}
          <Link href="/contact" className="text-blue-700 underline underline-offset-2 hover:text-blue-800">Contact page</Link>.
          That page reaches us on WhatsApp at{' '}
          <Ext href={WHATSAPP_LINK}>{WHATSAPP_DISPLAY}</Ext>.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">What we collect</h2>
        <p>Depending on how you use the site, we collect:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong className="text-gray-800">Account details.</strong> Your email address and password when you
            register or log in. The password is handled by our sign-in system. We do not see or store it in plain text.
          </li>
          <li>
            <strong className="text-gray-800">Quiz progress.</strong> The practice tests you start, your answers and
            your scores, on the website and on WhatsApp if you use the practice bot.
          </li>
          <li>
            <strong className="text-gray-800">Payment status.</strong> Whether a card payment succeeded, a checkout
            reference, and the access that payment unlocked. Card details are entered on Yoco&apos;s payment page. We
            do not receive or store your full card number or card security code.
          </li>
          <li>
            <strong className="text-gray-800">WhatsApp messages, if you contact us.</strong> If you message us on
            WhatsApp, or you use the WhatsApp practice bot, we receive your WhatsApp number, the profile name WhatsApp
            sends with it, and the contents of those messages.
          </li>
          <li>
            <strong className="text-gray-800">Device and usage data via cookies.</strong> Information such as your
            browser, device, the pages you open, an approximate location, and cookie identifiers. The Cookie Policy
            lists the cookies and how to refuse the ones that are not essential.
          </li>
        </ul>
        <p>
          If you apply to teach on the site, join the affiliate programme, or send a login-help request, we also
          keep the details you type into that form, such as your name and phone number, and any proof of payment you attach.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">How we use it</h2>
        <p>We use this information to:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>create and run your account, and keep you signed in;</li>
          <li>save your quiz progress and show your results;</li>
          <li>know whether you have paid for access, and for how long;</li>
          <li>take card payments and confirm that they succeeded;</li>
          <li>read and reply to WhatsApp messages, including the practice-test bot;</li>
          <li>understand how the site is used, fix problems, and keep it reliable;</li>
          <li>show ads, including ads based on your visits when you allow advertising cookies;</li>
          <li>protect the site against misuse and fraud;</li>
          <li>meet legal and accounting duties.</li>
        </ul>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Google advertising</h2>
        <p>
          We use Google AdSense (publisher ID ca-pub-4650201068372958) to show ads on public pages of this site.
          Third-party vendors, including Google, use cookies to serve ads based on your prior visits to this website.
          Google&apos;s advertising cookies let Google and its partners serve ads to you based on your visits to this
          site and other sites.
        </p>
        <p>
          You can opt out of personalised ads at{' '}
          <Ext href="https://adssettings.google.com">https://adssettings.google.com</Ext>.
          You can learn more about how Google uses data for advertising at{' '}
          <Ext href="https://policies.google.com/technologies/ads">https://policies.google.com/technologies/ads</Ext>.
          You can opt out of some third-party vendors&apos; cookies for personalised ads at{' '}
          <Ext href="https://www.aboutads.info">https://www.aboutads.info</Ext>.
        </p>
        <p>
          The AdSense script is not loaded on sign-in, account, admin, payment, quiz or members&apos; pages. On the
          public pages where it can load, it is loaded only after you tap Accept on the cookie banner, and never if you
          tap Decline. See the Cookie Policy.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Google Analytics and Tag Manager</h2>
        <p>
          We use Google Analytics 4 (measurement ID G-ZZVWLTP51S) and Google Tag Manager (container GTM-M995P8CW)
          to see which pages people use and whether the site is working. Tag Manager loads tags such as Google
          Analytics. These tools can receive device and usage information, including pages viewed, an approximate
          location, and a cookie identifier if you have allowed analytics cookies. Until you accept cookies, Google
          Consent Mode keeps analytics storage off. Details are in the Cookie Policy.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Meta Pixel</h2>
        <p>
          We use the Meta Pixel (ID 1492132475472276) to measure visits and to understand our own promotions. Meta
          may receive device and usage information. The pixel does not store its advertising cookie until you accept
          cookies. WhatsApp messages you send us are also processed by Meta, because Meta provides WhatsApp.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Who we share information with</h2>
        <p>
          We share personal information with service providers who process it for us so the site can run. We tell
          them to use it only for that work. The providers are:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong className="text-gray-800">Google</strong> — AdSense (ads), Analytics (usage statistics) and Tag Manager (loading those tags).</li>
          <li><strong className="text-gray-800">Meta</strong> — the Pixel, and WhatsApp when you message us or use the practice bot.</li>
          <li><strong className="text-gray-800">Vercel</strong> — hosting the website, including technical request logs needed to deliver pages.</li>
          <li><strong className="text-gray-800">Supabase</strong> — storing account data, quiz progress and payment status.</li>
          <li><strong className="text-gray-800">Yoco</strong> — processing card payments. Yoco receives the card details you enter on its page.</li>
        </ul>
        <p>
          We also share information if the law requires it, for example a lawful request from a public authority.
        </p>
        <p>
          We do not sell your personal information. We do not give it to third parties so they can build their own marketing lists.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Cross-border processing</h2>
        <p>
          Some of these providers process information outside South Africa. Google, Meta, Vercel and Supabase operate
          infrastructure in other countries, including the United States. Yoco processes card payments. When your
          information is processed outside South Africa, that processing is covered by the provider&apos;s privacy
          safeguards and the agreement we have with them.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Your rights under POPIA</h2>
        <p>
          The Protection of Personal Information Act (POPIA) gives you rights over your personal information. You can:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong className="text-gray-800">Access</strong> it — ask whether we hold information about you, and ask for a copy.</li>
          <li><strong className="text-gray-800">Correct</strong> it — ask us to fix information that is wrong or incomplete.</li>
          <li><strong className="text-gray-800">Delete</strong> it — ask us to delete your personal information.</li>
          <li><strong className="text-gray-800">Object</strong> — object to processing, including processing used for direct marketing.</li>
          <li>
            <strong className="text-gray-800">Withdraw consent</strong> — take back consent you have given, including
            cookie consent. Withdrawing consent does not undo processing that was already lawful.
          </li>
        </ul>
        <p>
          Contact us on the <Link href="/contact" className="text-blue-700 underline underline-offset-2 hover:text-blue-800">Contact page</Link> to
          use these rights. We may ask you to confirm that the request is yours before we act, and we will respond
          within a reasonable time.
        </p>
        <p>
          You also have the right to complain to the Information Regulator of South Africa:{' '}
          <Ext href="https://inforegulator.org.za">https://inforegulator.org.za</Ext>.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Security</h2>
        <p>
          The site is served over HTTPS. Access to account records is limited to the systems and people who need it
          to run the service. Passwords are stored by Supabase Auth using that service&apos;s protections, not as plain
          text. Card numbers are handled by Yoco, not stored on our servers. No method of sending information over the
          internet is perfectly secure.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">How long we keep it</h2>
        <p>
          We keep account details and quiz progress while your account exists. We keep payment records for as long as
          we need them to show whether access was paid for and to meet accounting and legal duties. We keep WhatsApp
          numbers and messages so the practice bot and support chats can work. Analytics and advertising cookies last
          for the periods set by Google and Meta, and you can clear them in your browser. When information is no
          longer needed, we delete it or remove the details that identify you. You can ask us to delete your account
          information using the rights above.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Children</h2>
        <p>
          If you are under 18, use this site with a parent or guardian. We do not knowingly collect personal
          information from children in order to show them ads. If you believe a child has given us personal
          information and you want it removed, contact us on the Contact page.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Changes</h2>
        <p>
          We will update this page when our practices change, and we will change the &ldquo;Last updated&rdquo; date
          at the top. Please check this page from time to time. The version on this page is the one that applies.
        </p>
      </div>
    </main>
  )
}

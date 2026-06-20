import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Become a Trainer — Earn 66% Revenue from Your Learners',
  description: 'Join SK Driving as a certified trainer. Build your own learner base, set your own prices, and earn 66.67% of every learner payment. R1,500/year.',
}

export default function TrainerLandingPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-14">

      {/* Hero */}
      <div className="text-center mb-14">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">For Driving Instructors</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-2 mb-4 leading-tight">
          Become an SK Driving Trainer
        </h1>
        <p className="text-gray-500 text-base max-w-xl mx-auto mb-8">
          Get your own branded learner page, upload premium study materials, and earn <strong>66.67%</strong> of every learner payment. You set the price. We handle the platform.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/trainer/register" className="bg-blue-700 text-white font-bold px-8 py-4 rounded-full hover:bg-blue-800 transition-colors">
            Apply Now — R1,500/year →
          </Link>
          <Link href="/login" className="border-2 border-gray-300 text-gray-700 font-semibold px-8 py-4 rounded-full hover:border-blue-400 transition-colors">
            Trainer Login
          </Link>
        </div>
      </div>

      {/* How it works */}
      <section className="mb-14">
        <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">How it works</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { step: '1', title: 'Register & Pay', body: 'Fill in your details and pay R1,500/year via Yoco. We activate your account within 24 hours.' },
            { step: '2', title: 'Your Trainer Page', body: 'You get a public page at skdriving.co.za/t/your-name. Share it with learners to sign up.' },
            { step: '3', title: 'Earn & Teach', body: 'Set your own prices. Add lesson notes, videos and resources. Mark learners as paid to unlock your materials.' },
          ].map(({ step, title, body }) => (
            <div key={step} className="bg-white border border-gray-200 rounded-2xl p-6 text-center shadow-sm">
              <div className="w-10 h-10 rounded-full bg-blue-700 text-white flex items-center justify-center font-extrabold text-lg mx-auto mb-4">{step}</div>
              <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Revenue split */}
      <section className="bg-blue-50 border border-blue-100 rounded-2xl p-8 mb-14">
        <h2 className="text-lg font-bold text-blue-900 mb-4 text-center">Revenue split</h2>
        <div className="grid sm:grid-cols-2 gap-6 text-center">
          <div>
            <p className="text-4xl font-extrabold text-blue-700 mb-1">66.67%</p>
            <p className="text-sm text-blue-800 font-semibold">You keep</p>
            <p className="text-xs text-blue-600 mt-1">Paid directly to you by your learners</p>
          </div>
          <div>
            <p className="text-4xl font-extrabold text-gray-400 mb-1">33.33%</p>
            <p className="text-sm text-gray-600 font-semibold">Platform fee</p>
            <p className="text-xs text-gray-400 mt-1">Covers platform, hosting and support</p>
          </div>
        </div>
        <p className="text-xs text-blue-700 text-center mt-5">
          You collect payment directly from your learners. Revenue split is reconciled monthly.
        </p>
      </section>

      {/* What you get */}
      <section className="mb-14">
        <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">What you get</h2>
        <ul className="grid sm:grid-cols-2 gap-3">
          {[
            'Branded public page at /t/your-name',
            'Learner sign-up and management dashboard',
            'Upload lesson notes, video links and resources',
            'Mark learners as paid to unlock your materials',
            'Earnings tracker and learner list',
            'Full access to all SK Driving practice tests for your learners',
            'Set your own lesson prices',
            'Support from SK Driving team',
          ].map(item => (
            <li key={item} className="flex items-start gap-2 bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-700 shadow-sm">
              <span className="text-green-500 font-bold shrink-0 mt-0.5">✓</span> {item}
            </li>
          ))}
        </ul>
      </section>

      {/* CTA */}
      <div className="text-center">
        <Link href="/trainer/register" className="inline-block bg-blue-700 text-white font-bold px-10 py-4 rounded-full hover:bg-blue-800 transition-colors text-lg">
          Apply Now — R1,500/year →
        </Link>
        <p className="text-xs text-gray-400 mt-3">Already registered? <Link href="/login" className="text-blue-600 underline">Log in to your dashboard</Link></p>
      </div>

    </main>
  )
}

import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Manifesto — Social Enterprise Academy South Africa',
  description: 'We are convinced that a better future will be fuelled by the strength of millions of communities. We call them agents of change.',
}

export default function ManifestoPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-16">

      {/* Hero */}
      <div className="text-center mb-16">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Social Enterprise Academy</span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mt-3 mb-0 leading-tight">
          Manifesto
        </h1>
      </div>

      {/* Manifesto text */}
      <section className="mb-20">
        <div className="max-w-2xl mx-auto space-y-6 text-center">
          <p className="text-xl text-gray-500 leading-relaxed">
            Most people think that if we want to change the world, <em>only</em> large companies can make big steps.
          </p>
          <p className="text-2xl font-bold text-blue-700">We like to disagree.</p>
          <p className="text-lg text-gray-700 leading-relaxed">
            We are convinced that a better future will be fuelled by the strength of millions of communities.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            Because a community is the only scale where the power of trust, commitment, and loyalty naturally comes together.
          </p>
          <p className="text-xl font-semibold text-gray-900">It&apos;s the world at its best.</p>
          <p className="text-lg text-gray-700 leading-relaxed">
            So to turn this floating blue marble into something good, we should start with empowering the changemakers in communities.
          </p>
          <p className="text-2xl font-bold text-blue-700">The social entrepreneurs.</p>
          <p className="text-lg text-gray-700">We call them: <strong>agents of change.</strong></p>
          <p className="text-lg text-gray-700 leading-relaxed">
            Because a world in transformation needs transformational leaders.
          </p>

          <div className="border-l-4 border-blue-600 pl-6 text-left my-10">
            <p className="text-lg text-gray-700 mb-3">We don&apos;t tell them what to do. We don&apos;t teach them.</p>
            <p className="text-xl font-bold text-gray-900">We facilitate them to turn themselves into skillful leaders.</p>
          </div>

          <p className="text-lg text-gray-700">It&apos;s deep learning that creates deep-rooted transformation.</p>
          <p className="text-lg text-gray-700 leading-relaxed">
            And once they find that, their dreams and energy don&apos;t just add up — they multiply.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            Because there is nothing more powerful than a determined social entrepreneur with a warm heart, a clear goal, and buckets full of self-confidence.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            Because passion and purpose are infectious. It attracts others and the momentum grows.
          </p>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-8 my-10">
            <p className="text-2xl font-bold text-blue-900 mb-2">One person will become two.</p>
            <p className="text-xl text-blue-800 mb-2">Then two becomes twenty and twenty becomes a thousand.</p>
            <p className="text-2xl font-extrabold text-blue-700">That&apos;s the magic happening.</p>
          </div>

          <p className="text-xl text-gray-700 leading-relaxed">
            So never think you can&apos;t be the one to change the world.
          </p>
          <p className="text-3xl font-extrabold text-gray-900">You&apos;re just where it starts.</p>
        </div>
      </section>

      {/* Transform */}
      <section className="mb-12 bg-white border border-gray-200 rounded-3xl p-8 sm:p-10 shadow-sm">
        <div className="grid sm:grid-cols-2 gap-8 items-start">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Vision</span>
            <h2 className="text-3xl font-extrabold text-gray-900 mt-2 mb-1">Transform</h2>
            <p className="text-xl font-bold text-blue-700 mb-4">One Becomes Many</p>
            <p className="text-gray-700 leading-relaxed mb-4">
              <strong>We want to create fairer communities by facilitating 10 million social entrepreneurs globally by 2030.</strong>
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
              We believe social entrepreneurs play an essential role in changing the world. We strengthen their role in local communities through transformational learning that will increase their community impact.
            </p>
            <p className="text-sm font-bold text-gray-800 mb-2">Why is this essential now?</p>
            <p className="text-gray-600 text-sm mb-3 leading-relaxed">
              Today our world is facing unprecedented challenges and is now further behind than ever to achieve the Sustainable Development Goals.
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              {[
                'Inequality has increased for women, low wage workers, SMEs and the informal sector',
                '70 million people are now living in poverty globally for the first time in 30 years',
                '1.2 billion young people were affected by school closures',
                '1 billion climate refugees are estimated to be created by 2050',
              ].map(item => (
                <li key={item} className="flex gap-2">
                  <span className="text-blue-600 shrink-0 mt-0.5">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-blue-700 rounded-2xl p-8 text-white text-center">
            <p className="text-6xl font-extrabold mb-2">10M</p>
            <p className="text-blue-100 font-semibold">social entrepreneurs</p>
            <p className="text-blue-200 text-sm mt-1">facilitated globally by 2030</p>
            <div className="mt-6 pt-6 border-t border-blue-600">
              <p className="text-4xl font-extrabold mb-1">78K+</p>
              <p className="text-blue-100 text-sm">already facilitated</p>
            </div>
          </div>
        </div>
      </section>

      {/* Hope */}
      <section className="mb-12 bg-gray-900 text-white rounded-3xl p-8 sm:p-10">
        <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Our Purpose</span>
        <h2 className="text-3xl font-extrabold mt-2 mb-4">Hope</h2>
        <p className="text-lg font-bold text-blue-300 mb-4">What are we going to do?</p>
        <div className="space-y-4 text-gray-300 leading-relaxed max-w-2xl">
          <p>
            <strong className="text-white">We want to facilitate social entrepreneurs around the world to step up and solve the social and environmental issues affecting their communities.</strong>
          </p>
          <p>
            We believe in the power of learning and development to transform people of all ages to be agents of change. So far <strong className="text-white">we have facilitated over 78,000 social entrepreneurs</strong> to help create fairer communities where people have equitable access to opportunities.
          </p>
          <p>
            We want to <strong className="text-white">increase this number to 10 million social entrepreneurs by 2030</strong> to create an even greater impact and increase the ripples of change taking place in communities around the world.
          </p>
        </div>
      </section>

      {/* Get Involved */}
      <section className="text-center bg-blue-50 border border-blue-100 rounded-3xl p-10">
        <h2 className="text-2xl font-extrabold text-gray-900 mb-3">Get Involved</h2>
        <p className="text-gray-600 mb-6 max-w-lg mx-auto">
          To find out how you and your organisation can support us to create fairer communities in South Africa and around the world, please get in touch.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="https://socialenterprise.academy/za/about-us/contact-us/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-blue-700 text-white font-bold px-8 py-3 rounded-full hover:bg-blue-800 transition-colors"
          >
            Contact SEA South Africa →
          </a>
          <Link
            href="/courses"
            className="inline-block border-2 border-blue-700 text-blue-700 font-bold px-8 py-3 rounded-full hover:bg-blue-50 transition-colors"
          >
            Start Practising →
          </Link>
        </div>
        <p className="text-xs text-gray-400 mt-6">
          Social Enterprise Academy Africa NPC · NPO: 158-170 · PBO: 930052777
        </p>
      </section>

    </main>
  )
}

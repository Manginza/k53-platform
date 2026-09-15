import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Learning that enables social change',
  description: 'Learning and development programmes for people and organisations enabling social change in South Africa.',
}

const programmes = [
  ['Leadership Development Programme', 'Build the skills and confidence to lead change in your community and organisation through transformational learning.'],
  ['Supplier Development Programme', 'Our facilitator-led learning and development programmes offer a dynamic space to connect with other changemakers and effect change.', '/supplier-development-programme'],
  ['Social Innovation Internship Programme', 'We empower young people in South Africa who have a desire to see positive change locally and globally.'],
  ['Social Enterprise in Education Programme', 'Bringing social innovation thinking into classrooms across South Africa, equipping learners with real-world entrepreneurial skills.'],
  ['Measuring Social Impact Programmes', 'This programme gives you the practical tools, frameworks and confidence to measure and communicate your impact effectively.'],
  ['Start-up or Build your Social Enterprise Programmes', 'Practical support to launch or grow a social enterprise that makes a real difference in your community.'],
]

const statistics = [
  ['6300+', 'Social Entrepreneur members'],
  ['73', 'Partner With Us'],
  ['5000+', 'Webinar and masterclass participants'],
  ['800+', 'Learners participated in SEA programme'],
  ['200+', 'International Student Programme participants'],
]

const stories = [
  ['Social Enterprise Connect - Meet like-minded people at events', 'Social Enterprise Connect (SEC) is an exciting new Community of Practice (CoP) for social entrepreneurs in South Africa.'],
  ['Learner Spotlight: Meet the DICE Impact Makers and Creators 2019', 'Impact Makers and Creators is an ambitious programme working with ideation-and-growth-stage creative social entrepreneurs.'],
  ['Social Enterprise Schools Programme Pitching Event', 'Our Social Enterprise in Education Programme gives learners the opportunity to pitch the social enterprises they started at their schools.'],
]

export default function HomePage() {
  return (
    <main>
      <section className="relative isolate min-h-[40rem] overflow-hidden bg-[#19182d] text-white">
        <video className="absolute inset-0 -z-20 h-full w-full object-cover opacity-45" autoPlay muted loop playsInline poster="/sea/homepage/image1.jpeg">
          <source src="/sea/homepage/VAHU4Pb4DNg.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#19182d] via-[#19182d]/85 to-[#19182d]/40" />
        <div className="section-container flex min-h-[40rem] items-center py-20 sm:py-28">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#ffcb05]">Partner with us</p>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight sm:text-6xl">
              Support the next generation of <span className="text-[#e1569c]">social entrepreneurs.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/85">
              Partner with us to optimize your BEE scoreboard and maximize your tax exemptions, skills development, and CSI benefits.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a href="mailto:Jamy@socialenterprise.academy" className="rounded-full bg-[#ffcb05] px-7 py-3.5 text-center font-bold text-[#19182d] transition-colors hover:bg-[#ffd633]">
                Partner with us
              </a>
              <a href="#programmes" className="rounded-full border border-white/35 px-7 py-3.5 text-center font-bold transition-colors hover:bg-white/10">
                Explore programmes
              </a>
            </div>
            <p className="mt-12 text-sm font-bold uppercase tracking-[0.2em] text-[#ffcb05]">One becomes many</p>
          </div>
        </div>
      </section>

      <section className="bg-[#e1569c] px-4 py-14 text-white sm:py-16">
        <div className="section-container grid gap-8 text-center sm:grid-cols-2 lg:grid-cols-5">
          {statistics.map(([value, label]) => (
            <div key={label}>
              <p className="text-4xl font-extrabold">{value}</p>
              <p className="mt-2 text-sm font-semibold leading-5 text-white/90">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section-container py-16 sm:py-24">
        <blockquote className="mx-auto max-w-4xl text-center">
          <p className="text-2xl font-bold leading-relaxed text-[#19182d] sm:text-3xl">
            “This structured learning process helped me to understand my organisation&apos;s strengths and weaknesses and how to present them effectively.”
          </p>
          <footer className="mt-5 text-sm font-semibold text-slate-600">Theresa Muller, learner on the Build Your Social Enterprise Programme.</footer>
        </blockquote>
      </section>

      <section className="bg-[#f9e8f1] py-16 sm:py-24">
        <div className="section-container grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#b62570]">Who we are</p>
          <div>
            <h2 className="text-3xl font-extrabold leading-tight text-[#19182d] sm:text-4xl">Social entrepreneurs play an essential role in changing the world.</h2>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-700">We strengthen their role in local communities across South Africa through transformational learning programmes that increase their community impact.</p>
          </div>
        </div>
      </section>

      <section id="programmes" className="section-container scroll-mt-24 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#e1569c]">Our programmes</p>
          <h2 className="mt-3 text-3xl font-extrabold text-[#19182d] sm:text-4xl">Find a programme that fits your journey and community.</h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">From leadership development to social entrepreneurship, our facilitator-led programmes help changemakers connect and effect change.</p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {programmes.map(([title, description, href], index) => {
            const content = (
              <>
                <span className="text-sm font-bold text-[#b62570]">0{index + 1}</span>
                <h3 className="mt-5 text-xl font-extrabold leading-tight text-[#19182d]">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
                <span className="mt-6 inline-flex font-bold text-[#b62570]">Learn more <span className="ml-2" aria-hidden="true">→</span></span>
              </>
            )
            return href ? (
              <Link key={title} href={href} className="group rounded-3xl border border-slate-200 bg-white p-7 shadow-card transition hover:-translate-y-1 hover:shadow-card-hover">{content}</Link>
            ) : (
              <a key={title} href="mailto:Jamy@socialenterprise.academy" className="group rounded-3xl border border-slate-200 bg-white p-7 shadow-card transition hover:-translate-y-1 hover:shadow-card-hover">{content}</a>
            )
          })}
        </div>
      </section>

      <section className="bg-[#19182d] py-16 text-white sm:py-20">
        <div className="section-container flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#ffcb05]">Download our programme prospectus</p>
            <h2 className="mt-3 text-2xl font-extrabold">Social Enterprise Academy South Africa Prospectus</h2>
            <p className="mt-2 text-sm text-white/70">PDF — 1.38 MB — Click to download</p>
          </div>
          <a href="mailto:Jamy@socialenterprise.academy?subject=Programme%20prospectus" className="shrink-0 rounded-full bg-[#ffcb05] px-7 py-3.5 text-center font-bold text-[#19182d] hover:bg-[#ffd633]">Request prospectus</a>
        </div>
      </section>

      <section className="bg-[#e1569c] px-4 py-16 text-white sm:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/85">Partner with us</p>
          <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">Want to support the next generation of social entrepreneurs?</h2>
          <p className="mt-5 text-lg leading-8 text-white/90">“Never think you can&apos;t be the one to change the world. You&apos;re just where it starts.” Join us to build the social enterprise ecosystem in South Africa.</p>
          <ul className="mt-8 flex flex-wrap justify-center gap-3 text-sm font-bold">
            {['Better your BEE Scorecard', 'Get Tax Benefits', 'Skills Development', 'CSI Benefits'].map((benefit) => <li key={benefit} className="rounded-full border border-white/40 px-5 py-2.5">{benefit}</li>)}
          </ul>
          <a href="mailto:Jamy@socialenterprise.academy" className="mt-9 inline-block rounded-full bg-[#ffcb05] px-7 py-3.5 font-bold text-[#19182d] hover:bg-[#ffd633]">Partner with us</a>
        </div>
      </section>

      <section className="section-container grid gap-10 py-16 sm:py-24 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#e1569c]">Join us</p>
          <h2 className="mt-3 text-3xl font-extrabold text-[#19182d]">Join our community of practice.</h2>
          <p className="mt-5 leading-7 text-slate-600">Social Enterprise Connect is an exciting new Community of Practice for social entrepreneurs in South Africa. It was born out of a partnership between Social Enterprise Academy Africa and the Industrial Development Corporation.</p>
          <a href="mailto:Jamy@socialenterprise.academy" className="mt-7 inline-block rounded-full bg-[#19182d] px-7 py-3.5 font-bold text-white hover:bg-[#2a2947]">Co-fund here</a>
        </div>
        <div className="rounded-3xl bg-[#f9e8f1] p-8 sm:p-10">
          <p className="text-xl font-bold leading-8 text-[#19182d]">“There is clearly a massive need to support social entrepreneurs across South Africa.”</p>
          <p className="mt-5 text-sm leading-6 text-slate-600">The community of practice already has over 6300 social enterprise members and is growing with between 50 and 100 new members every week.</p>
        </div>
      </section>

      <section className="bg-slate-100 py-16 sm:py-24">
        <div className="section-container">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#e1569c]">Our partners &amp; sponsors</p>
            <h2 className="mt-3 text-3xl font-extrabold text-[#19182d]">Working together for social change.</h2>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {[12, 16, 36, 37, 38, 39].map((image) => (
              <div key={image} className="grid min-h-28 place-items-center rounded-2xl bg-white p-5 shadow-sm">
                <Image src={`/sea/homepage/image${image}.png`} alt="" width={180} height={100} className="max-h-16 w-auto object-contain" />
              </div>
            ))}
          </div>
          <div className="mt-10 text-center"><a href="mailto:Jamy@socialenterprise.academy" className="inline-block rounded-full border-2 border-[#19182d] px-7 py-3.5 font-bold text-[#19182d] hover:bg-white">Partner with us</a></div>
        </div>
      </section>

      <section className="section-container py-16 sm:py-24">
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#e1569c]">Latest news &amp; learning resources</p>
          <h2 className="mt-3 text-3xl font-extrabold text-[#19182d]">Updates and resources from across our network.</h2>
          <p className="mt-4 leading-7 text-slate-600">Check out the latest updates from the team in South Africa or get stuck into a learning resource from across our network.</p>
        </div>
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {stories.map(([title, description]) => <article key={title} className="rounded-3xl border border-slate-200 bg-white p-7 shadow-card"><h3 className="text-xl font-extrabold leading-tight text-[#19182d]">{title}</h3><p className="mt-4 text-sm leading-6 text-slate-600">{description}</p><a href="mailto:Jamy@socialenterprise.academy" className="mt-6 inline-block font-bold text-[#b62570]">Read more →</a></article>)}
        </div>
      </section>

      <section className="bg-[#19182d] px-4 py-16 text-white sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold">Stay connected</h2>
          <p className="mt-3 text-white/75">Get the latest news, programme updates and impact stories from SAE South Africa.</p>
          <form className="mx-auto mt-7 flex max-w-xl flex-col gap-3 sm:flex-row" action="mailto:Jamy@socialenterprise.academy" method="post" encType="text/plain">
            <label className="sr-only" htmlFor="email">Email address</label>
            <input id="email" name="email" type="email" required placeholder="Enter your email address" className="min-w-0 flex-1 rounded-full px-5 py-3.5 text-[#19182d] placeholder:text-slate-500" />
            <button type="submit" className="rounded-full bg-[#ffcb05] px-7 py-3.5 font-bold text-[#19182d] hover:bg-[#ffd633]">Subscribe</button>
          </form>
        </div>
      </section>
    </main>
  )
}

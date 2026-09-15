import type { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Supplier Development Programme',
  description: 'Empowering local enterprises to access big markets.',
}

const modules = [
  ['Module 1', 'Leading & Understanding Myself', 'Day 1 & Day 2'],
  ['Module 2', 'Leading & Understanding Others', 'Day 3 & Day 4'],
  ['Module 3', 'Leading Strategically', 'Day 5 & Day 6'],
]

export default function SupplierDevelopmentProgrammePage() {
  return (
    <main>
      <section className="bg-[#19182d] text-white">
        <div className="section-container grid gap-10 py-20 sm:py-28 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#ffcb05]">Supplier Development Programme</p>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight sm:text-6xl">Empowering Local Enterprises to Access Big Markets</h1>
            <p className="mt-6 text-lg leading-8 text-white/80">Structured support, business readiness training and direct buyer engagement to unlock long-term, inclusive economic growth.</p>
            <a href="mailto:Jamy@socialenterprise.academy" className="mt-8 inline-block rounded-full bg-[#ffcb05] px-7 py-3.5 font-bold text-[#19182d] hover:bg-[#ffd633]">Email us</a>
          </div>
          <Image src="/sea/supplier-development/graduates.jpeg" alt="Supplier Development Programme graduates" width={1422} height={1422} className="mx-auto aspect-square max-w-md rounded-3xl object-cover shadow-hero" />
        </div>
      </section>

      <section className="section-container grid gap-10 py-16 sm:py-24 lg:grid-cols-2">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#e1569c]">About the programme</p>
          <h2 className="mt-3 text-3xl font-extrabold text-[#19182d]">Market opportunities for high-potential entrepreneurs.</h2>
        </div>
        <p className="text-lg leading-8 text-slate-600">Whether you&apos;re a corporate looking to diversify your supply chain or a social entrepreneur seeking to scale your business, our programmes connect high-potential local entrepreneurs with real market opportunities.</p>
      </section>

      <section className="bg-[#f9e8f1] py-16 sm:py-24">
        <div className="section-container">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#b62570]">Programme outline</p>
          <h2 className="mt-3 text-3xl font-extrabold text-[#19182d]">Six days of leadership development.</h2>
          <div className="mt-8 overflow-hidden rounded-2xl border border-[#e1569c]/20 bg-white">
            {modules.map(([module, focus, timeline]) => (
              <div key={module} className="grid gap-2 border-b border-slate-100 p-6 last:border-0 sm:grid-cols-[.7fr_1.5fr_.8fr] sm:items-center">
                <p className="font-bold text-[#b62570]">{module}</p><p className="font-bold text-[#19182d]">{focus}</p><p className="text-sm text-slate-500">{timeline}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-container py-16 text-center sm:py-24">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#e1569c]">Participant experience</p>
        <h2 className="mx-auto mt-3 max-w-3xl text-3xl font-extrabold text-[#19182d]">Leadership that transforms how people show up.</h2>
        <p className="mx-auto mt-5 max-w-2xl leading-7 text-slate-600">From overcoming initial skepticism to learning the art of deep listening, graduates share how a commitment to self-discovery transformed how they connect at work and at home.</p>
        <a href="https://youtu.be/NNHFA4zNGUQ" target="_blank" rel="noopener noreferrer" className="mt-8 inline-block rounded-full bg-[#e1569c] px-7 py-3.5 font-bold text-white hover:bg-[#b62570]">Watch the participant experience</a>
      </section>

      <section className="bg-[#19182d] px-4 py-16 text-center text-white sm:py-20">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#ffcb05]">Find out more</p>
        <h2 className="mt-3 text-3xl font-extrabold">A transformative journey for your team, organisation and sector.</h2>
        <a href="mailto:Jamy@socialenterprise.academy" className="mt-8 inline-block rounded-full bg-[#ffcb05] px-7 py-3.5 font-bold text-[#19182d] hover:bg-[#ffd633]">Contact us</a>
      </section>
    </main>
  )
}

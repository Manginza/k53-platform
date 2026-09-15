import type { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'International Student Programme',
  description: 'Transform university learning into on-the-ground action in Cape Town, South Africa.',
}

const learningAreas = [
  'Understanding what defines a social enterprise',
  'Mapping mission-driven activities to long-term social impact',
  'Monitoring and evaluating success in community development',
  'Exploring sustainability models for social enterprise',
  'In-depth scoping of a social impact assignment conducted over three months',
]

export default function InternationalStudentProgrammePage() {
  return (
    <main>
      <section className="relative isolate overflow-hidden bg-[#19182d] text-white">
        <Image src="/sea/international-student/hero.png" alt="International students at Stellenbosch University" fill priority className="object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#19182d] via-[#19182d]/85 to-[#19182d]/35" />
        <div className="section-container relative py-24 sm:py-32">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#ffcb05]">International Student Programme</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-tight sm:text-6xl">Transform university learning into on-the-ground action</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/80">Academic insight, real-world social impact and local business experience in Cape Town, South Africa.</p>
          <a href="mailto:Jamy@socialenterprise.academy" className="mt-8 inline-block rounded-full bg-[#ffcb05] px-7 py-3.5 font-bold text-[#19182d] hover:bg-[#ffd633]">Email us</a>
        </div>
      </section>

      <section className="section-container grid gap-10 py-16 sm:py-24 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#e1569c]">About the programme</p>
          <h2 className="mt-3 text-3xl font-extrabold text-[#19182d]">Learn alongside social innovators.</h2>
          <p className="mt-5 leading-7 text-slate-600">This prestigious programme blends academic insight with real-world social impact and local business experience. Students are placed as interns with local social businesses, gaining practical experience as part of a social impact team while directly contributing to the communities they serve.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Image src="/sea/international-student/welcome.jpeg" alt="Welcome session at Stellenbosch University" width={856} height={571} className="h-full w-full rounded-2xl object-cover" />
          <Image src="/sea/international-student/impact-picnic.jpeg" alt="Students taking part in an impact measurement picnic" width={380} height={380} className="h-full w-full rounded-2xl object-cover" />
        </div>
      </section>

      <section className="bg-[#f9e8f1] py-16 sm:py-24">
        <div className="section-container grid gap-10 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
          <Image src="/sea/international-student/tour.jpeg" alt="Students visiting a social enterprise" width={498} height={374} className="w-full rounded-3xl object-cover shadow-card" />
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#b62570]">Programme outline</p>
            <h2 className="mt-3 text-3xl font-extrabold text-[#19182d]">A practical introduction to social enterprise.</h2>
            <p className="mt-5 leading-7 text-slate-700">Students visit numerous social enterprises shortly after arriving in South Africa. The tour includes an “Introducing Social Enterprise” workshop covering business models, core characteristics and the dynamics of social entrepreneurship in a South African context.</p>
          </div>
        </div>
      </section>

      <section className="section-container py-16 sm:py-24">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#e1569c]">Key learning areas</p>
        <h2 className="mt-3 max-w-2xl text-3xl font-extrabold text-[#19182d]">A toolkit for measuring and sustaining impact.</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {learningAreas.map((area) => <div key={area} className="rounded-2xl border border-slate-200 bg-white p-6 font-semibold leading-6 text-[#19182d] shadow-card">{area}</div>)}
        </div>
        <p className="mt-8 rounded-2xl bg-[#19182d] p-6 text-white">The Impact Measurement Workshop includes Monitoring &amp; Evaluation and Theory of Change frameworks, revenue model handouts, and deep dives into social enterprise definitions, legal forms, sustainability and ethical values.</p>
      </section>

      <section className="bg-[#e1569c] px-4 py-16 text-white sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/80">Find out more</p>
          <h2 className="mt-3 text-3xl font-extrabold">Explore Cape Town and make a difference.</h2>
          <p className="mt-5 leading-7 text-white/90">This is more than a study abroad experience—it&apos;s a transformative journey for those passionate about sustainable impact, ethical business and community development.</p>
          <a href="mailto:Jamy@socialenterprise.academy" className="mt-8 inline-block rounded-full bg-[#ffcb05] px-7 py-3.5 font-bold text-[#19182d] hover:bg-[#ffd633]">Contact us</a>
        </div>
      </section>
    </main>
  )
}

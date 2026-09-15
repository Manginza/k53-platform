import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="mt-16 bg-[#19182d] text-white">
      <div className="section-container grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#ffcb05]">Social Enterprise Academy</p>
          <p className="mt-3 max-w-sm text-sm leading-6 text-white/70">
            Learning and development programmes for people and organisations enabling social change in South Africa.
          </p>
        </div>
        <div>
          <h2 className="text-sm font-bold">Programmes</h2>
          <div className="mt-4 flex flex-col gap-2 text-sm text-white/70">
            <Link href="/international-student-programme" className="hover:text-[#ffcb05]">International Student Programme</Link>
            <Link href="/supplier-development-programme" className="hover:text-[#ffcb05]">Supplier Development Programme</Link>
            <Link href="/manifesto" className="hover:text-[#ffcb05]">Manifesto</Link>
          </div>
        </div>
        <div>
          <h2 className="text-sm font-bold">Contact</h2>
          <a href="mailto:Jamy@socialenterprise.academy" className="mt-4 inline-block text-sm text-white/70 hover:text-[#ffcb05]">
            Jamy@socialenterprise.academy
          </a>
          <p className="mt-4 text-xs text-white/50">Registered Non-Profit Organisation</p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="section-container py-5 text-xs text-white/50">
          © {new Date().getFullYear()} Social Enterprise Academy South Africa. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

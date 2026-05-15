import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'K53 Resources — Download Study PDFs',
  description: 'Download free K53 learner\'s licence study PDFs including test memos, practice quizzes, and the official road signs manual.',
}

// ── Data ─────────────────────────────────────────────────────────────────────
const resources = [
  // General / Reference
  {
    category: 'Reference',
    title: 'Official Road Traffic Signs Manual',
    description: 'The official South African manual on road traffic signs (June 2012). Essential reading for understanding all regulatory, warning, and informatory signs.',
    url: 'https://wzqgjzqylkbwyvzyzywu.supabase.co/storage/v1/object/public/resources/pdfs/2%20manual%20on%20road%20traffic%20signs%20jun%202012%20final.pdf',
  },
  {
    category: 'Reference',
    title: "Learner's Licence Study Guide",
    description: 'A comprehensive study guide covering all sections of the K53 learner\'s licence test — road signs, vehicle controls, and rules of the road.',
    url: 'https://wzqgjzqylkbwyvzyzywu.supabase.co/storage/v1/object/public/resources/pdfs/Learners%20Licence%20Study%20Guide.pdf.pdf.pdf',
  },
  {
    category: 'Reference',
    title: 'New Age K53 Manual',
    description: 'A modern K53 study manual with full explanations, diagrams, and worked examples to help you prepare for your learner\'s licence exam.',
    url: 'https://wzqgjzqylkbwyvzyzywu.supabase.co/storage/v1/object/public/resources/pdfs/New-Age-K53-Manual-PDFDrive.pdf.pdf',
  },

  // Code 8
  {
    category: 'Code 8',
    title: 'Code 8 — Test 1 (Answers Highlighted)',
    description: 'Full Code 8 Test 1 with correct answers highlighted in green. Great for self-assessment and checking your understanding after practising.',
    url: 'https://wzqgjzqylkbwyvzyzywu.supabase.co/storage/v1/object/public/resources/pdfs/Code%208%20test%201(correct%20answers%20are%20highlighted%20Green).pdf',
  },
  {
    category: 'Code 8',
    title: 'Code 8 — Test 2 (Answers Highlighted)',
    description: 'Code 8 Test 2 with correct answers highlighted in green or underlined. Use alongside the interactive quiz to reinforce your knowledge.',
    url: 'https://wzqgjzqylkbwyvzyzywu.supabase.co/storage/v1/object/public/resources/pdfs/Code8%20test%202(correct%20answers%20are%20either%20green%20or%20underlined).pdf',
  },
  {
    category: 'Code 8',
    title: 'Code 8 — Test 3',
    description: 'A full Code 8 practice test to further prepare you for the official K53 learner\'s licence examination.',
    url: 'https://wzqgjzqylkbwyvzyzywu.supabase.co/storage/v1/object/public/resources/pdfs/Code%208%20Test%203.pdf',
  },
  {
    category: 'Code 8',
    title: 'Code 8 — Driving Test Quiz',
    description: 'A focused quiz covering the most commonly tested Code 8 driving scenarios, road signs, and rules of the road.',
    url: 'https://wzqgjzqylkbwyvzyzywu.supabase.co/storage/v1/object/public/resources/pdfs/Code%208%20Driving%20Test%20Quiz.pdf',
  },

  // Code 10
  {
    category: 'Code 10',
    title: 'Code 10 / 14 — Test Memo 1',
    description: 'Test memorandum for Code 10 and Code 14 learner\'s licence candidates. Includes model answers for the first official test paper.',
    url: 'https://wzqgjzqylkbwyvzyzywu.supabase.co/storage/v1/object/public/resources/pdfs/Code%2010_14%20Test%20Memo%201.pdf',
  },
  {
    category: 'Code 10',
    title: 'Code 10 — Memo Part 2 (Answers Highlighted)',
    description: 'Code 10 test memorandum Part 2 with correct answers highlighted in green or underlined for easy identification.',
    url: 'https://wzqgjzqylkbwyvzyzywu.supabase.co/storage/v1/object/public/resources/pdfs/Code%2010%20Memo%20Part%202(Answers%20Highlighted%20Green%20or%20Underlined).pdf',
  },
  {
    category: 'Code 10',
    title: 'Code 10 — Memo 3 (Answers Highlighted)',
    description: 'Code 10 Memo 3 with correct answers clearly highlighted in green or underlined throughout the document.',
    url: 'https://wzqgjzqylkbwyvzyzywu.supabase.co/storage/v1/object/public/resources/pdfs/Code%2010%20Memo%203(Correct%20answers%20Highlighted%20Green%20or%20underlines).pdf',
  },
]

const categoryColours: Record<string, string> = {
  Reference: 'bg-purple-100 text-purple-700',
  'Code 8':  'bg-blue-100 text-blue-700',
  'Code 10': 'bg-green-100 text-green-700',
}

// ── PDF Icon ──────────────────────────────────────────────────────────────────
function PdfIcon() {
  return (
    <div className="shrink-0 w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
      <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 24 24">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM8.5 17.5h-1v-5h1.8c1.1 0 1.7.6 1.7 1.5 0 1-.7 1.5-1.8 1.5H8.5v2zm0-2.8h.7c.5 0 .8-.2.8-.7 0-.4-.3-.7-.8-.7H8.5v1.4zm4.5 2.8h-1.5v-5H13c1.4 0 2.2.8 2.2 2.4 0 1.7-.8 2.6-2.2 2.6zm-.5-4.2v3.4h.4c.8 0 1.2-.5 1.2-1.7 0-1.1-.4-1.7-1.2-1.7h-.4zm5 0h-1.8v1.2h1.6v.8h-1.6v2h-1v-5h2.8v1z"/>
      </svg>
    </div>
  )
}

// ── Resource Card ─────────────────────────────────────────────────────────────
function ResourceCard({ resource }: { resource: typeof resources[0] }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col gap-4 hover:shadow-md hover:border-gray-300 transition-all">
      <div className="flex items-start gap-4">
        <PdfIcon />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${categoryColours[resource.category]}`}>
              {resource.category}
            </span>
          </div>
          <h3 className="font-bold text-gray-900 leading-snug">{resource.title}</h3>
        </div>
      </div>

      <p className="text-sm text-gray-500 leading-relaxed flex-1">{resource.description}</p>

      <div className="flex gap-3 pt-1">
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 text-center bg-blue-600 text-white text-sm font-semibold py-2.5 px-4 rounded-xl hover:bg-blue-700 transition-colors"
        >
          View PDF
        </a>
        <a
          href={resource.url}
          download
          className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 py-2.5 px-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download
        </a>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ResourcesPage() {
  const grouped = {
    Reference: resources.filter(r => r.category === 'Reference'),
    'Code 8':  resources.filter(r => r.category === 'Code 8'),
    'Code 10': resources.filter(r => r.category === 'Code 10'),
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-12">

      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Study Resources</h1>
        <p className="text-gray-500">
          Download K53 practice tests, memos with highlighted answers, and reference manuals.
          All PDFs are free to view and download.
        </p>
      </div>

      {/* Stats bar */}
      <div className="flex gap-4 mb-10 flex-wrap">
        {Object.entries(grouped).map(([cat, items]) => (
          <div key={cat} className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 shadow-sm">
            <span className={`w-2 h-2 rounded-full ${cat === 'Reference' ? 'bg-purple-500' : cat === 'Code 8' ? 'bg-blue-500' : 'bg-green-500'}`} />
            <span className="text-sm font-medium text-gray-700">{cat}</span>
            <span className="text-sm text-gray-400">{items.length} files</span>
          </div>
        ))}
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 shadow-sm ml-auto">
          <span className="text-sm font-medium text-gray-700">Total</span>
          <span className="text-sm font-bold text-blue-600">{resources.length} PDFs</span>
        </div>
      </div>

      {/* Sections */}
      {Object.entries(grouped).map(([category, items]) => (
        <section key={category} className="mb-12">
          <div className="flex items-center gap-3 mb-5">
            <h2 className="text-xl font-bold text-gray-900">{category}</h2>
            <span className="text-sm text-gray-400">{items.length} document{items.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map(resource => (
              <ResourceCard key={resource.url} resource={resource} />
            ))}
          </div>
        </section>
      ))}

    </main>
  )
}

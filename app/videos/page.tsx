import type { Metadata } from 'next'
import { YouTubeCard, DriveCard } from '@/components/VideoCard'
import { hasFullAccess } from '@/lib/access'
import LockedContent from '@/components/LockedContent'
import { getLatestRecording } from '@/lib/settings'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'K53 Videos — Study Resources',
  description: "Watch K53 learner's licence study videos covering road signs, rules of the road, and vehicle controls.",
}

const youtubeVideos = [
  { id: '2BUf8Kk0cAU', url: 'https://youtu.be/2BUf8Kk0cAU' },
  { id: 'lS1vM2dfXe4', url: 'https://www.youtube.com/watch?v=lS1vM2dfXe4' },
  { id: 'ARUNN365XeE', url: 'https://www.youtube.com/watch?v=ARUNN365XeE' },
  { id: 'y8PiV_dbSAE', url: 'https://www.youtube.com/watch?v=y8PiV_dbSAE' },
  { id: 'IBuqgUnHV8U', url: 'https://youtu.be/IBuqgUnHV8U' },
  { id: 'A5X6975dOcU', url: 'https://youtu.be/A5X6975dOcU' },
  { id: 'DEJSLtsCpBU', url: 'https://youtu.be/DEJSLtsCpBU' },
]

// YouTube recordings pinned alongside the Drive recordings.
const liveYoutubeRecordings = [
  { id: 'VUWx9fuRTl4', url: 'https://youtu.be/VUWx9fuRTl4' },
]

// Live-session recordings pinned in the recordings section (in addition to the
// admin-set latest recording pulled from the database).
const liveRecordings = [
  { id: '1_6qU0g5DBmWkGd2hSJRzd_7uKWpaY8UH', url: 'https://drive.google.com/file/d/1_6qU0g5DBmWkGd2hSJRzd_7uKWpaY8UH/view?usp=sharing' },
  { id: '1RMFnYkvQadmvsKaBru8oAFvq6GorpdPZ', url: 'https://drive.google.com/file/d/1RMFnYkvQadmvsKaBru8oAFvq6GorpdPZ/view?usp=sharing' },
  { id: '1ALmgr1xumOVmxhMNDmHrKzBkpCJA8MKk', url: 'https://drive.google.com/file/d/1ALmgr1xumOVmxhMNDmHrKzBkpCJA8MKk/view?usp=sharing' },
]

const driveVideos = [
  { id: '1OsnYrL4QBRJ4W5flK3QJQErUFO-tz8Om', url: 'https://drive.google.com/file/d/1OsnYrL4QBRJ4W5flK3QJQErUFO-tz8Om/view?usp=drive_link' },
  { id: '1s4CNf3Ez38eo8EuLXN-g7y-TpJnSmLLp', url: 'https://drive.google.com/file/d/1s4CNf3Ez38eo8EuLXN-g7y-TpJnSmLLp/view?usp=drive_link' },
  { id: '1K-rAzIiVPLbMzYHpDLd0puSiOJ8FyuHZ', url: 'https://drive.google.com/file/d/1K-rAzIiVPLbMzYHpDLd0puSiOJ8FyuHZ/view?usp=sharing' },
  { id: '1RMFnYkvQadmvsKaBru8oAFvq6GorpdPZ', url: 'https://drive.google.com/file/d/1RMFnYkvQadmvsKaBru8oAFvq6GorpdPZ/view?usp=sharing' },
  { id: '1ALmgr1xumOVmxhMNDmHrKzBkpCJA8MKk', url: 'https://drive.google.com/file/d/1ALmgr1xumOVmxhMNDmHrKzBkpCJA8MKk/view?usp=sharing' },
  { id: '1VWl728sEfTelmmkD3GyWlgFj2fQs-2V_', url: 'https://drive.google.com/file/d/1VWl728sEfTelmmkD3GyWlgFj2fQs-2V_/view?usp=sharing' },
  { id: '1rJJrgpyu4zfYM6K50l0MKdLCtPsoPo1E', url: 'https://drive.google.com/file/d/1rJJrgpyu4zfYM6K50l0MKdLCtPsoPo1E/view?usp=sharing' },
  { id: '1CoEfJUlK8IwlX3sYuu9cQYyppUXcwAjF', url: 'https://drive.google.com/file/d/1CoEfJUlK8IwlX3sYuu9cQYyppUXcwAjF/view?usp=drive_link' },
  { id: '1UUXU3NO4bUaBVWbS9Cgl3S3tKIaM_7sm', url: 'https://drive.google.com/file/d/1UUXU3NO4bUaBVWbS9Cgl3S3tKIaM_7sm/view?usp=drive_link' },
  { id: '1AvmpMhapaPJP8yOzZ__Af4spYS_IyW10', url: 'https://drive.google.com/file/d/1AvmpMhapaPJP8yOzZ__Af4spYS_IyW10/view?usp=drive_link' },
]

export default async function VideosPage() {
  if (!(await hasFullAccess())) {
    return (
      <LockedContent
        feature="Study videos"
        description="Watch all K53 study videos covering road signs, rules of the road, and vehicle controls with full access."
      />
    )
  }

  const recording = await getLatestRecording()

  return (
    <main className="max-w-6xl mx-auto px-4 py-12">

      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Study Videos</h1>
        <p className="text-gray-500">
          Watch these videos to prepare for your K53 learner&apos;s licence test.
          Click any thumbnail to start playing.
        </p>
      </div>

      {/* Live Session Recordings — pinned at the top */}
      <section className="mb-14">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">🔴</span>
          <h2 className="text-xl font-bold text-gray-900">Live Session Recordings</h2>
          <span className="ml-auto text-sm text-gray-400">Mon–Thu, 8pm</span>
        </div>
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3 text-sm text-indigo-800 mb-6 flex items-start gap-2">
          <span className="text-lg shrink-0">📹</span>
          <span>Missed a live evening session? Catch up here — recordings of our 8pm sessions are posted in this section.</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <DriveCard fileId={recording.fileId} index={0} url={recording.url} />
          {liveYoutubeRecordings.map((v, i) => (
            <YouTubeCard key={v.id} id={v.id} index={i} url={v.url} />
          ))}
          {liveRecordings.map((v, i) => (
            <DriveCard key={v.id} fileId={v.id} index={i + 1} url={v.url} />
          ))}
        </div>
      </section>

      <div className="border-t border-gray-200 mb-14" />

      {/* YouTube Section */}
      <section className="mb-14">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">▶️</span>
          <h2 className="text-xl font-bold text-gray-900">YouTube Videos</h2>
          <span className="ml-auto text-sm text-gray-400">{youtubeVideos.length} videos</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {youtubeVideos.map((v, i) => (
            <YouTubeCard key={v.id} id={v.id} index={i} url={v.url} />
          ))}
        </div>
      </section>

      <div className="border-t border-gray-200 mb-14" />

      {/* Google Drive Section */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">📁</span>
          <h2 className="text-xl font-bold text-gray-900">Google Drive Videos</h2>
          <span className="ml-auto text-sm text-gray-400">{driveVideos.length} videos</span>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800 mb-6 flex items-start gap-2">
          <span className="text-lg shrink-0">ℹ️</span>
          <span>
            Google Drive videos require a Google account. If a video shows a login screen after clicking,
            use <strong>Open ↗</strong> to watch it directly in your browser.
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {driveVideos.map((v, i) => (
            <DriveCard key={v.id} fileId={v.id} index={i} url={v.url} />
          ))}
        </div>
      </section>

    </main>
  )
}

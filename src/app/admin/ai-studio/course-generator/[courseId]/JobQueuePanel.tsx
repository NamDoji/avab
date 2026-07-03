'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface Job {
  id:          string
  jobType:     string
  status:      string
  progress:    number
  done:        number
  total:       number
  error:       string | null
  startedAt:   string | null
  completedAt: string | null
  createdAt:   string
}

interface JobQueuePanelProps {
  courseId: string
}

const JOB_TYPE_LABELS: Record<string, string> = {
  'generate-lessons':      '📖 Lý thuyết',
  'generate-homework':     '📝 Bài tập',
  'generate-answers':      '✅ Đáp án',
  'generate-quiz':         '📊 Đề kiểm tra',
  'generate-teacher-guide':'👩‍🏫 Hướng dẫn GV',
  'generate-video-script': '🎬 Kịch bản video',
  'generate-all':          '⚡ Toàn bộ',
}

function StatusBadge({ status }: { status: string }) {
  const configs: Record<string, { bg: string; text: string; label: string }> = {
    pending:   { bg: 'bg-yellow-100', text: 'text-yellow-700', label: '🟡 Đang chờ' },
    running:   { bg: 'bg-blue-100',   text: 'text-blue-700',   label: '🔵 Đang chạy' },
    completed: { bg: 'bg-green-100',  text: 'text-green-700',  label: '✅ Hoàn thành' },
    failed:    { bg: 'bg-red-100',    text: 'text-red-700',    label: '❌ Thất bại' },
    retrying:  { bg: 'bg-orange-100', text: 'text-orange-700', label: '🔄 Đang thử lại' },
  }
  const cfg = configs[status] ?? { bg: 'bg-gray-100', text: 'text-gray-700', label: status }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  )
}

export default function JobQueuePanel({ courseId }: JobQueuePanelProps) {
  const router = useRouter()
  const [jobs,        setJobs]        = useState<Job[]>([])
  const [loading,     setLoading]     = useState(false)
  const [isExpanded,  setIsExpanded]  = useState(true)
  const [prevStatuses, setPrevStatuses] = useState<Record<string, string>>({})

  const fetchJobs = useCallback(async () => {
    try {
      const res  = await fetch(`/api/admin/ai-studio/course-generator/${courseId}/jobs`)
      const data = await res.json() as { success: boolean; jobs: Job[] }
      if (data.success) {
        // Check if any job just completed → refresh page
        const newlyCompleted = data.jobs.filter(j =>
          j.status === 'completed' && prevStatuses[j.id] === 'running'
        )
        if (newlyCompleted.length > 0) {
          router.refresh()
        }

        // Build prev-statuses map
        const statusMap: Record<string, string> = {}
        data.jobs.forEach(j => { statusMap[j.id] = j.status })
        setPrevStatuses(statusMap)

        setJobs(data.jobs)
      }
    } catch {
      // silent fail
    }
  }, [courseId, prevStatuses, router])

  // Initial load
  useEffect(() => {
    setLoading(true)
    fetchJobs().finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId])

  // Poll every 3s if any job is running/pending
  useEffect(() => {
    const hasActive = jobs.some(j => j.status === 'running' || j.status === 'pending')
    if (!hasActive) return

    const timer = setInterval(() => { void fetchJobs() }, 3000)
    return () => clearInterval(timer)
  }, [jobs, fetchJobs])

  const activeJobs    = jobs.filter(j => j.status === 'running' || j.status === 'pending')
  const completedJobs = jobs.filter(j => j.status === 'completed' || j.status === 'failed')

  if (jobs.length === 0 && !loading) return null

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(v => !v)}
        className="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-700">⚙️ Job Queue</span>
          {activeJobs.length > 0 && (
            <span className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
              {activeJobs.length} đang chạy
            </span>
          )}
        </div>
        <span className="text-gray-400 text-sm">{isExpanded ? '▲' : '▼'}</span>
      </button>

      {isExpanded && (
        <div className="border-t border-gray-100">
          {loading && jobs.length === 0 ? (
            <div className="px-5 py-4 text-sm text-gray-400 text-center">Đang tải...</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {/* Active jobs */}
              {activeJobs.map(job => (
                <div key={job.id} className="px-5 py-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-semibold text-gray-700">
                      {JOB_TYPE_LABELS[job.jobType] ?? job.jobType}
                    </span>
                    <StatusBadge status={job.status} />
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${job.total > 0 ? Math.round((job.done / job.total) * 100) : job.progress}%` }}
                    />
                  </div>
                  {job.total > 0 && (
                    <p className="text-xs text-gray-400 mt-1">{job.done}/{job.total} chuyên đề</p>
                  )}
                </div>
              ))}

              {/* Completed jobs (last 5) */}
              {completedJobs.slice(0, 5).map(job => (
                <div key={job.id} className="px-5 py-2.5 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {JOB_TYPE_LABELS[job.jobType] ?? job.jobType}
                  </span>
                  <div className="flex items-center gap-2">
                    {job.error && (
                      <span className="text-xs text-red-500 truncate max-w-[150px]" title={job.error}>
                        {job.error}
                      </span>
                    )}
                    <StatusBadge status={job.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Brain, TrendingUp, Lightbulb, Target, ChevronRight, Loader2, RefreshCw } from 'lucide-react'

interface AIData {
  analysis?: any
  pathway?: any
  predict?: any
  recommend?: any
  analyze?: any
}

interface Props {
  userId: string
}

function ScoreRing({ pct, size = 80 }: { pct: number; size?: number }) {
  const r = (size - 8) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ
  const color = pct >= 80 ? '#14B8A6' : pct >= 60 ? '#7C3AED' : pct >= 40 ? '#F97316' : '#EF4444'

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E5E7EB" strokeWidth="8" />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth="8"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <span className="absolute text-lg font-black" style={{ color }}>
        {pct}%
      </span>
    </div>
  )
}

export function AIDashboard({ userId }: Props) {
  const [data, setData] = useState<AIData>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [activeTab, setActiveTab] = useState<'analyze' | 'pathway' | 'predict' | 'recommend'>('predict')

  const fetchAI = async (endpoint: string, key: keyof AIData) => {
    setLoading((prev) => ({ ...prev, [key]: true }))
    try {
      const method = endpoint === 'analyze' ? 'POST' : 'GET'
      const res = await fetch(`/api/ai/${endpoint}`, {
        method,
        headers: method === 'POST' ? { 'Content-Type': 'application/json' } : undefined,
        body: method === 'POST' ? JSON.stringify({}) : undefined,
      })
      const json = await res.json()
      if (json.success) setData((prev) => ({ ...prev, [key]: json.data }))
    } catch (e) {
      console.error(e)
    }
    setLoading((prev) => ({ ...prev, [key]: false }))
  }

  useEffect(() => {
    fetchAI('predict', 'predict')
  }, [])

  const tabs = [
    { id: 'predict', label: 'Đánh giá', icon: '🎯', desc: 'Khả năng đỗ học bổng' },
    { id: 'analyze', label: 'Phân tích', icon: '🔍', desc: 'Lỗi sai & điểm yếu' },
    { id: 'pathway', label: 'Lộ trình', icon: '🗺️', desc: 'Cá nhân hoá AI' },
    { id: 'recommend', label: 'Bài tập', icon: '💡', desc: 'Gợi ý AI' },
  ] as const

  return (
    <div className="bg-white rounded-4xl border-2 border-purple-100 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-teal-500 p-5 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
            <Brain size={22} />
          </div>
          <div>
            <h2 className="text-lg font-black">AI Hỗ Trợ Học Tập</h2>
            <p className="text-white/70 text-xs">Phân tích thông minh bởi AvaB AI</p>
          </div>
          <button
            onClick={() => fetchAI(activeTab === 'analyze' ? 'analyze' : activeTab, activeTab as keyof AIData)}
            className="ml-auto p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all"
          >
            <RefreshCw size={16} className={loading[activeTab] ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-3 bg-gray-50 border-b border-gray-100 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id)
              if (!data[tab.id as keyof AIData]) {
                fetchAI(tab.id === 'analyze' ? 'analyze' : tab.id, tab.id as keyof AIData)
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-gray-500 hover:bg-white hover:text-purple-600'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* PREDICT */}
        {activeTab === 'predict' && (
          <PredictPanel data={data.predict} loading={loading.predict} />
        )}
        {/* ANALYZE */}
        {activeTab === 'analyze' && (
          <AnalyzePanel data={data.analyze} loading={loading.analyze} />
        )}
        {/* PATHWAY */}
        {activeTab === 'pathway' && (
          <PathwayPanel data={data.pathway} loading={loading.pathway} />
        )}
        {/* RECOMMEND */}
        {activeTab === 'recommend' && (
          <RecommendPanel data={data.recommend} loading={loading.recommend} />
        )}
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-gray-400">
      <Loader2 className="animate-spin mb-3 text-purple-400" size={32} />
      <p className="text-sm font-medium">AI đang phân tích...</p>
      <p className="text-xs mt-1">Thường mất 3–5 giây</p>
    </div>
  )
}

function PredictPanel({ data, loading }: { data?: any; loading?: boolean }) {
  if (loading) return <LoadingState />
  if (!data) return <div className="text-center text-gray-400 py-8">Bấm 🔄 để phân tích</div>

  const pct = data.probability || 0
  const levelColors: Record<string, string> = {
    'Xuất sắc': 'text-teal-600 bg-teal-50',
    'Tốt': 'text-purple-600 bg-purple-50',
    'Trung bình': 'text-orange-600 bg-orange-50',
    'Cần cố gắng thêm': 'text-red-600 bg-red-50',
  }

  return (
    <div className="space-y-5">
      {/* Main score */}
      <div className="flex items-center gap-5 bg-gradient-to-br from-purple-50 to-teal-50 rounded-3xl p-5">
        <ScoreRing pct={pct} size={88} />
        <div>
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Khả năng đỗ học bổng</p>
          <span className={`inline-block text-sm font-black px-3 py-1 rounded-full mb-2 ${levelColors[data.level] || 'text-gray-600 bg-gray-100'}`}>
            {data.level}
          </span>
          <p className="text-gray-700 text-sm leading-relaxed">{data.verdict}</p>
        </div>
      </div>

      {/* Stats */}
      {data.stats && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Độ chính xác', value: `${data.stats.overallAccuracy}%`, icon: '🎯' },
            { label: 'Chuyên đề', value: `${data.stats.subjectsDone}/${data.stats.totalSubjects}`, icon: '📚' },
            { label: 'Câu đã làm', value: data.stats.totalAnswered, icon: '✏️' },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-gray-100 rounded-2xl p-3 text-center">
              <div className="text-xl mb-1">{s.icon}</div>
              <div className="font-black text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-400">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Action plan */}
      {data.actionPlan?.length > 0 && (
        <div>
          <h4 className="font-bold text-gray-900 text-sm mb-2">📋 Cần làm ngay:</h4>
          <div className="space-y-1.5">
            {data.actionPlan.map((action: string, i: number) => (
              <div key={i} className="flex items-start gap-2 bg-purple-50 rounded-xl px-3 py-2">
                <span className="text-purple-500 font-bold text-xs mt-0.5">{i + 1}.</span>
                <span className="text-sm text-gray-700">{action}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.parentNote && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-3">
          <p className="text-xs font-bold text-yellow-800 mb-1">👨‍👩‍👧 Nhắn phụ huynh:</p>
          <p className="text-sm text-yellow-900">{data.parentNote}</p>
        </div>
      )}
    </div>
  )
}

function AnalyzePanel({ data, loading }: { data?: any; loading?: boolean }) {
  if (loading) return <LoadingState />
  if (!data) return <div className="text-center text-gray-400 py-8">Bấm 🔄 để phân tích lỗi sai</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 bg-purple-50 rounded-2xl p-4">
        <div className="text-3xl">{data.accuracy >= 80 ? '🌟' : data.accuracy >= 60 ? '👍' : '💪'}</div>
        <div>
          <p className="font-black text-gray-900">{data.accuracy}% chính xác</p>
          <p className="text-sm text-gray-600">{data.summary}</p>
        </div>
      </div>

      {data.weakAreas?.length > 0 && (
        <div>
          <h4 className="font-bold text-red-700 text-sm mb-2">⚠️ Điểm yếu cần cải thiện:</h4>
          {data.weakAreas.map((w: string, i: number) => (
            <div key={i} className="flex items-center gap-2 text-sm text-gray-700 py-1.5 border-b border-gray-50">
              <span className="text-red-400">•</span> {w}
            </div>
          ))}
        </div>
      )}

      {data.errorPatterns?.length > 0 && (
        <div>
          <h4 className="font-bold text-orange-700 text-sm mb-2">🔍 Dạng lỗi thường gặp:</h4>
          {data.errorPatterns.map((e: string, i: number) => (
            <div key={i} className="bg-orange-50 rounded-xl px-3 py-2 text-sm text-orange-900 mb-1.5">
              {e}
            </div>
          ))}
        </div>
      )}

      {data.strengths?.length > 0 && (
        <div>
          <h4 className="font-bold text-teal-700 text-sm mb-2">✅ Điểm mạnh:</h4>
          {data.strengths.map((s: string, i: number) => (
            <div key={i} className="flex items-center gap-2 text-sm text-gray-700 py-1">
              <span className="text-teal-400">✓</span> {s}
            </div>
          ))}
        </div>
      )}

      {data.recommendation && (
        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4">
          <p className="text-xs font-bold text-teal-700 mb-1">🚀 Khuyến nghị AI:</p>
          <p className="text-sm text-teal-900">{data.recommendation}</p>
        </div>
      )}

      {data.encouragement && (
        <div className="text-center">
          <span className="text-2xl">🎉</span>
          <p className="text-sm text-purple-600 font-semibold mt-1">{data.encouragement}</p>
        </div>
      )}
    </div>
  )
}

function PathwayPanel({ data, loading }: { data?: any; loading?: boolean }) {
  if (loading) return <LoadingState />
  if (!data) return <div className="text-center text-gray-400 py-8">Bấm 🔄 để xem lộ trình</div>

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-sm mb-2">
          <span className="font-bold text-gray-900">Tiến độ tổng</span>
          <span className="text-purple-600 font-black">{data.completionPct}%</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-teal-500 rounded-full transition-all duration-700"
            style={{ width: `${data.completionPct}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">
          {data.masteredCount}/{data.totalSubjects} chuyên đề hoàn thành tốt (≥80%)
        </p>
      </div>

      {/* Next step highlight */}
      {data.nextStep && (
        <div className="bg-gradient-to-br from-purple-600 to-teal-500 rounded-3xl p-5 text-white">
          <p className="text-xs font-bold text-white/70 mb-1">🎯 Việc cần làm ngay:</p>
          <p className="font-bold text-base">{data.nextStep}</p>
        </div>
      )}

      {/* Week plan */}
      {data.weekPlan?.length > 0 && (
        <div>
          <h4 className="font-bold text-gray-900 text-sm mb-2">📅 Kế hoạch tuần này:</h4>
          <div className="space-y-2">
            {data.weekPlan.map((day: string, i: number) => (
              <div key={i} className="flex items-start gap-2 bg-purple-50 rounded-xl px-3 py-2">
                <ChevronRight size={14} className="text-purple-500 mt-0.5 shrink-0" />
                <span className="text-sm text-gray-700">{day}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.tip && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-3">
          <p className="text-xs font-bold text-yellow-800 mb-1">💡 Mẹo học tập:</p>
          <p className="text-sm text-yellow-900">{data.tip}</p>
        </div>
      )}

      {data.milestone && (
        <div className="text-center bg-teal-50 rounded-2xl p-3">
          <p className="text-xs text-teal-600 font-semibold mb-0.5">Mục tiêu gần nhất</p>
          <p className="font-bold text-teal-900">{data.milestone}</p>
        </div>
      )}
    </div>
  )
}

function RecommendPanel({ data, loading }: { data?: any; loading?: boolean }) {
  if (loading) return <LoadingState />
  if (!data) return <div className="text-center text-gray-400 py-8">Bấm 🔄 để xem gợi ý bài tập</div>

  return (
    <div className="space-y-4">
      {data.exercises?.map((ex: any, i: number) => (
        <div key={i} className="bg-white border-2 border-purple-50 rounded-3xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-black text-gray-900 text-sm">{ex.type}</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              ex.difficulty === 'Dễ' ? 'bg-green-100 text-green-700' :
              ex.difficulty === 'Trung bình' ? 'bg-orange-100 text-orange-700' :
              'bg-red-100 text-red-700'
            }`}>
              {ex.difficulty}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-2">{ex.description}</p>
          {ex.example && (
            <div className="bg-purple-50 rounded-xl p-2.5 mb-2">
              <p className="text-xs font-semibold text-purple-700 mb-1">Ví dụ:</p>
              <p className="text-sm text-purple-900 font-medium">{ex.example}</p>
            </div>
          )}
          <p className="text-xs text-gray-400 italic">{ex.why}</p>
        </div>
      ))}

      {data.practiceMethod && (
        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-3">
          <p className="text-xs font-bold text-teal-700 mb-1">📚 Phương pháp luyện tập:</p>
          <p className="text-sm text-teal-900">{data.practiceMethod}</p>
        </div>
      )}

      {data.dailyGoal && (
        <div className="flex items-center gap-3 bg-purple-50 rounded-2xl p-3">
          <span className="text-2xl">🎯</span>
          <div>
            <p className="text-xs text-purple-600 font-semibold">Mục tiêu hàng ngày</p>
            <p className="font-bold text-gray-900">{data.dailyGoal}</p>
          </div>
        </div>
      )}

      {data.motivation && (
        <div className="text-center py-2">
          <p className="text-sm text-purple-600 font-semibold italic">"{data.motivation}"</p>
        </div>
      )}
    </div>
  )
}

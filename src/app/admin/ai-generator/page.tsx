'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Sparkles, Zap, Clock, ChevronRight, Activity } from 'lucide-react'

const MODULES = [
  {
    id: 'education-standard',
    name: 'Education Standard',
    icon: '📚',
    desc: 'Tiêu chuẩn giáo dục toàn hệ thống',
    status: 'active' as const,
    color: 'purple',
    actions: ['Generate', 'View', 'History'],
    count: 10,
    gradient: 'from-purple-500 to-purple-700',
    border: 'border-purple-200 hover:border-purple-400',
    badge: 'bg-purple-100 text-purple-700',
    glow: 'hover:shadow-purple-100',
  },
  {
    id: 'curriculum',
    name: 'Curriculum Generator',
    icon: '🗂️',
    desc: 'Sinh chương trình học tự động',
    status: 'active' as const,
    color: 'blue',
    actions: ['Generate', 'View', 'History'],
    count: 3,
    gradient: 'from-blue-500 to-blue-700',
    border: 'border-blue-200 hover:border-blue-400',
    badge: 'bg-blue-100 text-blue-700',
    glow: 'hover:shadow-blue-100',
  },
  {
    id: 'lesson',
    name: 'Lesson Generator',
    icon: '📖',
    desc: 'Tạo bài học theo chuẩn AvaB',
    status: 'beta' as const,
    color: 'teal',
    actions: ['Generate', 'Preview', 'History'],
    count: 124,
    gradient: 'from-teal-500 to-teal-700',
    border: 'border-teal-200 hover:border-teal-400',
    badge: 'bg-teal-100 text-teal-700',
    glow: 'hover:shadow-teal-100',
  },
  {
    id: 'homework',
    name: 'Homework Generator',
    icon: '✏️',
    desc: 'Sinh bài tập + đáp án + lời giải',
    status: 'active' as const,
    color: 'green',
    actions: ['Generate', 'View', 'History'],
    count: 855,
    gradient: 'from-green-500 to-green-700',
    border: 'border-green-200 hover:border-green-400',
    badge: 'bg-green-100 text-green-700',
    glow: 'hover:shadow-green-100',
  },
  {
    id: 'qa',
    name: 'QA Engine',
    icon: '✅',
    desc: 'Kiểm định chất lượng học liệu',
    status: 'beta' as const,
    color: 'orange',
    actions: ['Run QA', 'View', 'History'],
    count: 0,
    gradient: 'from-orange-500 to-orange-700',
    border: 'border-orange-200 hover:border-orange-400',
    badge: 'bg-orange-100 text-orange-700',
    glow: 'hover:shadow-orange-100',
  },
  {
    id: 'publishing',
    name: 'Publishing Engine',
    icon: '📤',
    desc: 'Xuất bản đa định dạng',
    status: 'beta' as const,
    color: 'pink',
    actions: ['Publish', 'Preview', 'History'],
    count: 0,
    gradient: 'from-pink-500 to-pink-700',
    border: 'border-pink-200 hover:border-pink-400',
    badge: 'bg-pink-100 text-pink-700',
    glow: 'hover:shadow-pink-100',
  },
]

const STATUS_CONFIG = {
  active: { label: 'Active', cls: 'bg-green-100 text-green-700 border-green-200' },
  beta: { label: 'Beta', cls: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  soon: { label: 'Coming Soon', cls: 'bg-gray-100 text-gray-500 border-gray-200' },
}

export default function AIGeneratorPage() {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const totalGenerated = MODULES.reduce((s, m) => s + m.count, 0)

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-gray-50 via-purple-50/30 to-blue-50/20">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 text-white py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        <div className="container-custom relative">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/admin" className="text-gray-400 hover:text-white text-sm transition-colors">
              ← Admin
            </Link>
            <span className="text-gray-600">/</span>
            <span className="text-gray-300 text-sm">AI Generator</span>
          </div>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-500 rounded-2xl flex items-center justify-center text-2xl shadow-lg">
                  🤖
                </div>
                <div>
                  <h1 className="text-3xl font-black">AI Generator Workspace</h1>
                  <p className="text-purple-300 text-sm">AvaB AI Operating System — Powered by Intelligence</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6 text-center">
              <div>
                <div className="text-3xl font-black text-white">{MODULES.filter(m => m.status === 'active').length}</div>
                <div className="text-xs text-gray-400 mt-0.5">Active Modules</div>
              </div>
              <div className="w-px h-10 bg-gray-700" />
              <div>
                <div className="text-3xl font-black text-purple-300">{totalGenerated.toLocaleString()}</div>
                <div className="text-xs text-gray-400 mt-0.5">Items Generated</div>
              </div>
              <div className="w-px h-10 bg-gray-700" />
              <div>
                <div className="text-3xl font-black text-green-400">6</div>
                <div className="text-xs text-gray-400 mt-0.5">Total Modules</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Quick Action Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-8 flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 text-gray-500 text-sm mr-2">
            <Zap size={16} className="text-purple-500" />
            <span className="font-semibold">Quick Actions:</span>
          </div>
          <Link href="/admin/ai-generator/lesson"
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 rounded-xl text-sm font-bold hover:from-purple-700 hover:to-purple-800 transition-all shadow-sm hover:shadow-md">
            <Sparkles size={14} />
            Generate Lesson
          </Link>
          <Link href="/admin/ai-generator/homework"
            className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-xl text-sm font-bold hover:from-green-700 hover:to-green-800 transition-all shadow-sm hover:shadow-md">
            ✏️ Generate Homework
          </Link>
          <Link href="/admin/ai-generator/curriculum"
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm hover:shadow-md">
            🗂️ Build Curriculum
          </Link>
          <div className="ml-auto flex items-center gap-2 text-xs text-gray-400">
            <Activity size={12} className="text-green-500" />
            All systems operational
          </div>
        </div>

        {/* Module Grid */}
        <div className="mb-4">
          <p className="text-sm font-bold text-gray-700 mb-5">🧩 AI Modules — Click to open workspace</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {MODULES.map((mod) => {
              const statusCfg = STATUS_CONFIG[mod.status]
              return (
                <div
                  key={mod.id}
                  className={`bg-white rounded-3xl border-2 shadow-sm ${mod.border} ${mod.glow} hover:shadow-lg transition-all duration-200 group overflow-hidden`}
                  onMouseEnter={() => setHoveredId(mod.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  {/* Card Header */}
                  <div className={`bg-gradient-to-r ${mod.gradient} p-5 relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="flex items-start justify-between relative">
                      <div className="text-4xl">{mod.icon}</div>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${statusCfg.cls} bg-white/90`}>
                        {statusCfg.label}
                      </span>
                    </div>
                    <div className="mt-3 relative">
                      <h3 className="text-white font-black text-lg leading-tight">{mod.name}</h3>
                      <p className="text-white/70 text-xs mt-1">{mod.desc}</p>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4">
                    {/* Stats row */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Clock size={12} />
                        <span>v1.0</span>
                      </div>
                      {mod.count > 0 && (
                        <div className={`text-xs font-bold px-2 py-0.5 rounded-full ${mod.badge}`}>
                          {mod.count.toLocaleString()} items
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 flex-wrap mb-3">
                      {mod.actions.map((action, idx) => (
                        <Link
                          key={action}
                          href={`/admin/ai-generator/${mod.id}`}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-all ${idx === 0
                            ? `bg-gradient-to-r ${mod.gradient} text-white hover:opacity-90 shadow-sm`
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                          {action}
                        </Link>
                      ))}
                    </div>

                    {/* Open workspace link */}
                    <Link
                      href={`/admin/ai-generator/${mod.id}`}
                      className="flex items-center justify-between w-full text-xs text-gray-400 hover:text-gray-700 transition-colors pt-2 border-t border-gray-100 group-hover:text-purple-600"
                    >
                      <span>Open Workspace</span>
                      <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Pipeline overview */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mt-6">
          <h2 className="font-black text-gray-900 mb-4 flex items-center gap-2">
            <span>🔄</span> AI Generation Pipeline
          </h2>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            {[
              { icon: '📚', label: 'Standards', color: 'bg-purple-100 text-purple-700' },
              { icon: '→', label: '', color: 'text-gray-400' },
              { icon: '🗂️', label: 'Curriculum', color: 'bg-blue-100 text-blue-700' },
              { icon: '→', label: '', color: 'text-gray-400' },
              { icon: '📖', label: 'Lessons', color: 'bg-teal-100 text-teal-700' },
              { icon: '→', label: '', color: 'text-gray-400' },
              { icon: '✏️', label: 'Homework', color: 'bg-green-100 text-green-700' },
              { icon: '→', label: '', color: 'text-gray-400' },
              { icon: '✅', label: 'QA Check', color: 'bg-orange-100 text-orange-700' },
              { icon: '→', label: '', color: 'text-gray-400' },
              { icon: '📤', label: 'Publish', color: 'bg-pink-100 text-pink-700' },
            ].map((step, i) =>
              step.label ? (
                <span key={i} className={`font-semibold px-3 py-1.5 rounded-xl ${step.color}`}>
                  {step.icon} {step.label}
                </span>
              ) : (
                <span key={i} className="text-gray-400 font-bold text-lg">→</span>
              )
            )}
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Content flows through the pipeline: Standards define quality → Curriculum structures knowledge → Lessons deliver content → Homework assesses understanding → QA validates quality → Publishing distributes content.
          </p>
        </div>
      </div>
    </div>
  )
}

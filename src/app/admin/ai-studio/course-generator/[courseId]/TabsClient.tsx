'use client'

import { useState, type ReactNode } from 'react'

type Tab = 'structure' | 'review' | 'publish'

interface TabsClientProps {
  courseId:     string
  structureTab: ReactNode
  reviewTab:    ReactNode
  publishTab:   ReactNode
}

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'structure', label: 'Cấu trúc',  icon: '🗂️' },
  { id: 'review',    label: 'Review',    icon: '🔍' },
  { id: 'publish',   label: 'Xuất bản',  icon: '🚀' },
]

export default function TabsClient({ structureTab, reviewTab, publishTab }: TabsClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>('structure')

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-5">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'structure' && structureTab}
      {activeTab === 'review'    && reviewTab}
      {activeTab === 'publish'   && publishTab}
    </div>
  )
}

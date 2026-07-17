'use client'

import { useState } from 'react'
import LevelConfigForm from './LevelConfigForm'
import HolidaysTab from './HolidaysTab'
import RulesTab from './RulesTab'
import TeachersTab from './TeachersTab'

interface PeriodSlot {
  period: number
  start: string
  end: string
}

interface LevelConfig {
  id?: string
  level: string
  levelName: string
  periodsPerDay: number
  periodDuration: number
  breakAfterPeriod: number | null
  startTime: string
  workingDays: number[]
  periodSchedule: PeriodSlot[]
  subjectsPerWeek: Record<string, number>
}

interface Holiday {
  id: string
  name: string
  startDate: string
  endDate: string
  type: string
  campusId: string | null
  isRecurring: boolean
}

interface TimetableRule {
  id: string
  ruleType: string
  ruleScope: string
  scopeValue: string | null
  value: Record<string, unknown>
  isActive: boolean
  description: string | null
}

interface TeacherSubject {
  id: string
  name: string | null
  subjects: string
}

interface SettingsTabsProps {
  levelConfigs: LevelConfig[]
  holidays: Holiday[]
  rules: TimetableRule[]
  teachers: TeacherSubject[]
}

const TABS = [
  { id: 'levels', label: '📚 Cấu hình cấp học' },
  { id: 'holidays', label: '📅 Ngày nghỉ & Sự kiện' },
  { id: 'rules', label: '📏 Quy tắc xếp TKB' },
  { id: 'teachers', label: '📖 Giáo viên theo môn' },
]

const LEVEL_META: Record<string, { icon: string; color: string; bg: string }> = {
  MN: { icon: '🌱', color: '#16a34a', bg: '#f0fdf4' },
  TH: { icon: '📗', color: '#2563eb', bg: '#eff6ff' },
  THCS: { icon: '📘', color: '#951F3D', bg: '#FFF7F9' },
  THPT: { icon: '📙', color: '#ea580c', bg: '#fff7ed' },
}

export default function SettingsTabs({ levelConfigs, holidays, rules, teachers }: SettingsTabsProps) {
  const [activeTab, setActiveTab] = useState('levels')
  const [activeLevelIdx, setActiveLevelIdx] = useState(0)

  return (
    <div>
      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        gap: 4,
        background: '#f1f5f9',
        borderRadius: 14,
        padding: 4,
        marginBottom: 24,
        flexWrap: 'wrap',
      }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '9px 18px',
              borderRadius: 10,
              border: 'none',
              background: activeTab === tab.id ? '#fff' : 'transparent',
              color: activeTab === tab.id ? '#1e293b' : '#64748b',
              fontSize: 13,
              fontWeight: activeTab === tab.id ? 800 : 600,
              cursor: 'pointer',
              boxShadow: activeTab === tab.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Levels */}
      {activeTab === 'levels' && (
        <div>
          {/* Level selector */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
            {levelConfigs.map((cfg, idx) => {
              const meta = LEVEL_META[cfg.level] ?? { icon: '📋', color: '#64748b', bg: '#f8fafc' }
              const active = activeLevelIdx === idx
              return (
                <button
                  key={cfg.level}
                  type="button"
                  onClick={() => setActiveLevelIdx(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 20px',
                    borderRadius: 12,
                    border: `2px solid ${active ? meta.color : '#e2e8f0'}`,
                    background: active ? meta.bg : '#fff',
                    color: active ? meta.color : '#64748b',
                    fontSize: 14,
                    fontWeight: 800,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  <span>{meta.icon}</span>
                  <span>{cfg.levelName}</span>
                  <span style={{
                    fontSize: 11,
                    padding: '2px 8px',
                    borderRadius: 10,
                    background: active ? meta.color : '#f1f5f9',
                    color: active ? '#fff' : '#94a3b8',
                    fontWeight: 700,
                  }}>
                    {cfg.level}
                  </span>
                </button>
              )
            })}
          </div>

          {levelConfigs[activeLevelIdx] && (
            <div style={{
              background: '#fff',
              borderRadius: 20,
              padding: 24,
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <span style={{ fontSize: 22 }}>{LEVEL_META[levelConfigs[activeLevelIdx].level]?.icon ?? '📋'}</span>
                <div>
                  <h2 style={{ fontSize: 16, fontWeight: 800, color: '#1e293b', margin: 0 }}>
                    {levelConfigs[activeLevelIdx].levelName}
                  </h2>
                  <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>
                    Cấu hình tiết học cho cấp {levelConfigs[activeLevelIdx].level}
                  </p>
                </div>
              </div>
              <LevelConfigForm config={levelConfigs[activeLevelIdx]} />
            </div>
          )}
        </div>
      )}

      {/* Tab: Holidays */}
      {activeTab === 'holidays' && (
        <div style={{
          background: '#fff',
          borderRadius: 20,
          padding: 24,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}>
          <HolidaysTab initialHolidays={holidays} />
        </div>
      )}

      {/* Tab: Rules */}
      {activeTab === 'rules' && (
        <div style={{
          background: '#fff',
          borderRadius: 20,
          padding: 24,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}>
          <RulesTab initialRules={rules} />
        </div>
      )}

      {/* Tab: Teachers */}
      {activeTab === 'teachers' && (
        <div style={{
          background: '#fff',
          borderRadius: 20,
          padding: 24,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}>
          <TeachersTab initialTeachers={teachers} />
        </div>
      )}
    </div>
  )
}

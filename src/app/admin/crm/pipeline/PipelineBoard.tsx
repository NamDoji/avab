'use client'

import { useState, useCallback } from 'react'

type Stage = 'NEW' | 'FOLLOWUP' | 'WON' | 'LOST'

interface Lead {
  id: string
  name: string | null
  phone: string
  email: string | null
  note: string | null
  note2: string | null
  type: string
  status: string
  createdAt: string
  updatedAt: string
}

interface PipelineBoardProps {
  leads: Lead[]
}

const STAGES: { id: Stage; label: string; icon: string; color: string; bg: string; headerBg: string }[] = [
  { id: 'NEW',      label: 'Mới',          icon: '🆕', color: '#1d4ed8', bg: '#eff6ff',  headerBg: '#dbeafe' },
  { id: 'FOLLOWUP', label: 'Đang tư vấn',  icon: '💬', color: '#854d0e', bg: '#fefce8',  headerBg: '#fef9c3' },
  { id: 'WON',      label: 'Đã đăng ký',   icon: '✅', color: '#166534', bg: '#f0fdf4',  headerBg: '#dcfce7' },
  { id: 'LOST',     label: 'Không đăng ký',icon: '❌', color: '#991b1b', bg: '#fff5f5',  headerBg: '#fee2e2' },
]

const STAGE_ORDER: Stage[] = ['NEW', 'FOLLOWUP', 'WON', 'LOST']

export default function PipelineBoard({ leads: initialLeads }: PipelineBoardProps) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [updating, setUpdating] = useState<string | null>(null)

  const moveStage = useCallback(async (leadId: string, newStage: Stage) => {
    setUpdating(leadId)
    // Optimistic update
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: newStage } : l))
    )

    try {
      const res = await fetch(`/api/admin/contacts/${leadId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStage }),
      })
      if (!res.ok) throw new Error('Failed')
    } catch {
      // Revert on error
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, status: leads.find(x => x.id === leadId)?.status ?? l.status } : l))
      )
    } finally {
      setUpdating(null)
    }
  }, [leads])

  const leadsByStage = (stage: Stage) => leads.filter((l) => l.status === stage)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {STAGES.map((stage) => {
        const stageLeads = leadsByStage(stage.id)
        const stageIdx = STAGE_ORDER.indexOf(stage.id)
        const prevStage = stageIdx > 0 ? STAGE_ORDER[stageIdx - 1] : null
        const nextStage = stageIdx < STAGE_ORDER.length - 1 ? STAGE_ORDER[stageIdx + 1] : null

        return (
          <div key={stage.id} className="flex flex-col gap-3">
            {/* Column header */}
            <div
              className="rounded-2xl px-4 py-3 flex items-center justify-between"
              style={{ background: stage.headerBg }}
            >
              <div className="flex items-center gap-2">
                <span>{stage.icon}</span>
                <span className="font-bold text-sm" style={{ color: stage.color }}>{stage.label}</span>
              </div>
              <span
                className="text-xs font-black px-2 py-0.5 rounded-full"
                style={{ background: stage.color, color: '#fff' }}
              >
                {stageLeads.length}
              </span>
            </div>

            {/* Cards */}
            <div className="flex flex-col gap-2 min-h-[120px]">
              {stageLeads.length === 0 ? (
                <div
                  className="rounded-2xl p-4 text-center border-2 border-dashed"
                  style={{ borderColor: stage.color + '33', color: stage.color + '88', background: stage.bg }}
                >
                  <p className="text-xs font-semibold">Trống</p>
                </div>
              ) : (
                stageLeads.map((lead) => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    stageBg={stage.bg}
                    stageColor={stage.color}
                    prevStage={prevStage}
                    nextStage={nextStage}
                    isUpdating={updating === lead.id}
                    onMove={moveStage}
                  />
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Lead Card ─────────────────────────────────────────────────────

interface LeadCardProps {
  lead: Lead
  stageBg: string
  stageColor: string
  prevStage: Stage | null
  nextStage: Stage | null
  isUpdating: boolean
  onMove: (leadId: string, stage: Stage) => void
}

const stageLabel: Record<Stage, string> = {
  NEW: 'Mới',
  FOLLOWUP: 'Tư vấn',
  WON: 'Đã đăng ký',
  LOST: 'Không ĐK',
}

function LeadCard({ lead, stageBg, stageColor, prevStage, nextStage, isUpdating, onMove }: LeadCardProps) {
  return (
    <div
      className="rounded-2xl p-4 shadow-sm transition-shadow hover:shadow-md"
      style={{
        background: '#fff',
        border: `1px solid ${stageColor}22`,
        opacity: isUpdating ? 0.6 : 1,
      }}
    >
      {/* Lead info */}
      <p className="font-bold text-gray-900 text-sm">{lead.name || 'Không tên'}</p>
      <p className="text-xs text-gray-500 mt-0.5">{lead.phone}</p>
      {lead.email && <p className="text-xs text-gray-400">{lead.email}</p>}

      {lead.note && (
        <div
          className="mt-2 text-xs rounded-xl px-3 py-2 leading-relaxed"
          style={{ background: stageBg, color: stageColor }}
        >
          {lead.note.length > 80 ? lead.note.slice(0, 80) + '…' : lead.note}
        </div>
      )}

      <p className="text-xs text-gray-300 mt-2">
        {new Date(lead.createdAt).toLocaleDateString('vi-VN')}
      </p>

      {/* Stage move buttons */}
      <div className="flex gap-1.5 mt-3">
        {prevStage && (
          <button
            onClick={() => onMove(lead.id, prevStage)}
            disabled={isUpdating}
            className="flex-1 text-xs font-semibold py-1.5 rounded-lg border transition-colors hover:bg-gray-50 disabled:opacity-40"
            style={{ borderColor: '#e5e7eb', color: '#6b7280' }}
          >
            ← {stageLabel[prevStage]}
          </button>
        )}
        {nextStage && (
          <button
            onClick={() => onMove(lead.id, nextStage)}
            disabled={isUpdating}
            className="flex-1 text-xs font-bold py-1.5 rounded-lg transition-colors disabled:opacity-40"
            style={{ background: stageColor, color: '#fff' }}
          >
            {stageLabel[nextStage]} →
          </button>
        )}
      </div>
    </div>
  )
}

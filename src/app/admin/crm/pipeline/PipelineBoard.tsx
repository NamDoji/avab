'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'

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

const STAGES: {
  id: Stage
  label: string
  icon: string
  color: string
  bg: string
  headerBg: string
}[] = [
  { id: 'NEW',      label: 'Mới',           icon: '🆕', color: '#1d4ed8', bg: '#eff6ff',  headerBg: '#dbeafe' },
  { id: 'FOLLOWUP', label: 'Đang tư vấn',   icon: '💬', color: '#854d0e', bg: '#fefce8',  headerBg: '#fef9c3' },
  { id: 'WON',      label: 'Đã đăng ký',    icon: '✅', color: '#166534', bg: '#f0fdf4',  headerBg: '#dcfce7' },
  { id: 'LOST',     label: 'Không đăng ký', icon: '❌', color: '#991b1b', bg: '#fff5f5',  headerBg: '#fee2e2' },
]

const STAGE_ORDER: Stage[] = ['NEW', 'FOLLOWUP', 'WON', 'LOST']

const stageLabel: Record<Stage, string> = {
  NEW:      'Mới',
  FOLLOWUP: 'Tư vấn',
  WON:      'Đã đăng ký',
  LOST:     'Không ĐK',
}

export default function PipelineBoard({ leads: initialLeads }: PipelineBoardProps) {
  const [leads, setLeads]     = useState<Lead[]>(initialLeads)
  const [updating, setUpdating] = useState<string | null>(null)

  const moveStage = useCallback(
    async (leadId: string, newStage: Stage) => {
      setUpdating(leadId)
      const prev = leads.find((l) => l.id === leadId)?.status ?? 'NEW'
      // Optimistic
      setLeads((ls) => ls.map((l) => (l.id === leadId ? { ...l, status: newStage } : l)))
      try {
        const res = await fetch(`/api/admin/contacts/${leadId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStage }),
        })
        if (!res.ok) throw new Error('Failed')
      } catch {
        setLeads((ls) => ls.map((l) => (l.id === leadId ? { ...l, status: prev } : l)))
      } finally {
        setUpdating(null)
      }
    },
    [leads],
  )

  const updateNote2 = useCallback((leadId: string, note2: string) => {
    setLeads((ls) => ls.map((l) => (l.id === leadId ? { ...l, note2 } : l)))
  }, [])

  const leadsByStage = (stage: Stage) => leads.filter((l) => l.status === stage)

  return (
    <div className="flex gap-4" style={{ minWidth: "max-content" }}>
      {STAGES.map((stage) => {
        const stageLeads = leadsByStage(stage.id)
        const stageIdx   = STAGE_ORDER.indexOf(stage.id)
        const prevStage  = stageIdx > 0 ? STAGE_ORDER[stageIdx - 1] : null
        const nextStage  = stageIdx < STAGE_ORDER.length - 1 ? STAGE_ORDER[stageIdx + 1] : null

        return (
          <div key={stage.id} className="flex flex-col gap-3" style={{ width: 260, flexShrink: 0 }}>
            {/* ── Column header with count badge ── */}
            <div
              className="rounded-2xl px-4 py-3 flex items-center justify-between"
              style={{ background: stage.headerBg }}
            >
              <div className="flex items-center gap-2">
                <span>{stage.icon}</span>
                <span className="font-bold text-sm" style={{ color: stage.color }}>
                  {stage.label}
                </span>
              </div>
              <span
                className="text-xs font-black px-2.5 py-0.5 rounded-full"
                style={{ background: stage.color, color: '#fff' }}
              >
                {stageLeads.length}
              </span>
            </div>

            {/* ── Cards ── */}
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
                    onNoteUpdated={updateNote2}
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

// ── Lead Card ──────────────────────────────────────────────────────────────────

interface LeadCardProps {
  lead: Lead
  stageBg: string
  stageColor: string
  prevStage: Stage | null
  nextStage: Stage | null
  isUpdating: boolean
  onMove: (leadId: string, stage: Stage) => void
  onNoteUpdated: (leadId: string, note2: string) => void
}

function LeadCard({
  lead,
  stageBg,
  stageColor,
  prevStage,
  nextStage,
  isUpdating,
  onMove,
  onNoteUpdated,
}: LeadCardProps) {
  const [editingNote, setEditingNote] = useState(false)
  const [noteValue, setNoteValue]     = useState(lead.note2 ?? '')
  const [savingNote, setSavingNote]   = useState(false)

  const handleSaveNote = async () => {
    setSavingNote(true)
    try {
      await fetch(`/api/admin/contacts/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note2: noteValue }),
      })
      onNoteUpdated(lead.id, noteValue)
      setEditingNote(false)
    } finally {
      setSavingNote(false)
    }
  }

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
      <div className="flex items-start justify-between gap-1">
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 text-sm truncate">{lead.name || 'Không tên'}</p>
          <p className="text-xs text-gray-500 mt-0.5 font-mono">{lead.phone}</p>
        </div>
      </div>

      {/* Date */}
      <p className="text-xs text-gray-300 mt-1.5">
        {new Date(lead.createdAt).toLocaleDateString('vi-VN')}
      </p>

      {/* Customer note snippet */}
      {lead.note && (
        <div
          className="mt-2 text-xs rounded-xl px-3 py-2 leading-relaxed"
          style={{ background: stageBg, color: stageColor }}
        >
          {lead.note.length > 80 ? lead.note.slice(0, 80) + '…' : lead.note}
        </div>
      )}

      {/* Quick edit note inline */}
      {editingNote ? (
        <div className="mt-2 space-y-1.5">
          <textarea
            value={noteValue}
            onChange={(e) => setNoteValue(e.target.value)}
            placeholder="Ghi chú nội bộ..."
            rows={2}
            autoFocus
            className="w-full border border-purple-300 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
          />
          <div className="flex gap-1.5">
            <button
              onClick={handleSaveNote}
              disabled={savingNote}
              className="flex-1 text-xs font-bold py-1.5 rounded-lg transition-colors disabled:opacity-40"
              style={{ background: '#7e22ce', color: '#fff' }}
            >
              {savingNote ? '...' : 'Lưu'}
            </button>
            <button
              onClick={() => { setEditingNote(false); setNoteValue(lead.note2 ?? '') }}
              className="px-2 text-xs rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
            >
              Huỷ
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => { setEditingNote(true); setNoteValue(lead.note2 ?? '') }}
          className="mt-2 w-full text-left text-xs rounded-xl px-3 py-1.5 border border-dashed transition-colors hover:border-purple-300 hover:bg-purple-50"
          style={{ borderColor: '#d8b4fe55', color: lead.note2 ? '#7e22ce' : '#d1d5db' }}
        >
          {lead.note2
            ? (lead.note2.length > 50 ? lead.note2.slice(0, 50) + '…' : lead.note2)
            : '+ Ghi chú nội bộ'}
        </button>
      )}

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

      {/* View detail link */}
      <Link
        href={`/admin/crm/leads/${lead.id}`}
        className="mt-2 flex items-center justify-center gap-1 w-full text-xs font-semibold py-1.5 rounded-xl border transition-colors hover:border-orange-300 hover:text-orange-700 hover:bg-orange-50"
        style={{ borderColor: '#e5e7eb', color: '#6b7280' }}
      >
        👁 Xem chi tiết
      </Link>
    </div>
  )
}

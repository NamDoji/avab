'use client'

import { useState, useId } from 'react'
import {
  Plus, Trash2, GripVertical, ChevronUp, ChevronDown,
  Save, RefreshCw, AlertCircle, CheckCircle, X,
} from 'lucide-react'

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface WorkflowStep {
  id:            string
  name:          string
  type:          StepType
  assigneeRole?: string
  description?:  string
  nextSteps?:    string[]
}

type StepType = 'approve' | 'review' | 'sign' | 'notify' | 'form_input' | 'auto'

interface WorkflowBuilderProps {
  /** Existing workflow definition id (for edit mode) */
  workflowId?:   string
  /** Pre-populated data for edit mode */
  initialName?:  string
  initialDesc?:  string
  initialModule?: string
  initialSteps?: WorkflowStep[]
  isTemplate?:   boolean
  onSaved?:      (id: string) => void
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const STEP_TYPES: { value: StepType; label: string; icon: string; color: string }[] = [
  { value: 'approve',    label: 'Phê duyệt',   icon: '✅', color: 'bg-green-100 text-green-700'   },
  { value: 'review',     label: 'Xem xét',      icon: '🔍', color: 'bg-blue-100 text-blue-700'     },
  { value: 'sign',       label: 'Ký số',        icon: '✍️', color: 'bg-purple-100 text-purple-700' },
  { value: 'notify',     label: 'Thông báo',    icon: '🔔', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'form_input', label: 'Nhập liệu',    icon: '📝', color: 'bg-orange-100 text-orange-700' },
  { value: 'auto',       label: 'Tự động',      icon: '⚙️', color: 'bg-gray-100 text-gray-700'    },
]

const MODULES = [
  { value: 'content',    label: '📚 Nội dung'  },
  { value: 'enrollment', label: '🎓 Tuyển sinh' },
  { value: 'finance',    label: '💰 Tài chính'  },
  { value: 'hr',         label: '👥 Nhân sự'    },
  { value: 'general',    label: '⚙️ Chung'      },
]

const ROLES = [
  { value: 'ADMIN',     label: 'Admin'        },
  { value: 'MANAGER',   label: 'Quản lý'      },
  { value: 'TEACHER',   label: 'Giáo viên'    },
  { value: 'ACCOUNTANT',label: 'Kế toán'      },
  { value: 'HR',        label: 'Nhân sự'      },
  { value: 'system',    label: 'Hệ thống'     },
]

// ─── StepCard ─────────────────────────────────────────────────────────────────

function StepCard({
  step,
  index,
  total,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  step:       WorkflowStep
  index:      number
  total:      number
  onUpdate:   (id: string, patch: Partial<WorkflowStep>) => void
  onDelete:   (id: string) => void
  onMoveUp:   (index: number) => void
  onMoveDown: (index: number) => void
}) {
  const [expanded, setExpanded] = useState(index === 0)
  const typeCfg = STEP_TYPES.find(t => t.value === step.type) ?? STEP_TYPES[0]

  return (
    <div className={`bg-white rounded-2xl border shadow-sm transition-all ${
      expanded ? 'border-indigo-200' : 'border-gray-100'
    }`}>
      {/* Header */}
      <div
        className="flex items-center gap-3 p-3 cursor-pointer select-none"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="flex-shrink-0 w-5 text-gray-300 cursor-grab">
          <GripVertical size={16} />
        </div>

        <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-black flex items-center justify-center flex-shrink-0">
          {index + 1}
        </span>

        <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${typeCfg.color}`}>
          {typeCfg.icon} {typeCfg.label}
        </span>

        <span className="flex-1 text-sm font-semibold text-gray-800 truncate">
          {step.name || <span className="text-gray-400">Chưa đặt tên</span>}
        </span>

        <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => onMoveUp(index)}
            disabled={index === 0}
            className="p-1 rounded text-gray-400 hover:text-gray-700 disabled:opacity-30 transition"
            title="Lên"
          >
            <ChevronUp size={14} />
          </button>
          <button
            onClick={() => onMoveDown(index)}
            disabled={index === total - 1}
            className="p-1 rounded text-gray-400 hover:text-gray-700 disabled:opacity-30 transition"
            title="Xuống"
          >
            <ChevronDown size={14} />
          </button>
          <button
            onClick={() => onDelete(step.id)}
            className="p-1 rounded text-gray-400 hover:text-red-600 transition"
            title="Xoá bước"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Expanded fields */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-50 pt-3" onClick={e => e.stopPropagation()}>
          {/* Name + type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Tên bước *</label>
              <input
                type="text"
                value={step.name}
                onChange={e => onUpdate(step.id, { name: e.target.value })}
                placeholder="VD: Phê duyệt giám đốc"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Loại bước</label>
              <select
                value={step.type}
                onChange={e => onUpdate(step.id, { type: e.target.value as StepType })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
              >
                {STEP_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Assignee role + description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Vai trò xử lý</label>
              <select
                value={step.assigneeRole ?? ''}
                onChange={e => onUpdate(step.id, { assigneeRole: e.target.value || undefined })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
              >
                <option value="">Không chỉ định</option>
                {ROLES.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Mô tả bước</label>
              <input
                type="text"
                value={step.description ?? ''}
                onChange={e => onUpdate(step.id, { description: e.target.value || undefined })}
                placeholder="Mô tả ngắn..."
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function WorkflowTemplateBuilder({
  workflowId,
  initialName   = '',
  initialDesc   = '',
  initialModule = 'general',
  initialSteps  = [],
  isTemplate    = false,
  onSaved,
}: WorkflowBuilderProps) {
  const uid = useId()

  const [name,   setName]   = useState(initialName)
  const [desc,   setDesc]   = useState(initialDesc)
  const [module, setModule] = useState(initialModule)
  const [steps,  setSteps]  = useState<WorkflowStep[]>(initialSteps)

  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState('')

  // ── Step management ───────────────────────────────────────────────────────

  function addStep() {
    const newStep: WorkflowStep = {
      id:   `step-${Date.now()}`,
      name: '',
      type: 'approve',
    }
    setSteps(prev => [...prev, newStep])
  }

  function updateStep(id: string, patch: Partial<WorkflowStep>) {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s))
  }

  function deleteStep(id: string) {
    setSteps(prev => prev.filter(s => s.id !== id))
  }

  function moveStep(index: number, direction: 'up' | 'down') {
    setSteps(prev => {
      const next = [...prev]
      const swapIdx = direction === 'up' ? index - 1 : index + 1
      if (swapIdx < 0 || swapIdx >= next.length) return prev;
      [next[index], next[swapIdx]] = [next[swapIdx], next[index]]
      return next
    })
  }

  // ── Save ──────────────────────────────────────────────────────────────────

  async function handleSave() {
    if (!name.trim()) { setError('Tên workflow không được để trống'); return }
    if (steps.length === 0) { setError('Workflow cần ít nhất 1 bước'); return }
    if (steps.some(s => !s.name.trim())) { setError('Vui lòng đặt tên cho tất cả các bước'); return }

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const payload = {
        name: name.trim(),
        description: desc.trim() || null,
        module,
        isTemplate,
        steps: steps.map(s => ({
          id:           s.id,
          name:         s.name.trim(),
          type:         s.type,
          assigneeRole: s.assigneeRole ?? null,
          description:  s.description ?? null,
          nextSteps:    s.nextSteps ?? [],
        })),
      }

      const res = await fetch(
        workflowId
          ? `/api/admin/workflow/${workflowId}`
          : '/api/admin/workflow',
        {
          method:  workflowId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(payload),
        }
      )
      const data = await res.json() as { success: boolean; data?: { id: string }; error?: string }
      if (!data.success) throw new Error(data.error ?? 'Lỗi lưu workflow')

      setSuccess(workflowId ? '✅ Đã cập nhật workflow' : '✅ Đã tạo workflow mới')
      if (data.data?.id && onSaved) onSaved(data.data.id)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Lỗi không xác định')
    } finally {
      setSaving(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-5 py-4 border-b border-gray-100">
        <h3 className="font-black text-gray-900 text-sm">
          {workflowId ? '✏️ Chỉnh sửa Workflow' : '➕ Tạo Workflow mới'}
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">
          Định nghĩa các bước xử lý theo thứ tự
        </p>
      </div>

      <div className="p-5 space-y-5">
        {/* Basic info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-gray-500 block mb-1">Tên Workflow *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="VD: Quy trình duyệt giáo án"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">Module</label>
            <select
              value={module}
              onChange={e => setModule(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
            >
              {MODULES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1">Mô tả (tuỳ chọn)</label>
          <input
            type="text"
            value={desc}
            onChange={e => setDesc(e.target.value)}
            placeholder="Mô tả ngắn về workflow này..."
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>

        {/* Steps */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">
              ⚙️ Các bước ({steps.length})
            </label>
            <button
              onClick={addStep}
              className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition"
            >
              <Plus size={13} />
              Thêm bước
            </button>
          </div>

          {steps.length === 0 ? (
            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center">
              <p className="text-gray-400 text-sm mb-3">Chưa có bước nào</p>
              <button
                onClick={addStep}
                className="flex items-center gap-1.5 text-sm font-bold text-indigo-600 mx-auto hover:text-indigo-800"
              >
                <Plus size={15} /> Thêm bước đầu tiên
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {steps.map((step, idx) => (
                <StepCard
                  key={step.id}
                  step={step}
                  index={idx}
                  total={steps.length}
                  onUpdate={updateStep}
                  onDelete={deleteStep}
                  onMoveUp={i => moveStep(i, 'up')}
                  onMoveDown={i => moveStep(i, 'down')}
                />
              ))}

              {/* Visual flow preview */}
              <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Luồng xử lý</p>
                <div className="flex items-center gap-1 flex-wrap">
                  {steps.map((step, idx) => {
                    const cfg = STEP_TYPES.find(t => t.value === step.type)
                    return (
                      <div key={step.id} className="flex items-center gap-1">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg?.color ?? 'bg-gray-100 text-gray-600'}`}>
                          {cfg?.icon} {step.name || `Bước ${idx + 1}`}
                        </span>
                        {idx < steps.length - 1 && (
                          <span className="text-gray-300 text-xs">→</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Messages */}
        {error && (
          <div className="flex items-start gap-2 bg-red-50 text-red-700 rounded-xl p-3 text-sm">
            <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
            {error}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 bg-green-50 text-green-700 rounded-xl p-3 text-sm font-semibold">
            <CheckCircle size={14} />
            {success}
          </div>
        )}

        {/* Save button */}
        <div className="flex justify-end gap-3 pt-1">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition disabled:opacity-60 min-h-[44px]"
          >
            {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? 'Đang lưu...' : workflowId ? 'Cập nhật Workflow' : 'Tạo Workflow'}
          </button>
        </div>
      </div>
    </div>
  )
}

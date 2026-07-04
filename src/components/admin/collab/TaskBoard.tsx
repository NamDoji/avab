'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

// ─── Types ───────────────────────────────────────────────────────────────────
export type Priority = 'high' | 'medium' | 'low'
export type ColKey = 'todo' | 'in_progress' | 'done' | 'cancelled'

export interface TaskCard {
  id: string
  title: string
  workflowName: string
  assigneeId: string | null
  assigneeName: string | null
  dueAt: string | null        // ISO string
  status: string              // raw WorkflowInstance status
  priority: Priority | null   // stored in data.priority
  entityType: string | null
}

// ─── Config ──────────────────────────────────────────────────────────────────
const COL_CONFIG: Record<ColKey, { label: string; icon: string; color: string; bg: string; statusValues: string[] }> = {
  todo:        { label: 'Todo',        icon: '📋', color: '#d97706', bg: '#fef9ee', statusValues: ['on_hold'] },
  in_progress: { label: 'In Progress', icon: '🔄', color: '#2563eb', bg: '#eff6ff', statusValues: ['running'] },
  done:        { label: 'Done',        icon: '✅', color: '#059669', bg: '#f0fdf4', statusValues: ['completed'] },
  cancelled:   { label: 'Cancelled',   icon: '❌', color: '#6b7280', bg: '#f9fafb', statusValues: ['rejected', 'cancelled'] },
}

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bg: string; dot: string }> = {
  high:   { label: 'Cao',    color: '#dc2626', bg: '#fee2e2', dot: '🔴' },
  medium: { label: 'TB',     color: '#d97706', bg: '#fef3c7', dot: '🟡' },
  low:    { label: 'Thấp',   color: '#059669', bg: '#dcfce7', dot: '🟢' },
}

// Map WorkflowInstance status → ColKey
function statusToCol(status: string): ColKey {
  if (status === 'on_hold') return 'todo'
  if (status === 'running') return 'in_progress'
  if (status === 'completed') return 'done'
  return 'cancelled'
}

// ColKey → WorkflowInstance status (for POST)
function colToStatus(col: ColKey): string {
  if (col === 'todo') return 'on_hold'
  if (col === 'in_progress') return 'running'
  if (col === 'done') return 'completed'
  return 'cancelled'
}

// Initials from name
function initials(name: string | null): string {
  if (!name) return '?'
  return name
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

// ─── CreateTaskForm ───────────────────────────────────────────────────────────
interface CreateTaskFormProps {
  defaultCol: ColKey
  onClose: () => void
  onCreated: () => void
}

function CreateTaskForm({ defaultCol, onClose, onCreated }: CreateTaskFormProps) {
  const [title, setTitle] = useState('')
  const [assignee, setAssignee] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [col, setCol] = useState<ColKey>(defaultCol)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) { setError('Nhập tiêu đề task'); return }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/admin/collab/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          status: colToStatus(col),
          assignedTo: assignee.trim() || undefined,
          dueAt: dueDate || undefined,
          priority,
        }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        setError(json.error ?? 'Không thể tạo task')
      } else {
        onCreated()
        onClose()
      }
    } catch {
      setError('Lỗi kết nối')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-black text-gray-900 text-lg">➕ Tạo task mới</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Tiêu đề *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Review báo cáo tuần..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-teal-400 focus:outline-none text-sm"
              autoFocus
            />
          </div>

          {/* Column */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Trạng thái</label>
            <select
              value={col}
              onChange={(e) => setCol(e.target.value as ColKey)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-teal-400 focus:outline-none text-sm bg-white"
            >
              {(Object.keys(COL_CONFIG) as ColKey[]).map((c) => (
                <option key={c} value={c}>{COL_CONFIG[c].icon} {COL_CONFIG[c].label}</option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Độ ưu tiên</label>
            <div className="flex gap-2">
              {(Object.keys(PRIORITY_CONFIG) as Priority[]).map((p) => {
                const conf = PRIORITY_CONFIG[p]
                const active = priority === p
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className="flex-1 py-2 rounded-xl text-xs font-bold border-2 transition-all"
                    style={{
                      borderColor: active ? conf.color : '#e5e7eb',
                      backgroundColor: active ? conf.bg : 'transparent',
                      color: active ? conf.color : '#9ca3af',
                    }}
                  >
                    {conf.dot} {conf.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Assignee */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Giao cho (tên)</label>
            <input
              type="text"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              placeholder="Tên người thực hiện..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-teal-400 focus:outline-none text-sm"
            />
          </div>

          {/* Due date */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Hạn chót</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-teal-400 focus:outline-none text-sm"
            />
          </div>

          {error && (
            <p className="text-xs text-red-500 font-semibold bg-red-50 px-3 py-2 rounded-xl">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 transition"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #059669 0%, #0f766e 100%)' }}
            >
              {loading ? '⏳ Đang tạo...' : '✅ Tạo task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── TaskCard component ───────────────────────────────────────────────────────
function TaskCardItem({ task }: { task: TaskCard }) {
  const priority = task.priority
  const isOverdue = task.dueAt && new Date(task.dueAt) < new Date()

  return (
    <a
      href={`/admin/workflow/instances/${task.id}`}
      className="block bg-white rounded-2xl p-3.5 shadow-sm border border-gray-100 hover:shadow-md hover:border-teal-200 transition-all group"
    >
      {/* Title */}
      <p className="font-bold text-gray-900 text-sm leading-tight mb-1 line-clamp-2 group-hover:text-teal-700 transition-colors">
        {task.title}
      </p>
      <p className="text-[10px] text-gray-400 mb-2">{task.workflowName}</p>

      {/* Priority badge */}
      {priority && (
        <span
          className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mb-2"
          style={{ color: PRIORITY_CONFIG[priority].color, backgroundColor: PRIORITY_CONFIG[priority].bg }}
        >
          {PRIORITY_CONFIG[priority].dot} {PRIORITY_CONFIG[priority].label}
        </span>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-1.5">
        {/* Assignee avatar */}
        {task.assigneeName ? (
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black text-white shrink-0"
            style={{ background: '#0f766e' }}
            title={task.assigneeName}
          >
            {initials(task.assigneeName)}
          </div>
        ) : (
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black text-gray-300"
            style={{ background: '#f1f5f9' }}
          >
            ?
          </div>
        )}

        {/* Due date */}
        {task.dueAt && (
          <span className={`text-[10px] font-semibold ${isOverdue ? 'text-red-500' : 'text-gray-400'}`}>
            {isOverdue ? '⚠️' : '📅'}{' '}
            {new Date(task.dueAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
          </span>
        )}
      </div>
    </a>
  )
}

// ─── Main TaskBoard ───────────────────────────────────────────────────────────
interface TaskBoardProps {
  tasks: TaskCard[]
}

export default function TaskBoard({ tasks }: TaskBoardProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [showForm, setShowForm] = useState(false)
  const [defaultCol, setDefaultCol] = useState<ColKey>('todo')

  // Group tasks into columns
  const columns: Record<ColKey, TaskCard[]> = { todo: [], in_progress: [], done: [], cancelled: [] }
  for (const t of tasks) {
    const col = statusToCol(t.status)
    columns[col].push(t)
  }

  function openForm(col: ColKey = 'todo') {
    setDefaultCol(col)
    setShowForm(true)
  }

  function onCreated() {
    startTransition(() => { router.refresh() })
  }

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex gap-2 flex-wrap">
          {(Object.keys(COL_CONFIG) as ColKey[]).map((col) => {
            const conf = COL_CONFIG[col]
            return (
              <span
                key={col}
                className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border"
                style={{ color: conf.color, backgroundColor: conf.bg, borderColor: conf.color + '44' }}
              >
                {conf.icon} {conf.label}: {columns[col].length}
              </span>
            )
          })}
        </div>
        <button
          onClick={() => openForm('todo')}
          className="flex items-center gap-2 bg-teal-600 text-white rounded-2xl px-4 py-2.5 text-sm font-bold hover:bg-teal-700 transition-colors shadow-sm"
        >
          ➕ Tạo task
        </button>
      </div>

      {/* Kanban grid */}
      {tasks.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-16 text-center">
          <div className="text-5xl mb-3">✅</div>
          <h3 className="font-black text-gray-700 mb-1">Chưa có task nào</h3>
          <p className="text-gray-400 text-sm mb-4">Nhấn "+ Tạo task" để bắt đầu</p>
          <button
            onClick={() => openForm('todo')}
            className="inline-flex items-center gap-2 bg-teal-600 text-white rounded-2xl px-5 py-3 text-sm font-bold hover:bg-teal-700 transition-colors"
          >
            ➕ Tạo task đầu tiên
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {(Object.keys(COL_CONFIG) as ColKey[]).map((col) => {
            const conf = COL_CONFIG[col]
            const colTasks = columns[col]

            return (
              <div
                key={col}
                className="rounded-3xl border overflow-hidden flex flex-col"
                style={{ backgroundColor: conf.bg, borderColor: conf.color + '33' }}
              >
                {/* Column header */}
                <div
                  className="px-4 py-3 flex items-center gap-2 border-b"
                  style={{ borderColor: conf.color + '22' }}
                >
                  <span className="text-lg">{conf.icon}</span>
                  <span className="font-black text-sm" style={{ color: conf.color }}>{conf.label}</span>
                  <span
                    className="ml-auto text-xs font-black w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: conf.color }}
                  >
                    {colTasks.length}
                  </span>
                  {/* Add to this column */}
                  <button
                    onClick={() => openForm(col)}
                    className="w-6 h-6 rounded-full flex items-center justify-center text-sm hover:scale-110 transition-transform ml-1"
                    style={{ color: conf.color, backgroundColor: conf.color + '22' }}
                    title={`Thêm vào ${conf.label}`}
                  >
                    +
                  </button>
                </div>

                {/* Cards */}
                <div className="p-3 space-y-2 flex-1 min-h-[120px]">
                  {colTasks.length === 0 ? (
                    <p className="text-center text-xs text-gray-400 py-6">Trống</p>
                  ) : (
                    colTasks.map((t) => <TaskCardItem key={t.id} task={t} />)
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal form */}
      {showForm && (
        <CreateTaskForm
          defaultCol={defaultCol}
          onClose={() => setShowForm(false)}
          onCreated={onCreated}
        />
      )}
    </>
  )
}

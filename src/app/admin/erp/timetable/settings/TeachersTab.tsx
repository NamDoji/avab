'use client'

import { useState } from 'react'

interface TeacherSubject {
  id: string
  name: string | null
  subjects: string
}

interface TeachersTabProps {
  initialTeachers: TeacherSubject[]
}

const SUBJECT_OPTIONS = [
  { code: 'MATH', label: 'Toán' },
  { code: 'LIT', label: 'Ngữ văn' },
  { code: 'VIET', label: 'Tiếng Việt' },
  { code: 'ENGLISH', label: 'Tiếng Anh' },
  { code: 'PHYSICS', label: 'Vật lý' },
  { code: 'CHEMISTRY', label: 'Hóa học' },
  { code: 'BIOLOGY', label: 'Sinh học' },
  { code: 'HISTORY', label: 'Lịch sử' },
  { code: 'GEO', label: 'Địa lý' },
  { code: 'CIVIC', label: 'GDCD' },
  { code: 'PE', label: 'Thể dục' },
  { code: 'MUSIC', label: 'Âm nhạc' },
  { code: 'ART', label: 'Mỹ thuật' },
  { code: 'TECH', label: 'Công nghệ' },
  { code: 'IT', label: 'Tin học' },
  { code: 'SCIENCE', label: 'Khoa học' },
  { code: 'GENERAL', label: 'Giáo dục chung' },
]

export default function TeachersTab({ initialTeachers }: TeachersTabProps) {
  const [teachers, setTeachers] = useState<TeacherSubject[]>(initialTeachers)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editVal, setEditVal] = useState('')
  const [saving, setSaving] = useState<string | null>(null)

  const startEdit = (teacher: TeacherSubject) => {
    setEditingId(teacher.id)
    setEditVal(teacher.subjects)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditVal('')
  }

  const saveSubjects = async (id: string) => {
    setSaving(id)
    try {
      // Store in a simple approach: use TimetableRule with ruleType=teacher_subjects and scopeValue=teacherId
      await fetch('/api/admin/erp/timetable/settings/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ruleType: 'teacher_subjects',
          ruleScope: 'teacher',
          scopeValue: id,
          value: { subjects: editVal.split(',').map(s => s.trim()).filter(Boolean) },
          description: `GV ${teachers.find(t => t.id === id)?.name ?? id}: dạy ${editVal}`,
          isActive: true,
        }),
      })
      setTeachers(prev => prev.map(t => t.id === id ? { ...t, subjects: editVal } : t))
      setEditingId(null)
    } catch {
      // ignore — non-critical
    } finally {
      setSaving(null)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{
        background: '#eff6ff',
        borderRadius: 12,
        padding: '12px 16px',
        border: '1px solid #bfdbfe',
        fontSize: 13,
        color: '#1e40af',
      }}>
        💡 Cấu hình môn dạy giúp AI biết giáo viên nào có thể đảm nhận môn nào khi xếp TKB.
      </div>

      {/* Subject reference */}
      <div>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 8 }}>Mã môn tham khảo:</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {SUBJECT_OPTIONS.map(s => (
            <span
              key={s.code}
              style={{
                fontSize: 11,
                padding: '2px 8px',
                borderRadius: 12,
                background: '#f1f5f9',
                color: '#475569',
                fontWeight: 600,
              }}
            >
              {s.code}: {s.label}
            </span>
          ))}
        </div>
      </div>

      {/* Teachers list */}
      {teachers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 32, color: '#94a3b8', fontSize: 14 }}>
          Chưa có giáo viên nào. Thêm giáo viên trong phần Quản lý giáo viên.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {teachers.map(teacher => (
            <div
              key={teacher.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                background: '#fff',
                borderRadius: 12,
                border: '1px solid #e2e8f0',
              }}
            >
              <div style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 14,
                fontWeight: 800,
                flexShrink: 0,
              }}>
                {(teacher.name ?? 'GV').charAt(0)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>
                  {teacher.name ?? 'Giáo viên'}
                </div>
                {editingId === teacher.id ? (
                  <input
                    type="text"
                    value={editVal}
                    onChange={e => setEditVal(e.target.value)}
                    placeholder="VD: MATH,PHYSICS,SCIENCE (dấu phẩy)"
                    style={{
                      marginTop: 4,
                      border: '1px solid #6366f1',
                      borderRadius: 6,
                      padding: '4px 8px',
                      fontSize: 12,
                      outline: 'none',
                      width: '100%',
                    }}
                    autoFocus
                  />
                ) : (
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                    {teacher.subjects ? `Môn dạy: ${teacher.subjects}` : 'Chưa cấu hình môn dạy'}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                {editingId === teacher.id ? (
                  <>
                    <button
                      type="button"
                      onClick={() => saveSubjects(teacher.id)}
                      disabled={saving === teacher.id}
                      style={{
                        padding: '5px 12px',
                        borderRadius: 8,
                        border: 'none',
                        background: '#6366f1',
                        color: '#fff',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: saving === teacher.id ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {saving === teacher.id ? '...' : '💾 Lưu'}
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      style={{
                        padding: '5px 12px',
                        borderRadius: 8,
                        border: '1px solid #e2e8f0',
                        background: '#fff',
                        color: '#64748b',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Hủy
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => startEdit(teacher)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 8,
                      border: '1px solid #e2e8f0',
                      background: '#f8fafc',
                      color: '#64748b',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    ✏️ Sửa
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

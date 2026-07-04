'use client'

import { useRouter } from 'next/navigation'
import { ImportExcelButton, ImportEntityType } from '@/components/admin/ImportExcelButton'

const ENTITY_CARDS: { type: ImportEntityType; icon: string; label: string; desc: string; color: string }[] = [
  { type: 'students', icon: '👦', label: 'Học sinh', desc: 'Tên, SĐT, email, lớp học', color: '#0f766e' },
  { type: 'teachers', icon: '👨‍🏫', label: 'Giáo viên', desc: 'Tên, SĐT, cơ sở, chuyên môn', color: '#0369a1' },
  { type: 'leads',    icon: '📊', label: 'Khách hàng', desc: 'Tên PH/HS, SĐT, ghi chú', color: '#c2410c' },
  { type: 'staff',   icon: '🛡️', label: 'Nhân viên', desc: 'Tên, SĐT, chức vụ, cơ sở', color: '#7c3aed' },
  { type: 'classes', icon: '🏫', label: 'Lớp học', desc: 'Tên lớp, mã lớp, cơ sở, học phí', color: '#0891b2' },
]

export function DataMigrationImportSection() {
  const router = useRouter()

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-black text-gray-800 text-lg mb-1">🚀 Import nhanh theo loại dữ liệu</h2>
        <p className="text-sm text-gray-500">
          Tải template → Điền dữ liệu → Import trực tiếp. Không cần qua AI mapping.
        </p>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ENTITY_CARDS.map((card) => (
          <div
            key={card.type}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
          >
            {/* Card header */}
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background: `${card.color}15` }}
              >
                {card.icon}
              </div>
              <div>
                <p className="font-black text-gray-800 text-sm">{card.label}</p>
                <p className="text-xs text-gray-400">{card.desc}</p>
              </div>
            </div>

            {/* Buttons — use a dark-colored variant adapted for card context */}
            <div
              style={{
                display: 'flex',
                gap: 8,
                padding: '10px 12px',
                borderRadius: 10,
                background: card.color,
              }}
            >
              <ImportExcelButton
                entityType={card.type}
                label={`Import ${card.label.toLowerCase()}`}
                variant="dark"
                onSuccess={() => router.refresh()}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Legacy advanced import */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-xl flex-shrink-0">
          🤖
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-800 text-sm">Import nâng cao với AI Mapping</p>
          <p className="text-xs text-gray-400">
            Upload file bất kỳ — AI tự động phân tích cột, map dữ liệu thông minh
          </p>
        </div>
        <a
          href="/admin/data-migration/new"
          className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white hover:opacity-90 transition-opacity"
          style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
        >
          🚀 Mở →
        </a>
      </div>
    </div>
  )
}

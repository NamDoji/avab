import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import LeadEditForm from './LeadEditForm'

// ── Metadata ──────────────────────────────────────────────────────────────────
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const lead = await prisma.registration.findUnique({
    where: { id },
    select: { name: true, phone: true },
  })
  return { title: lead ? `${lead.name ?? lead.phone} — CRM Lead` : 'Lead Detail — CRM' }
}

// ── Status config ──────────────────────────────────────────────────────────────
const STATUS_MAP: Record<string, { label: string; bg: string; color: string; icon: string }> = {
  NEW:      { label: 'Mới',             bg: '#dbeafe', color: '#1d4ed8', icon: '🆕' },
  FOLLOWUP: { label: 'Đang tư vấn',    bg: '#fef9c3', color: '#854d0e', icon: '💬' },
  WON:      { label: 'Đã đăng ký',     bg: '#dcfce7', color: '#166534', icon: '✅' },
  LOST:     { label: 'Không đăng ký',  bg: '#fee2e2', color: '#991b1b', icon: '❌' },
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session || (session.user as { role?: string })?.role !== 'ADMIN') redirect('/dang-nhap')

  const { id } = await params
  const lead = await prisma.registration.findUnique({ where: { id } })
  if (!lead) notFound()

  const st = STATUS_MAP[lead.status] ?? STATUS_MAP['NEW']

  // Build static timeline from available data
  const timeline: { date: Date; label: string; icon: string; color: string; note?: string }[] = [
    {
      date:  lead.createdAt,
      label: 'Lead được tạo trong hệ thống',
      icon:  '🆕',
      color: '#1d4ed8',
      note:  lead.note ?? undefined,
    },
  ]
  if (lead.status !== 'NEW') {
    timeline.push({
      date:  lead.updatedAt,
      label: `Trạng thái cập nhật → ${st.label}`,
      icon:  st.icon,
      color: st.color,
    })
  }
  if (lead.note2) {
    timeline.push({
      date:  lead.updatedAt,
      label: 'Ghi chú nội bộ được thêm',
      icon:  '📝',
      color: '#7e22ce',
      note:  lead.note2,
    })
  }
  // Sort newest first
  timeline.sort((a, b) => b.date.getTime() - a.date.getTime())

  const typeLabel = lead.type === 'ENROLLMENT' ? 'Đăng ký học' : 'Liên hệ / Hỏi thông tin'

  return (
    <div className="min-h-screen pt-20 bg-gray-50">

      {/* ── Header gradient ─────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden text-white py-8"
        style={{ background: 'linear-gradient(135deg, #7c2d12 0%, #c2410c 100%)' }}
      >
        <div
          className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'rgba(255,255,255,0.06)', transform: 'translate(30%, -50%)' }}
        />
        <div className="container-custom relative">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-orange-200 text-sm mb-3">
            <Link href="/admin/crm" className="hover:text-white transition-colors">CRM</Link>
            <span>/</span>
            <Link href="/admin/crm/pipeline" className="hover:text-white transition-colors">Pipeline</Link>
            <span>/</span>
            <span className="text-white/80 truncate max-w-[140px]">{lead.name ?? lead.phone}</span>
          </div>

          {/* Lead header */}
          <div className="flex flex-col sm:flex-row sm:items-start gap-3">
            <div className="flex-1">
              <h1 className="text-2xl font-black leading-tight">
                {lead.name ?? 'Khách hàng không tên'}
              </h1>
              <p className="text-orange-200 text-sm mt-1 font-mono">{lead.phone}</p>
            </div>
            <span
              className="self-start flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold"
              style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}
            >
              {st.icon} {st.label}
            </span>
          </div>
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────────── */}
      <div className="container-custom py-6">
        <div className="grid lg:grid-cols-3 gap-6">

          {/* ── Left: Info + Timeline + Edit ──────────────────────── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Info card */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-black text-gray-800 mb-4">📋 Thông tin chi tiết</h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: 'SĐT',         value: lead.phone,     href: `tel:${lead.phone}` },
                  { label: 'Email',        value: lead.email,     href: lead.email ? `mailto:${lead.email}` : undefined },
                  { label: 'Loại',         value: typeLabel },
                  { label: 'Trạng thái',   value: `${st.icon} ${st.label}` },
                  { label: 'Ngày tạo',     value: lead.createdAt.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) },
                  { label: 'Cập nhật',     value: lead.updatedAt.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) },
                ].map(({ label, value, href }) => (
                  <div key={label} className="rounded-xl px-4 py-3" style={{ background: '#f8fafc' }}>
                    <dt className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">{label}</dt>
                    <dd className="text-sm font-semibold text-gray-800">
                      {value ? (
                        href ? (
                          <a href={href} className="text-orange-700 hover:underline">{value}</a>
                        ) : (
                          value
                        )
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
              {lead.note && (
                <div className="mt-3 rounded-xl px-4 py-3" style={{ background: '#fff7ed' }}>
                  <p className="text-xs font-bold text-orange-700 mb-1">📌 Ghi chú khách hàng</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{lead.note}</p>
                </div>
              )}
              {lead.note2 && (
                <div className="mt-2 rounded-xl px-4 py-3" style={{ background: '#f5f3ff' }}>
                  <p className="text-xs font-bold text-purple-700 mb-1">🔒 Ghi chú nội bộ</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{lead.note2}</p>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-black text-gray-800 mb-4">⏱ Timeline hoạt động</h3>
              <ol className="relative border-l-2 border-gray-100 ml-2 space-y-5">
                {timeline.map((item, i) => (
                  <li key={i} className="ml-5">
                    <span
                      className="absolute -left-3 flex items-center justify-center w-6 h-6 rounded-full text-xs shadow-sm"
                      style={{ background: item.color + '22', border: `2px solid ${item.color}` }}
                    >
                      {item.icon}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-gray-800">{item.label}</p>
                      <time className="text-xs text-gray-400">
                        {item.date.toLocaleString('vi-VN', {
                          day: '2-digit', month: '2-digit', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </time>
                      {item.note && (
                        <p
                          className="mt-1.5 text-xs rounded-xl px-3 py-2 leading-relaxed"
                          style={{ background: item.color + '11', color: item.color }}
                        >
                          {item.note}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Edit Form (client) */}
            <LeadEditForm
              id={lead.id}
              initialStatus={lead.status}
              initialNote={lead.note}
              initialNote2={lead.note2}
            />

          </div>

          {/* ── Right: Actions ────────────────────────────────────── */}
          <div className="space-y-4">

            {/* Contact actions */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-black text-gray-800 mb-3">🎯 Hành động</h3>
              <div className="space-y-2">
                {lead.phone && (
                  <a
                    href={`tel:${lead.phone}`}
                    className="flex items-center gap-2.5 w-full px-4 py-2.5 rounded-xl text-sm font-bold transition-colors"
                    style={{ background: '#dcfce7', color: '#166534' }}
                  >
                    📞 Gọi điện · {lead.phone}
                  </a>
                )}
                {lead.email && (
                  <a
                    href={`mailto:${lead.email}`}
                    className="flex items-center gap-2.5 w-full px-4 py-2.5 rounded-xl text-sm font-bold transition-colors"
                    style={{ background: '#dbeafe', color: '#1d4ed8' }}
                  >
                    ✉️ Gửi email · {lead.email}
                  </a>
                )}
                <Link
                  href={`/admin/enrollments/new?leadId=${lead.id}&phone=${encodeURIComponent(lead.phone)}&name=${encodeURIComponent(lead.name ?? '')}`}
                  className="flex items-center gap-2.5 w-full px-4 py-2.5 rounded-xl text-sm font-bold transition-colors"
                  style={{ background: '#fef9c3', color: '#854d0e' }}
                >
                  📚 Tạo Enrollment
                </Link>
              </div>
            </div>

            {/* Stage quick-change */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-black text-gray-800 mb-3">🔄 Chuyển giai đoạn</h3>
              <div className="space-y-2">
                {Object.entries(STATUS_MAP).map(([key, cfg]) => (
                  key !== lead.status ? (
                    <div key={key} className="text-xs font-semibold text-gray-400 text-center py-1">
                      <span
                        className="inline-block px-3 py-1.5 rounded-xl border text-xs font-bold cursor-default"
                        style={{ borderColor: cfg.color + '44', color: cfg.color }}
                      >
                        → {cfg.icon} {cfg.label}
                      </span>
                      <p className="text-[10px] text-gray-300 mt-0.5">Dùng form bên trái để chuyển</p>
                    </div>
                  ) : (
                    <div key={key}>
                      <span
                        className="flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-xl text-xs font-black"
                        style={{ background: cfg.bg, color: cfg.color }}
                      >
                        {cfg.icon} Giai đoạn hiện tại: {cfg.label}
                      </span>
                    </div>
                  )
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex gap-2">
              <Link
                href="/admin/crm"
                className="flex-1 text-center py-2.5 rounded-xl text-xs font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                ← Danh sách
              </Link>
              <Link
                href="/admin/crm/pipeline"
                className="flex-1 text-center py-2.5 rounded-xl text-xs font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                📋 Pipeline
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

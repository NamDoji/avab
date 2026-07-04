

import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import CampaignCreateClient from './CampaignCreateClient'

export const metadata = { title: 'CRM Campaigns — AvaB EOS' }

// ── Types ─────────────────────────────────────────────────────────────────────

interface SourceStat {
  source: string
  leads: number
  followup: number
  won: number
  lost: number
  convRate: number
}

// ── Configs ────────────────────────────────────────────────────────────────────

const SOURCE_CONFIG: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  website:  { label: 'Website',   icon: '🌐', color: '#1d4ed8', bg: '#dbeafe' },
  zalo:     { label: 'Zalo',      icon: '💚', color: '#166534', bg: '#dcfce7' },
  facebook: { label: 'Facebook',  icon: '📘', color: '#1877f2', bg: '#eff6ff' },
  referral: { label: 'Giới thiệu', icon: '🤝', color: '#7c3aed', bg: '#fae8ff' },
  tiktok:   { label: 'TikTok',    icon: '🎵', color: '#111827', bg: '#f3f4f6' },
  other:    { label: 'Khác',       icon: '📋', color: '#6b7280', bg: '#f9fafb' },
}

const CHANNEL_CONFIG: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  EMAIL:  { label: 'Email',        icon: '📧', color: '#1d4ed8', bg: '#dbeafe' },
  SMS:    { label: 'SMS',          icon: '💬', color: '#854d0e', bg: '#fef9c3' },
  ZALO:   { label: 'Zalo OA',      icon: '💚', color: '#166534', bg: '#dcfce7' },
  SOCIAL: { label: 'Social Media', icon: '📱', color: '#7e22ce', bg: '#fae8ff' },
}

function pct(n: number, total: number) {
  return total === 0 ? 0 : Math.round((n / total) * 100)
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default async function CampaignsPage() {
  const session = await auth()
  if (!session || !['ADMIN','SUPER_ADMIN'].includes((session.user as { role?: string })?.role ?? '')) redirect('/dang-nhap')

  // ── Real lead data from Registration table ─────────────────────────────────

  // Group by note field used as source channel (website / zalo / facebook / referral)
  // Registration has no dedicated source field — we derive from `type` and `note` heuristics,
  // or use the note2 (admin note) as channel tag.
  const allRegs = await prisma.registration.findMany({
    select: { status: true, note: true, note2: true, type: true },
    orderBy: { createdAt: 'desc' },
    take: 1000,
  })

  // Derive source from note / note2 content
  function deriveSource(reg: { note?: string | null; note2?: string | null; type: string }): string {
    const combined = `${reg.note ?? ''} ${reg.note2 ?? ''}`.toLowerCase()
    if (combined.includes('zalo'))    return 'zalo'
    if (combined.includes('facebook') || combined.includes('fb')) return 'facebook'
    if (combined.includes('tiktok'))  return 'tiktok'
    if (combined.includes('referral') || combined.includes('giới thiệu')) return 'referral'
    if (combined.includes('website') || combined.includes('web')) return 'website'
    return 'other'
  }

  // Aggregate by source × status
  const sourceMap: Record<string, { leads: number; followup: number; won: number; lost: number }> = {}
  for (const reg of allRegs) {
    const src = deriveSource(reg)
    if (!sourceMap[src]) sourceMap[src] = { leads: 0, followup: 0, won: 0, lost: 0 }
    sourceMap[src].leads++
    if (reg.status === 'FOLLOWUP') sourceMap[src].followup++
    if (reg.status === 'WON')      sourceMap[src].won++
    if (reg.status === 'LOST')     sourceMap[src].lost++
  }

  const sourceStat: SourceStat[] = Object.entries(sourceMap)
    .map(([source, d]) => ({
      source,
      leads: d.leads,
      followup: d.followup,
      won: d.won,
      lost: d.lost,
      convRate: pct(d.won, d.leads),
    }))
    .sort((a, b) => b.leads - a.leads)

  // Summary KPIs
  const totalLeads     = allRegs.length
  const totalWon       = allRegs.filter(r => r.status === 'WON').length
  const totalFollowup  = allRegs.filter(r => r.status === 'FOLLOWUP').length
  const totalNew       = allRegs.filter(r => r.status === 'NEW').length
  const overallConv    = pct(totalWon, totalLeads)
  const maxLeads       = Math.max(...sourceStat.map(s => s.leads), 1)

  return (
    <div className="min-h-screen pt-14 bg-gray-50">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden text-white py-10"
        style={{ background: 'linear-gradient(135deg, #b45309 0%, #dc2626 100%)' }}
      >
        <div
          className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: 'rgba(255,255,255,0.06)', transform: 'translate(30%, -50%)' }}
        />
        <div className="container-custom relative">
          <div className="flex items-center gap-2 text-orange-200 text-sm mb-2">
            <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
            <span>/</span>
            <Link href="/admin/crm" className="hover:text-white transition-colors">CRM</Link>
            <span>/</span>
            <span>Campaigns</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black mb-1">📣 Campaigns & Lead Sources</h1>
              <p className="text-orange-200 text-sm">
                Theo dõi nguồn lead · Funnel chuyển đổi · Tạo campaign mới
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/admin/analytics/report?period=month"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold"
                style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}
              >
                📊 Báo cáo PDF
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-6 space-y-6">

        {/* ── Funnel KPIs ──────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { label: 'Tổng leads',       value: totalLeads,    icon: '📋', color: '#7c3aed', bg: '#f5f3ff' },
            { label: 'Mới',              value: totalNew,      icon: '✨', color: '#2563eb', bg: '#eff6ff' },
            { label: 'Follow-up',        value: totalFollowup, icon: '📞', color: '#d97706', bg: '#fffbeb' },
            { label: 'Đã đăng ký (Won)', value: totalWon,      icon: '✅', color: '#16a34a', bg: '#f0fdf4' },
            { label: 'Tỷ lệ chuyển đổi',value: `${overallConv}%`, icon: '📈', color: '#dc2626', bg: '#fef2f2' },
          ].map((s, i) => (
            <div
              key={i}
              className="rounded-2xl p-4 shadow-sm"
              style={{ background: s.bg, border: `1px solid ${s.color}22` }}
            >
              <p className="text-xs font-semibold mb-1" style={{ color: s.color }}>{s.icon} {s.label}</p>
              <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* ── Conversion Funnel ─────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="text-sm font-black text-gray-800 mb-4">🔽 Conversion Funnel (tổng hợp)</h2>
          <div className="flex flex-col gap-2 max-w-lg">
            {[
              { label: 'Leads vào', count: totalLeads,    color: '#7c3aed', pct: 100 },
              { label: 'Follow-up', count: totalFollowup, color: '#d97706', pct: pct(totalFollowup, totalLeads) },
              { label: 'Đăng ký',   count: totalWon,      color: '#16a34a', pct: pct(totalWon, totalLeads) },
            ].map(row => (
              <div key={row.label} className="flex items-center gap-3">
                <span className="text-xs font-semibold text-gray-500 w-20 shrink-0">{row.label}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-5 relative overflow-hidden">
                  <div
                    className="h-full rounded-full flex items-center justify-end pr-2"
                    style={{ width: `${row.pct}%`, background: row.color, transition: 'width 0.4s' }}
                  >
                    <span className="text-[10px] font-black text-white">{row.pct}%</span>
                  </div>
                </div>
                <span className="text-xs font-black w-10 text-right" style={{ color: row.color }}>{row.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Lead Sources Table ─────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-black text-gray-800">📡 Leads theo kênh (từ Registration)</h2>
            <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full font-semibold">
              {totalLeads} leads tổng
            </span>
          </div>

          {sourceStat.length === 0 ? (
            <div className="p-10 text-center text-gray-400">
              <p className="text-3xl mb-2">📋</p>
              <p>Chưa có dữ liệu registration</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {sourceStat.map(s => {
                const cfg = SOURCE_CONFIG[s.source] ?? SOURCE_CONFIG.other
                const barPct = Math.round((s.leads / maxLeads) * 100)
                return (
                  <div key={s.source} className="px-5 py-4 hover:bg-gray-50/60 transition-colors">
                    <div className="flex flex-wrap items-center gap-3">
                      {/* Source badge */}
                      <span
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black w-28 sm:w-32 shrink-0"
                        style={{ background: cfg.bg, color: cfg.color }}
                      >
                        {cfg.icon} {cfg.label}
                      </span>

                      {/* Bar */}
                      <div className="flex-1 min-w-[80px]">
                        <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${barPct}%`, background: cfg.color }}
                          />
                        </div>
                      </div>

                      {/* Metrics */}
                      <div className="flex gap-3 sm:gap-4 text-center text-xs shrink-0">
                        <div>
                          <p className="text-gray-400">Leads</p>
                          <p className="font-black" style={{ color: cfg.color }}>{s.leads}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">F/up</p>
                          <p className="font-black text-amber-600">{s.followup}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Won</p>
                          <p className="font-black text-green-600">{s.won}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Conv.</p>
                          <p className="font-black text-purple-600">{s.convRate}%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ── Channel Cards ─────────────────────────────────────────── */}
        <div>
          <h2 className="text-sm font-black text-gray-700 mb-3">📡 Kênh gửi campaign</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {Object.entries(CHANNEL_CONFIG).map(([key, cfg]) => (
              <div
                key={key}
                className="rounded-2xl p-4 relative overflow-hidden"
                style={{ background: cfg.bg, border: `1px solid ${cfg.color}22` }}
              >
                {key !== 'EMAIL' && (
                  <span
                    className="absolute top-2 right-2 text-[10px] font-black px-2 py-0.5 rounded-full"
                    style={{ background: cfg.color, color: '#fff' }}
                  >
                    Sắp ra mắt
                  </span>
                )}
                <span className="text-3xl block mb-2">{cfg.icon}</span>
                <h3 className="text-sm font-black" style={{ color: cfg.color }}>{cfg.label}</h3>
              </div>
            ))}
          </div>
        </div>

        {/* ── Create Campaign Form (client) ─────────────────────────── */}
        <CampaignCreateClient />

      </div>
    </div>
  )
}

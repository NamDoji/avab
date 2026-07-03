'use client'

import { useState, useEffect } from 'react'
import { Brain, Loader2, RefreshCw, ChevronRight, Clock } from 'lucide-react'

interface Props {
  userId: string
}

// ── Shared helpers ──────────────────────────────────────────────────────────

function LoadingState({ label = 'AI đang phân tích...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-gray-400">
      <Loader2 className="animate-spin mb-3 text-purple-400" size={32} />
      <p className="text-sm font-medium">{label}</p>
      <p className="text-xs mt-1">Thường mất 3–8 giây</p>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-gray-400 text-center px-4">
      <span className="text-4xl mb-3">📊</span>
      <p className="text-sm">{message}</p>
    </div>
  )
}

function Badge({ label, color }: { label: string; color: 'green' | 'yellow' | 'red' | 'purple' | 'blue' | 'orange' | 'gray' }) {
  const colorMap = {
    green: 'bg-green-50 text-green-700 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
    gray: 'bg-gray-100 text-gray-600 border-gray-200',
  }
  return (
    <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full border ${colorMap[color]}`}>{label}</span>
  )
}

function ScoreRing({ pct, size = 80 }: { pct: number; size?: number }) {
  const r = (size - 8) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ
  const color = pct >= 80 ? '#14B8A6' : pct >= 60 ? '#7C3AED' : pct >= 40 ? '#F97316' : '#EF4444'
  return (
    <div className="relative inline-flex items-center justify-center shrink-0">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E5E7EB" strokeWidth="8" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
      </svg>
      <span className="absolute text-base font-black" style={{ color }}>{pct}%</span>
    </div>
  )
}

function MasteryBar({ label, icon, accuracy, masteryLevel }: { label: string; icon: string | null; accuracy: number; masteryLevel: string }) {
  const color = masteryLevel === 'mastered' ? 'bg-teal-500' : masteryLevel === 'developing' ? 'bg-purple-400' : masteryLevel === 'struggling' ? 'bg-orange-400' : 'bg-red-400'
  const badge = masteryLevel === 'mastered' ? { label: 'Nắm vững', c: 'green' as const } :
                masteryLevel === 'developing' ? { label: 'Đang phát triển', c: 'purple' as const } :
                masteryLevel === 'struggling' ? { label: 'Cần hỗ trợ', c: 'orange' as const } :
                { label: 'Rủi ro', c: 'red' as const }
  return (
    <div className="flex items-center gap-2 py-1.5">
      <span className="text-lg w-7 shrink-0 text-center">{icon || '📘'}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold text-gray-700 truncate">{label}</span>
          <span className="text-xs text-gray-400 shrink-0 ml-2">{accuracy}%</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${accuracy}%` }} />
        </div>
      </div>
      <Badge label={badge.label} color={badge.c} />
    </div>
  )
}

// ── Tab 1: Chẩn đoán trạng thái người học ──────────────────────────────────

function DiagnosePanel({ data, loading }: { data?: any; loading?: boolean }) {
  if (loading) return <LoadingState label="AI đang chẩn đoán trạng thái học tập..." />
  if (!data) return <EmptyState message="Bấm 🔄 để AI chẩn đoán trạng thái học tập của con" />
  if (data.empty) return <EmptyState message={data.message} />

  const engagementColors = { high: 'green', medium: 'yellow', low: 'red' } as const
  const loadColors = { low: 'green', medium: 'yellow', high: 'red' } as const

  return (
    <div className="space-y-4">
      {/* Trạng thái tổng quan */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-4 border border-purple-100">
        <p className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-1.5">🔬 Trạng thái tổng quan (BKT-inspired)</p>
        <p className="text-gray-800 text-sm leading-relaxed font-medium">{data.overallState}</p>
      </div>

      {/* 3 chỉ số hành vi */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white border border-gray-100 rounded-2xl p-3 text-center">
          <div className="text-xl mb-1">📊</div>
          <Badge label={data.engagement?.level === 'high' ? 'Cao' : data.engagement?.level === 'medium' ? 'Trung bình' : 'Thấp'}
            color={engagementColors[data.engagement?.level as keyof typeof engagementColors] ?? 'gray'} />
          <div className="text-xs text-gray-400 mt-1">Gắn kết</div>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-3 text-center">
          <div className="text-xl mb-1">🧠</div>
          <Badge label={data.cognitive?.load === 'high' ? 'Cao' : data.cognitive?.load === 'medium' ? 'Vừa' : 'Thấp'}
            color={loadColors[data.cognitive?.load as keyof typeof loadColors] ?? 'gray'} />
          <div className="text-xs text-gray-400 mt-1">Tải nhận thức</div>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-3 text-center">
          <div className="text-xl mb-1">📈</div>
          <Badge label={data.behavior?.learningTrend > 5 ? 'Tốt lên' : data.behavior?.learningTrend < -5 ? 'Chững lại' : 'Ổn định'}
            color={data.behavior?.learningTrend > 5 ? 'green' : data.behavior?.learningTrend < -5 ? 'red' : 'yellow'} />
          <div className="text-xs text-gray-400 mt-1">Xu hướng</div>
        </div>
      </div>

      {/* Bản đồ tri thức */}
      {data.knowledgeProfile?.length > 0 && (
        <div>
          <h4 className="font-bold text-gray-900 text-sm mb-2 flex items-center gap-1.5">
            🗺️ Bản đồ tri thức
            <span className="text-xs font-normal text-gray-400">
              {data.masteredCount} nắm vững · {data.developingCount} đang học · {data.strugglingCount} cần hỗ trợ
            </span>
          </h4>
          <div className="bg-white rounded-2xl border border-gray-100 px-4 py-2 space-y-0.5 max-h-52 overflow-y-auto">
            {data.knowledgeProfile.map((k: any) => (
              <MasteryBar key={k.subjectId} label={k.name} icon={k.icon}
                accuracy={k.accuracy} masteryLevel={k.masteryLevel} />
            ))}
          </div>
        </div>
      )}

      {/* SRL — Năng lực tự học (SRL_t^i) */}
      {data.srl && (
        <div className="bg-indigo-50 rounded-2xl px-4 py-3 border border-indigo-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-indigo-600">📚 Năng lực tự học (SRL_t^i)</p>
            <span className={`text-sm font-black ${
              data.srl.srlScore >= 60 ? 'text-green-600' : data.srl.srlScore >= 30 ? 'text-orange-500' : 'text-red-500'
            }`}>{data.srl.srlScore}/100</span>
          </div>
          <div className="h-1.5 bg-white rounded-full mb-2">
            <div className={`h-full rounded-full ${
              data.srl.srlScore >= 60 ? 'bg-green-400' : data.srl.srlScore >= 30 ? 'bg-orange-400' : 'bg-red-400'
            }`} style={{ width: `${data.srl.srlScore}%` }} />
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs text-gray-500">
            <div><div className="font-semibold text-gray-700">{data.srl.breadthScore}</div>Đa dạng CĐ</div>
            <div><div className="font-semibold text-gray-700">{data.srl.consistencyScore}</div>Đều đặn</div>
            <div><div className="font-semibold text-gray-700">{data.srl.initiativeScore}</div>Chủ động</div>
          </div>
          {data.srlInsight && <p className="text-xs text-indigo-700 mt-2 italic">{data.srlInsight}</p>}
        </div>
      )}

      {/* Nhận xét AI chẩn đoán */}
      <div className="space-y-2">
        {[
          { label: '📚 Tri thức', value: data.knowledgeSummary },
          { label: '🎭 Hành vi học tập', value: data.behaviorInsight },
          { label: '💡 Nhận thức', value: data.cognitiveProfile },
          { label: '🔗 Ngữ cảnh (C_t^i)', value: data.contextualFactors },
          { label: '🎯 Phù hợp mục tiêu (G_i)', value: data.profileAlignment },
        ].filter(i => i.value).map(item => (
          <div key={item.label} className="bg-gray-50 rounded-2xl px-4 py-3">
            <p className="text-xs font-bold text-gray-500 mb-0.5">{item.label}</p>
            <p className="text-sm text-gray-700">{item.value}</p>
          </div>
        ))}
      </div>

      {/* C_t^i + G_i context bar */}
      {(data.context || data.daysToExam !== undefined) && (
        <div className="flex flex-wrap gap-2">
          {data.context?.device && (
            <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full">
              {data.context.device === 'mobile' ? '📱 Di động' : data.context.device === 'tablet' ? '💻 Máy tính bảng' : '🖥️ Máy tính'} | {data.context.timeOfDay}
            </span>
          )}
          {data.daysToExam !== null && data.daysToExam !== undefined && (
            <span className={`text-xs border px-2.5 py-1 rounded-full font-semibold ${
              data.daysToExam < 30 ? 'bg-red-50 text-red-600 border-red-200' :
              data.daysToExam < 60 ? 'bg-orange-50 text-orange-600 border-orange-200' :
              'bg-green-50 text-green-700 border-green-200'
            }`}>
              ⏰ {data.daysToExam} ngày đến kỳ thi (G_i)
            </span>
          )}
          {data.context?.note && (
            <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full">
              {data.context.note}
            </span>
          )}
        </div>
      )}

      {/* Kết luận chẩn đoán */}
      {data.diagnosticConclusion && (
        <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-3xl p-4 text-white">
          <p className="text-xs font-bold opacity-80 mb-1.5">🏁 Kết luận chẩn đoán — cơ sở ra quyết định dạy học</p>
          <p className="text-sm leading-relaxed">{data.diagnosticConclusion}</p>
        </div>
      )}
    </div>
  )
}

// ── Tab 2: Dự báo tiến trình học tập ───────────────────────────────────────

function PredictPanel({ data, loading }: { data?: any; loading?: boolean }) {
  if (loading) return <LoadingState label="AI đang dự báo tiến trình học tập..." />
  if (!data) return <EmptyState message="Bấm 🔄 để AI dự báo tiến trình học tập" />

  const pct = data.probability || 0
  const levelColors: Record<string, string> = {
    'Xuất sắc': 'text-teal-600 bg-teal-50',
    'Tốt': 'text-purple-600 bg-purple-50',
    'Trung bình': 'text-orange-600 bg-orange-50',
    'Cần cố gắng': 'text-red-600 bg-red-50',
  }
  const levelKey = Object.keys(levelColors).find(k => data.level?.includes(k)) ?? data.level

  const mdim = data.multiDimension
  const riskColors = { low: 'green', medium: 'yellow', high: 'red' } as const
  const loadColors = { low: 'green', medium: 'yellow', high: 'red' } as const
  const readinessColors = { ready: 'green', borderline: 'yellow', not_ready: 'red' } as const
  const readinessLabels = { ready: 'Sẵn sàng', borderline: 'Gần sẵn sàng', not_ready: 'Chưa sẵn sàng' }

  return (
    <div className="space-y-4">
      {/* Xác suất đỗ */}
      <div className="flex items-center gap-4 bg-gradient-to-br from-purple-50 to-teal-50 rounded-3xl p-4">
        <ScoreRing pct={pct} size={88} />
        <div className="flex-1">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Xác suất thành công</p>
          <span className={`inline-block text-sm font-black px-3 py-1 rounded-full mb-2 ${levelColors[levelKey] ?? 'bg-gray-100 text-gray-600'}`}>
            {data.level}
          </span>
          <p className="text-gray-700 text-sm leading-relaxed">{data.verdict}</p>
        </div>
      </div>

      {/* Dự báo đa chiều — Bài toán 2 */}
      {mdim && (
        <div>
          <h4 className="font-bold text-gray-900 text-sm mb-2">📡 Dự báo đa chiều (DKT/multi-task)</h4>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white border border-gray-100 rounded-2xl p-3 text-center">
              <div className="text-lg mb-1">⚠️</div>
              <Badge label={mdim.engagementRisk === 'low' ? 'Thấp' : mdim.engagementRisk === 'medium' ? 'Vừa' : 'Cao'}
                color={riskColors[mdim.engagementRisk as keyof typeof riskColors] ?? 'gray'} />
              <div className="text-xs text-gray-400 mt-1">Rủi ro gắn kết</div>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl p-3 text-center">
              <div className="text-lg mb-1">🧩</div>
              <Badge label={mdim.cognitiveLoad === 'low' ? 'Thấp' : mdim.cognitiveLoad === 'medium' ? 'Vừa' : 'Cao'}
                color={loadColors[mdim.cognitiveLoad as keyof typeof loadColors] ?? 'gray'} />
              <div className="text-xs text-gray-400 mt-1">Tải nhận thức</div>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl p-3 text-center">
              <div className="text-lg mb-1">🚀</div>
              <Badge label={readinessLabels[mdim.readinessToAdvance as keyof typeof readinessLabels] ?? mdim.readinessToAdvance}
                color={readinessColors[mdim.readinessToAdvance as keyof typeof readinessColors] ?? 'gray'} />
              <div className="text-xs text-gray-400 mt-1">Sẵn sàng tiếp</div>
            </div>
          </div>
        </div>
      )}

      {/* Thống kê học tập */}
      {data.stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { label: 'Độ chính xác', value: `${data.stats.overallAccuracy}%`, icon: '🎯' },
            { label: 'Chuyên đề', value: `${data.stats.subjectsDone}/${data.stats.totalSubjects}`, icon: '📚' },
            { label: 'Câu đã làm', value: data.stats.totalAnswered, icon: '✏️' },
            { label: 'Cải thiện', value: `${data.stats.improvement > 0 ? '+' : ''}${data.stats.improvement}%`, icon: '📈' },
          ].map(s => (
            <div key={s.label} className="bg-white border border-gray-100 rounded-2xl p-3 text-center">
              <div className="text-xl mb-1">{s.icon}</div>
              <div className="font-black text-gray-900 text-sm">{s.value}</div>
              <div className="text-xs text-gray-400">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Dự báo AI */}
      <div className="space-y-2">
        {data.successForecast && (
          <div className="bg-teal-50 rounded-2xl px-4 py-3">
            <p className="text-xs font-bold text-teal-600 mb-0.5">✅ Dự báo thành công bước tiếp</p>
            <p className="text-sm text-gray-700">{data.successForecast}</p>
          </div>
        )}
        {data.engagementForecast && (
          <div className="bg-orange-50 rounded-2xl px-4 py-3">
            <p className="text-xs font-bold text-orange-600 mb-0.5">📉 Dự báo rủi ro gắn kết</p>
            <p className="text-sm text-gray-700">{data.engagementForecast}</p>
          </div>
        )}
        {data.cognitiveLoadForecast && (
          <div className="bg-blue-50 rounded-2xl px-4 py-3">
            <p className="text-xs font-bold text-blue-600 mb-0.5">🧠 Dự báo tải nhận thức</p>
            <p className="text-sm text-gray-700">{data.cognitiveLoadForecast}</p>
          </div>
        )}
        {data.srlForecast && (
          <div className="bg-indigo-50 rounded-2xl px-4 py-3">
            <p className="text-xs font-bold text-indigo-600 mb-0.5">📚 Dự báo phát triển SRL_t^i</p>
            <p className="text-sm text-gray-700">{data.srlForecast}</p>
          </div>
        )}
        {data.retentionForecast && (
          <div className="bg-purple-50 rounded-2xl px-4 py-3">
            <p className="text-xs font-bold text-purple-600 mb-0.5">🔄 Dự báo duy trì tiến trình (RET)</p>
            <p className="text-sm text-gray-700">{data.retentionForecast}</p>
          </div>
        )}
      </div>

      {/* Tín hiệu */}
      <div className="grid sm:grid-cols-2 gap-3">
        {data.readinessSignals?.length > 0 && (
          <div>
            <h4 className="font-bold text-gray-900 text-sm mb-1.5">🟢 Tín hiệu sẵn sàng</h4>
            <div className="space-y-1">
              {data.readinessSignals.map((s: string, i: number) => (
                <div key={i} className="flex items-start gap-1.5 text-xs text-gray-600">
                  <ChevronRight size={12} className="text-teal-500 mt-0.5 shrink-0" />{s}
                </div>
              ))}
            </div>
          </div>
        )}
        {data.riskSignals?.length > 0 && (
          <div>
            <h4 className="font-bold text-gray-900 text-sm mb-1.5">🔴 Tín hiệu rủi ro</h4>
            <div className="space-y-1">
              {data.riskSignals.map((s: string, i: number) => (
                <div key={i} className="flex items-start gap-1.5 text-xs text-gray-600">
                  <ChevronRight size={12} className="text-red-400 mt-0.5 shrink-0" />{s}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Kế hoạch hành động */}
      {data.actionPlan?.length > 0 && (
        <div>
          <h4 className="font-bold text-gray-900 text-sm mb-2">📋 Cần làm ngay:</h4>
          <div className="space-y-1.5">
            {data.actionPlan.map((action: string, i: number) => (
              <div key={i} className="flex items-start gap-2 bg-purple-50 rounded-xl px-3 py-2">
                <span className="text-purple-500 font-bold text-xs mt-0.5">{i + 1}.</span>
                <span className="text-sm text-gray-700">{action}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lời nhắn phụ huynh */}
      {data.parentNote && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl px-4 py-3">
          <p className="text-xs font-bold text-yellow-700 mb-0.5">👨‍👩‍👧 Gửi phụ huynh</p>
          <p className="text-sm text-gray-700">{data.parentNote}</p>
        </div>
      )}
    </div>
  )
}

// ── Tab 3: Can thiệp sư phạm ────────────────────────────────────────────────

function IntervenePanel({ data, loading }: { data?: any; loading?: boolean }) {
  if (loading) return <LoadingState label="AI đang lựa chọn gói can thiệp phù hợp..." />
  if (!data) return <EmptyState message="Bấm 🔄 để AI đề xuất gói can thiệp sư phạm" />
  if (data.empty) return <EmptyState message={data.message} />

  const packageColors = {
    intensive: { bg: 'bg-red-50 border-red-200', badge: 'red', emoji: '🔥' },
    standard: { bg: 'bg-purple-50 border-purple-200', badge: 'purple', emoji: '⚡' },
    light: { bg: 'bg-green-50 border-green-200', badge: 'green', emoji: '✨' },
  } as const
  const pkgStyle = packageColors[data.packageType as keyof typeof packageColors] ?? packageColors.standard

  return (
    <div className="space-y-4">
      {/* Gói can thiệp được chọn */}
      <div className={`rounded-3xl p-4 border-2 ${pkgStyle.bg}`}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">{pkgStyle.emoji}</span>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Gói can thiệp được đề xuất</p>
            <p className="font-black text-gray-900">{data.packageLabel}</p>
          </div>
          <Badge label={data.packageType === 'intensive' ? 'Tăng cường' : data.packageType === 'standard' ? 'Tiêu chuẩn' : 'Duy trì'}
            color={pkgStyle.badge} />
        </div>
        <p className="text-sm text-gray-700">{data.packageRationale}</p>
      </div>

      {/* Mục tiêu can thiệp */}
      {data.interventionGoal && (
        <div className="bg-indigo-50 rounded-2xl px-4 py-3 border border-indigo-100">
          <p className="text-xs font-bold text-indigo-600 mb-0.5">🎯 Mục tiêu can thiệp (SMART)</p>
          <p className="text-sm text-gray-700">{data.interventionGoal}</p>
        </div>
      )}

      {/* Lộ trình học tập */}
      {data.learningPathway?.length > 0 && (
        <div>
          <h4 className="font-bold text-gray-900 text-sm mb-2">🗺️ Lộ trình học tập cá nhân hoá</h4>
          <div className="space-y-2">
            {data.learningPathway.map((step: string, i: number) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <div className="bg-white border border-gray-100 rounded-xl px-3 py-2 flex-1 text-sm text-gray-700">
                  {step}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chuyên đề ưu tiên */}
      {data.priorityTopics?.length > 0 && (
        <div>
          <h4 className="font-bold text-gray-900 text-sm mb-2">📌 Chuyên đề ưu tiên</h4>
          <div className="space-y-1.5">
            {data.priorityTopics.map((topic: string, i: number) => (
              <div key={i} className="flex items-start gap-2 bg-amber-50 rounded-xl px-3 py-2 border border-amber-100">
                <span className="text-amber-500 font-black text-xs mt-0.5">{i + 1}.</span>
                <span className="text-sm text-gray-700">{topic}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Phương pháp + thời gian */}
      <div className="grid sm:grid-cols-2 gap-3">
        {data.teachingMethod && (
          <div className="bg-teal-50 rounded-2xl px-4 py-3">
            <p className="text-xs font-bold text-teal-600 mb-0.5">🏫 Phương pháp sư phạm</p>
            <p className="text-sm text-gray-700">{data.teachingMethod}</p>
          </div>
        )}
        {data.estimatedDays && (
          <div className="bg-blue-50 rounded-2xl px-4 py-3">
            <p className="text-xs font-bold text-blue-600 mb-0.5">⏱️ Thời gian ước tính</p>
            <p className="text-xl font-black text-blue-700">{data.estimatedDays} ngày</p>
          </div>
        )}
      </div>

      {/* Tiêu chí thành công */}
      {data.successCriteria && (
        <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3">
          <p className="text-xs font-bold text-green-700 mb-0.5">✅ Tiêu chí thành công</p>
          <p className="text-sm text-gray-700">{data.successCriteria}</p>
        </div>
      )}
      {data.srlDevelopmentPlan && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl px-4 py-3">
          <p className="text-xs font-bold text-indigo-600 mb-0.5">📚 Kế hoạch tăng SRL trong gói này</p>
          <p className="text-sm text-gray-700">{data.srlDevelopmentPlan}</p>
        </div>
      )}

      {/* Hướng dẫn phụ huynh */}
      {data.parentGuidance && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl px-4 py-3">
          <p className="text-xs font-bold text-yellow-700 mb-0.5">👨‍👩‍👧 Hướng dẫn phụ huynh tại nhà</p>
          <p className="text-sm text-gray-700">{data.parentGuidance}</p>
        </div>
      )}
    </div>
  )
}

// ── Tab 4: Khuyến nghị can thiệp sư phạm ───────────────────────────────────

function RecommendPanel({ data, loading }: { data?: any; loading?: boolean }) {
  if (loading) return <LoadingState label="AI đang tổng hợp khuyến nghị sư phạm..." />
  if (!data) return <EmptyState message="Bấm 🔄 để AI đưa ra khuyến nghị can thiệp sư phạm" />

  const supportColors = { high: 'red', medium: 'orange', low: 'green' } as const
  const supportLabels = { high: 'Hỗ trợ cao', medium: 'Hỗ trợ trung bình', low: 'Hỗ trợ nhẹ' }

  return (
    <div className="space-y-4">
      {/* Chiến lược sư phạm + Mức hỗ trợ */}
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl p-4 border border-purple-100">
        <div className="flex items-start justify-between gap-3 mb-2">
          <p className="text-xs font-bold text-purple-600 uppercase tracking-wide">🎓 Chiến lược sư phạm (Aware Recommendation)</p>
          {data.supportLevel && (
            <Badge label={supportLabels[data.supportLevel as keyof typeof supportLabels] ?? data.supportLevel}
              color={supportColors[data.supportLevel as keyof typeof supportColors] ?? 'gray'} />
          )}
        </div>
        <p className="text-sm text-gray-800 leading-relaxed">{data.teachingStrategy}</p>
        {data.supportGuidance && <p className="text-xs text-gray-500 mt-2 italic">{data.supportGuidance}</p>}
      </div>

      {/* Bài tập gợi ý */}
      {data.exercises?.length > 0 && (
        <div>
          <h4 className="font-bold text-gray-900 text-sm mb-2">📝 Bài tập được đề xuất</h4>
          <div className="space-y-2">
            {data.exercises.map((ex: any, i: number) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="font-bold text-gray-900 text-sm">{ex.type}</span>
                  <Badge label={ex.difficulty}
                    color={ex.difficulty === 'Dễ' ? 'green' : ex.difficulty === 'Khó' ? 'red' : 'yellow'} />
                </div>
                <p className="text-sm text-gray-600 mb-2">{ex.description}</p>
                {ex.example && (
                  <div className="bg-gray-50 rounded-xl px-3 py-2 text-xs font-mono text-gray-700">
                    💡 {ex.example}
                  </div>
                )}
                {ex.pedagogicalReason && (
                  <p className="text-xs text-purple-600 mt-2 font-medium">🎓 {ex.pedagogicalReason}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chiến lược tự học */}
      {data.selfStudyStrategy && (
        <div className="bg-teal-50 rounded-2xl px-4 py-3">
          <p className="text-xs font-bold text-teal-600 mb-0.5">🏠 Chiến lược tự học tại nhà</p>
          <p className="text-sm text-gray-700">{data.selfStudyStrategy}</p>
        </div>
      )}
      {/* SRL development actions */}
      {data.srlDevelopmentActions?.length > 0 && (
        <div className="bg-indigo-50 rounded-2xl px-4 py-3">
          <p className="text-xs font-bold text-indigo-600 mb-2">📚 Phát triển SRL (tự học chủ động)</p>
          <ul className="space-y-1">
            {data.srlDevelopmentActions.map((a: string, i: number) => (
              <li key={i} className="text-xs text-gray-700 flex items-start gap-1.5">
                <ChevronRight size={12} className="text-indigo-400 mt-0.5 shrink-0" />{a}
              </li>
            ))}
          </ul>
        </div>
      )}
      {/* Adapt theo ngữ cảnh */}
      {data.contextAdaptations && (
        <div className="bg-gray-50 rounded-2xl px-4 py-2.5">
          <p className="text-xs font-bold text-gray-500 mb-0.5">📡 Điều chỉnh theo ngữ cảnh (C_t^i)</p>
          <p className="text-xs text-gray-600">{data.contextAdaptations}</p>
        </div>
      )}

      {/* Hành động của giáo viên & phụ huynh */}
      <div className="grid sm:grid-cols-2 gap-3">
        {data.teacherActions?.length > 0 && (
          <div className="bg-blue-50 rounded-2xl p-3">
            <p className="text-xs font-bold text-blue-600 mb-2">👩‍🏫 Hành động giáo viên</p>
            <ul className="space-y-1">
              {data.teacherActions.map((a: string, i: number) => (
                <li key={i} className="text-xs text-gray-700 flex items-start gap-1.5">
                  <ChevronRight size={12} className="text-blue-400 mt-0.5 shrink-0" />{a}
                </li>
              ))}
            </ul>
          </div>
        )}
        {data.parentActions?.length > 0 && (
          <div className="bg-yellow-50 rounded-2xl p-3">
            <p className="text-xs font-bold text-yellow-700 mb-2">👨‍👩‍👧 Hành động phụ huynh</p>
            <ul className="space-y-1">
              {data.parentActions.map((a: string, i: number) => (
                <li key={i} className="text-xs text-gray-700 flex items-start gap-1.5">
                  <ChevronRight size={12} className="text-yellow-500 mt-0.5 shrink-0" />{a}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Tài nguyên */}
      {data.resourceRecommendations?.length > 0 && (
        <div className="bg-gray-50 rounded-2xl px-4 py-3">
          <p className="text-xs font-bold text-gray-500 mb-2">📦 Tài nguyên học tập đề xuất</p>
          <div className="flex flex-wrap gap-2">
            {data.resourceRecommendations.map((r: string, i: number) => (
              <span key={i} className="text-xs bg-white border border-gray-200 rounded-full px-2.5 py-1 text-gray-600">{r}</span>
            ))}
          </div>
        </div>
      )}

      {/* Mục tiêu ngày + Động viên */}
      <div className="grid sm:grid-cols-2 gap-3">
        {data.dailyGoal && (
          <div className="bg-purple-50 rounded-2xl px-4 py-3">
            <p className="text-xs font-bold text-purple-600 mb-0.5">📅 Mục tiêu hôm nay</p>
            <p className="text-sm font-semibold text-gray-800">{data.dailyGoal}</p>
          </div>
        )}
        {data.motivation && (
          <div className="bg-pink-50 rounded-2xl px-4 py-3">
            <p className="text-xs font-bold text-pink-500 mb-0.5">🌟 Động viên</p>
            <p className="text-sm text-gray-800 italic">"{data.motivation}"</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main Dashboard ──────────────────────────────────────────────────────────

type TabId = 'diagnose' | 'predict' | 'intervene' | 'recommend'

const TABS: { id: TabId; label: string; emoji: string; apiPath: string; method: 'GET' | 'POST'; desc: string }[] = [
  { id: 'diagnose',  label: 'Chẩn đoán',   emoji: '🔬', apiPath: 'diagnose',  method: 'GET',  desc: 'Trạng thái tri thức & hành vi' },
  { id: 'predict',   label: 'Dự báo',       emoji: '📡', apiPath: 'predict',   method: 'GET',  desc: 'Tiến trình học tập đa chiều' },
  { id: 'intervene', label: 'Can thiệp',    emoji: '🎯', apiPath: 'intervene', method: 'GET',  desc: 'Gói can thiệp tối ưu' },
  { id: 'recommend', label: 'Khuyến nghị',  emoji: '💡', apiPath: 'recommend', method: 'GET',  desc: 'Chiến lược sư phạm tổng hợp' },
]

const AI_REFRESH_DAYS = 14

// Dữ liệu mặc định hiện khi chưa có kết quả AI thật
const DEFAULT_DATA = {
  diagnose: {
    overallState: 'Học viên đang bắt đầu hành trình học Toán Tư Duy. Hệ thống AI sẽ phân tích chi tiết hơn sau khi có dữ liệu làm bài.',
    knowledgeProfile: [],
    masteredCount: 0, developingCount: 0, strugglingCount: 0, totalSubjects: 0,
    behavior: { totalAnswered: 0, avgPerDay: '0', learningTrend: 0, learningTrendLabel: 'Ổn định' },
    cognitive: { load: 'low', maxConsecutiveWrong: 0 },
    engagement: { level: 'medium', score: 40, subjectsCovered: 0 },
    knowledgeSummary: 'Chưa có dữ liệu để phân tích bản đồ tri thức. Hãy bắt đầu làm bài!',
    behaviorInsight: 'Học viên mới bắt đầu. Hãy hướng dẫn con làm thử các bài Quản sát và Phân loại trước.',
    diagnosticConclusion: 'Đây là điểm khởi đầu. Làm bài đều đặn mỗi ngày để AI có thể xây dựng bản đồ học tập cá nhân cho con.',
  },
  predict: {
    probability: 50,
    level: 'Đang khởi đầu',
    verdict: 'Hệ thống đang thu thập dữ liệu. Làm nhiều bài hơn, AI sẽ dự báo chính xác khả năng của con.',
    stats: { totalScore: 0, overallAccuracy: 0, subjectsDone: 0, totalSubjects: 0, coveragePct: 0, totalAnswered: 0, improvement: 0, recentAccuracy: 0 },
    multiDimension: { engagementRisk: 'low', cognitiveLoad: 'low', readinessToAdvance: 'borderline' },
    actionPlan: ['Bắt đầu với chùm bài Quản sát & Phân loại', 'Làm ít nhất 5 bài/ngày trong tuần đầu', 'Nhờ phụ huynh điều hặn giờ học'],
    readinessSignals: ['Học viên mới — tiềm năng chưa được khám phá'],
    parentNote: 'Hãy cùng con làm thử 3–5 bài đầu tiên để làm quen với nền tảng.',
  },
  intervene: {
    packageType: 'standard',
    packageLabel: 'Gói Khởi Đầu — Khám Phá & Xây Nền',
    packageRationale: 'Bắt đầu với lộ trình khám phá toàn diện, xác định điểm mạnh và điểm cần phát triển.',
    interventionGoal: 'Làm quen toàn bộ các dạng bài Toán Tư Duy trong 4 tuần đầu, xây nền tảng vững chắc.',
    learningPathway: [
      'Tuần 1: Làm quen các dạng Quản sát, So sánh, Phân loại',
      'Tuần 2: Khám phá Quy luật và Mối liên hệ',
      'Tuần 3: Làm lại các chùm bài có điểm chưa cao',
      'Tuần 4: Ôn tổng hợp và đánh giá tiến bộ',
    ],
    teachingMethod: 'Học qua trò chơi, quan sát thực tế — phù hợp lứa tuổi 5–6.',
    estimatedDays: 28,
    successCriteria: 'Đạt ư 60% ở ít nhất 5 chùm bài sau 4 tuần.',
    parentGuidance: 'Hòa cùng con 15–20 phút mỗi ngày. Khen ngợi sự cố gắng hơn là kết quả.',
  },
  recommend: {
    teachingStrategy: 'Bắt đầu với các bài tập đơn giản, trực quan. Xây dựng sự tự tin trước khi tăng độ khó.',
    supportLevel: 'high',
    selfStudyStrategy: 'Học 15–20 phút/ngày vào buổi sáng hoặc sớm buổi tối. Không học quá 30 phút liên tục.',
    dailyGoal: 'Làm ít nhất 5 bài/ngày để AI có thể phân tích tiến trình.',
    motivation: 'Học Toán Tư Duy giúp con thông minh hơn mỗi ngày!',
    exercises: [
      { type: 'Quan sát & Phân biệt', difficulty: 'Dễ', description: 'Tìm điểm giống và khác nhau giữa các hình', example: 'Hình nào khống giống các hình còn lại?', pedagogicalReason: 'Xây dựng nền tảng tư duy quan sát' },
      { type: 'Sắp xếp theo quy luật', difficulty: 'Trung bình', description: 'Tìm quy luật và điền số/hình còn thiếu', example: '2, 4, 6, 8, __?', pedagogicalReason: 'Phát triển tư duy logic cơ bản' },
      { type: 'Phân loại đồ vật', difficulty: 'Dễ', description: 'Nhóm các đồ vật theo đặc điểm chung', example: 'Con nào có 2 chân? Con nào có 4 chân?', pedagogicalReason: 'Tăng khả năng phân tích đặc điểm' },
    ],
    teacherActions: ['Chọn bài phù hợp trình độ khởi đầu', 'Tạo không khí vui vẻ, không áp lực điểm số'],
    parentActions: ['Cùng con học 15 phút/ngày', 'Khen khi con cố gắng, dù sai hay đúng'],
  },
} as const

export function AIDashboard({ userId }: Props) {
  const [data, setData] = useState<Partial<Record<TabId, any>>>({})
  const [activeTab, setActiveTab] = useState<TabId>('diagnose')
  const [refreshedAt, setRefreshedAt] = useState<Date | null>(null)
  const [refreshError, setRefreshError] = useState<{ nextAt: Date; daysLeft: number } | null>(null)
  const [forceLoading, setForceLoading] = useState(false) // chỉ spin khi bấm nút
  const [initializing, setInitializing] = useState(false)  // lần đầu tự sinh dữ liệu

  const nextRefreshDate = refreshedAt
    ? new Date(refreshedAt.getTime() + AI_REFRESH_DAYS * 24 * 60 * 60 * 1000)
    : null
  const daysUntilRefresh = nextRefreshDate
    ? Math.ceil((nextRefreshDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0
  const canRefreshNow = !refreshedAt || daysUntilRefresh <= 0

  // Load từng tab từ cache, trả về true nếu có dữ liệu
  const loadCache = async (tabId: TabId): Promise<boolean> => {
    const tab = TABS.find(t => t.id === tabId)
    if (!tab) return false
    try {
      const res = await fetch(`/api/ai/${tab.apiPath}`)
      const json = await res.json()
      if (json.success && json.data && !json.data.empty) {
        setData(prev => ({ ...prev, [tabId]: json.data }))
        if (json.refreshedAt) setRefreshedAt(new Date(json.refreshedAt))
        return true
      }
    } catch (e) { console.error(`AI cache load ${tabId}:`, e) }
    return false
  }

  // Force refresh 1 tab, gọi OpenAI
  // init=true: bypass giới hạn 14 ngày (chỉ dùng lúc khởi tạo lần đầu)
  const forceRefreshTab = async (tabId: TabId, init = false) => {
    const tab = TABS.find(t => t.id === tabId)
    if (!tab) return
    try {
      const params = init ? '?force=1&init=1' : '?force=1'
      const res = await fetch(`/api/ai/${tab.apiPath}${params}`)
      const json = await res.json()
      if (res.status === 429 && json.error === 'refresh_limit') {
        setRefreshError({ nextAt: new Date(json.nextAt), daysLeft: json.daysLeft })
        return false
      }
      if (json.success && json.data && !json.data.empty) {
        setData(prev => ({ ...prev, [tabId]: json.data }))
        if (json.refreshedAt) setRefreshedAt(new Date(json.refreshedAt))
        else setRefreshedAt(new Date())
      } else if (json.success) {
        // AI trả empty/null → giữ default, vẫn set refreshedAt để khóa 14 ngày
        if (json.refreshedAt) setRefreshedAt(new Date(json.refreshedAt))
        else setRefreshedAt(new Date())
      }
      return json.success
    } catch (e) { console.error(`AI force ${tabId}:`, e); return false }
  }

  // Mount: load cả 4 tab từ cache. Nếu chưa có cache → tự sinh lần đầu
  useEffect(() => {
    const init = async () => {
      const results = await Promise.all(TABS.map(t => loadCache(t.id)))
      // Nếu tất cả đều null → dùng data mặc định luôn (không gọi OpenAI)
      if (results.every(r => !r)) {
        setData({
          diagnose: DEFAULT_DATA.diagnose,
          predict: DEFAULT_DATA.predict,
          intervene: DEFAULT_DATA.intervene,
          recommend: DEFAULT_DATA.recommend,
        })
      }
    }
    init()
  }, [])

  return (
    <div className="bg-white rounded-4xl border-2 border-purple-100 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-700 via-purple-600 to-teal-500 p-5 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
            <Brain size={22} />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-black">AI Hỗ Trợ Học Tập — A2PLM</h2>
            <p className="text-white/70 text-xs">K_t · B_t · E_t · P_i · G_i · C_t · SRL_t</p>
          </div>
          <button
            onClick={async () => {
              if (!canRefreshNow || forceLoading) return
              setForceLoading(true)
              setRefreshError(null)
              // Refresh lần lượt cả 4 tab
              for (const t of TABS) {
                const ok = await forceRefreshTab(t.id)
                if (!ok) break // dừng nếu bị block
              }
              setForceLoading(false)
            }}
            disabled={!canRefreshNow || forceLoading || initializing}
            className={`p-2 rounded-xl transition-all shrink-0 ${
              canRefreshNow && !forceLoading && !initializing
                ? 'bg-white/10 hover:bg-white/20 cursor-pointer'
                : 'bg-white/5 opacity-40 cursor-not-allowed'
            }`}
            title={canRefreshNow ? 'Phân tích mới (2 tuần/lần)' : `Có thể cập nhật sau ${daysUntilRefresh} ngày nữa`}
          >
            <RefreshCw size={16} className={(forceLoading || initializing) ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* A2PLM context bar */}
      {(data.diagnose?.srl || data.predict?.srl) && (() => {
        const srl = data.diagnose?.srl ?? data.predict?.srl
        const daysToExam = data.diagnose?.daysToExam ?? data.predict?.daysToExam
        return (
          <div className="flex items-center gap-3 px-4 py-2 bg-white/10 border-t border-white/10 flex-wrap">
            <span className="text-white/80 text-xs font-semibold">
              SRL: <span className={srl.srlScore >= 60 ? 'text-green-300' : srl.srlScore >= 30 ? 'text-yellow-300' : 'text-red-300'}>{srl.srlScore}/100</span>
            </span>
            {daysToExam !== null && (
              <span className={`text-xs font-semibold ${daysToExam < 30 ? 'text-red-300' : daysToExam < 60 ? 'text-yellow-300' : 'text-green-300'}`}>
                ⏰ {daysToExam} ngày đến kỳ thi
              </span>
            )}
          </div>
        )
      })()}

      {/* Thông báo giới hạn refresh — luôn hiện */}
      <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border-b border-amber-100 text-xs text-amber-700">
        <Clock size={12} className="shrink-0" />
        {initializing ? (
          <span>⏳ Đang tạo phân tích ban đầu, vui lòng đợi...</span>
        ) : !refreshedAt && !refreshError ? (
          <span>Dữ liệu tổng hợp <strong>2 tuần/lần</strong> · Bấm 🔄 để phân tích lần đầu</span>
        ) : canRefreshNow ? (
          <span>Dữ liệu tổng hợp <strong>2 tuần/lần</strong> · Bấm 🔄 để cập nhật ngay</span>
        ) : (
          <span>
            Dữ liệu tổng hợp <strong>2 tuần/lần</strong> ·
            Cập nhật tiếp:{' '}
            <strong>
              {(refreshError?.nextAt ?? nextRefreshDate)?.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            </strong>{' '}
            ({refreshError?.daysLeft ?? daysUntilRefresh} ngày nữa)
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-gray-100">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-0 flex flex-col items-center gap-0.5 px-2 py-3 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-purple-600 text-purple-700 bg-purple-50'
                : 'border-transparent text-gray-400 hover:text-purple-500 hover:bg-gray-50'
            }`}
          >
            <span className="text-base">{tab.emoji}</span>
            <span>{tab.label}</span>
            <span className="text-[10px] font-normal text-gray-400 hidden sm:block truncate max-w-full px-1">{tab.desc}</span>
          </button>
        ))}
      </div>

      {/* Panel content */}
      <div className="p-4 sm:p-5">
        {activeTab === 'diagnose'  && <DiagnosePanel  data={data.diagnose  ?? DEFAULT_DATA.diagnose}  loading={forceLoading || initializing} />}
        {activeTab === 'predict'   && <PredictPanel   data={data.predict   ?? DEFAULT_DATA.predict}   loading={forceLoading || initializing} />}
        {activeTab === 'intervene' && <IntervenePanel data={data.intervene ?? DEFAULT_DATA.intervene} loading={forceLoading || initializing} />}
        {activeTab === 'recommend' && <RecommendPanel data={data.recommend ?? DEFAULT_DATA.recommend} loading={forceLoading || initializing} />}
      </div>
    </div>
  )
}

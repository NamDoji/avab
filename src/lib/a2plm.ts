/**
 * A2PLM Helper — AI-Augmented Adaptive Personalized Learning Model
 * Đỗ Chí Cường — ĐHBK Hà Nội 2026
 *
 * Z_t^i = Φ(K_t^i, B_t^i, E_t^i, P_i, G_i, C_t^i)
 *   K_t^i : trạng thái tri thức (BKT formula đúng)
 *   B_t^i : hành vi học tập (từ StudentSessionRecord)
 *   E_t^i : gắn kết + kỹ năng tư duy (từ StudentSessionRecord)
 *   P_i   : hồ sơ người học (LearnerProfile)
 *   G_i   : mục tiêu học tập (targetSchool, targetDate)
 *   C_t^i : ngữ cảnh học tập (device, time)
 */

import { NextRequest } from 'next/server'
import { prisma } from './prisma'

// ─────────────────────────────────────────────────────────────────────────────
// C_t^i: Ngữ cảnh học tập
// ─────────────────────────────────────────────────────────────────────────────

export function extractLearningContext(req: NextRequest) {
  const ua = req.headers.get('user-agent') ?? ''
  const now = new Date()
  const hour = now.getHours()

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone/i.test(ua)
  const isTablet = /iPad|Android.*Tablet/i.test(ua)
  const device = isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop'

  const vnHour = (hour + 7) % 24
  const timeOfDay =
    vnHour >= 5 && vnHour < 9   ? 'buổi sáng sớm (5–9h)' :
    vnHour >= 9 && vnHour < 12  ? 'buổi sáng (9–12h)' :
    vnHour >= 12 && vnHour < 14 ? 'buổi trưa (12–14h)' :
    vnHour >= 14 && vnHour < 18 ? 'buổi chiều (14–18h)' :
    vnHour >= 18 && vnHour < 22 ? 'buổi tối (18–22h)' :
                                   'đêm khuya (22–5h)'

  return {
    device,
    timeOfDay,
    vnHour,
    isMobile,
    contextNote:
      vnHour >= 22 || vnHour < 5
        ? 'Học đêm khuya — tải nhận thức thường cao hơn, nên rút ngắn session'
        : device === 'mobile'
        ? 'Học trên di động — ưu tiên bài ngắn, hình ảnh rõ ràng'
        : 'Điều kiện học tập tiêu chuẩn',
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// K_t^i: BKT (Bayesian Knowledge Tracing) — đúng công thức
// Corbett & Anderson, 1995
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Tham số BKT chuẩn cho AvaB (Toán Tư Duy, trẻ 5–6 tuổi):
 * P(L0) = xác suất biết ban đầu — điều chỉnh theo backgroundLevel
 * P(T)  = xác suất học được sau mỗi lần thử = 0.09
 * P(S)  = xác suất làm sai dù biết (slip)  = 0.10
 * P(G)  = xác suất đoán đúng dù chưa biết  = 0.25 (trắc nghiệm)
 */
const BKT_TRANSIT   = 0.09
const BKT_SLIP      = 0.10
const BKT_GUESS     = 0.25

function bktPrior(backgroundLevel: string | null | undefined): number {
  if (backgroundLevel === 'ADVANCED')     return 0.40
  if (backgroundLevel === 'INTERMEDIATE') return 0.20
  return 0.05 // BEGINNER / default
}

function bktUpdate(pLt: number, isCorrect: boolean): number {
  let pLtGivenObs: number
  if (isCorrect) {
    const pCorrect = pLt * (1 - BKT_SLIP) + (1 - pLt) * BKT_GUESS
    pLtGivenObs = pCorrect > 0 ? (pLt * (1 - BKT_SLIP)) / pCorrect : pLt
  } else {
    const pIncorrect = pLt * BKT_SLIP + (1 - pLt) * (1 - BKT_GUESS)
    pLtGivenObs = pIncorrect > 0 ? (pLt * BKT_SLIP) / pIncorrect : pLt
  }
  // Transit: sau quan sát, cập nhật khả năng học được
  return pLtGivenObs + (1 - pLtGivenObs) * BKT_TRANSIT
}

export type BKTSubjectProfile = {
  subjectId: string
  name: string
  icon: string | null
  pMastery: number      // P(L_t) cuối cùng, 0–1
  masteryPct: number    // pMastery * 100
  masteryLevel: 'mastered' | 'developing' | 'struggling' | 'at_risk'
  attempted: number
  accuracy: number      // % accuracy thô để hiển thị
  recentAccuracy: number
  trend: 'improving' | 'stable' | 'declining'
}

export function computeKtBKT(
  answers: { subjectId: string; isCorrect: boolean; createdAt: Date }[],
  subjects: { id: string; name: string; icon: string | null }[],
  backgroundLevel?: string | null
): BKTSubjectProfile[] {
  const prior = bktPrior(backgroundLevel)
  const subjectMap: Record<string, { name: string; icon: string | null; answers: { isCorrect: boolean; createdAt: Date }[] }> = {}
  for (const s of subjects) subjectMap[s.id] = { name: s.name, icon: s.icon, answers: [] }
  for (const a of answers) {
    if (subjectMap[a.subjectId]) subjectMap[a.subjectId].answers.push({ isCorrect: a.isCorrect, createdAt: a.createdAt })
  }

  return subjects
    .filter(s => subjectMap[s.id].answers.length > 0)
    .map(s => {
      const sa = subjectMap[s.id].answers.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      // BKT cập nhật từng câu trả lời
      let pLt = prior
      for (const a of sa) {
        pLt = bktUpdate(pLt, a.isCorrect)
      }
      // Accuracy thô
      const correct = sa.filter(a => a.isCorrect).length
      const accuracy = Math.round((correct / sa.length) * 100)
      const recent5 = sa.slice(-5)
      const recentAcc = Math.round(recent5.filter(a => a.isCorrect).length / recent5.length * 100)
      // Trend
      const half = Math.floor(sa.length / 2)
      const earlyAcc = half > 0 ? sa.slice(0, half).filter(a => a.isCorrect).length / half : 0
      const lateAcc  = half > 0 ? sa.slice(half).filter(a => a.isCorrect).length / (sa.length - half) : 0
      const diff = lateAcc - earlyAcc
      const trend = diff > 0.1 ? 'improving' : diff < -0.1 ? 'declining' : 'stable'

      // Mastery dựa vào P(L_t) BKT
      const masteryLevel =
        pLt >= 0.80 ? 'mastered' :
        pLt >= 0.55 ? 'developing' :
        pLt >= 0.30 ? 'struggling' :
        'at_risk'

      return {
        subjectId: s.id,
        name: s.name,
        icon: s.icon,
        pMastery: Math.round(pLt * 100) / 100,
        masteryPct: Math.round(pLt * 100),
        masteryLevel,
        attempted: sa.length,
        accuracy,
        recentAccuracy: recentAcc,
        trend,
      }
    })
}

// ─────────────────────────────────────────────────────────────────────────────
// B_t^i: Hành vi học tập — từ StudentSessionRecord
// ─────────────────────────────────────────────────────────────────────────────

export type BehaviorProfile = {
  hasSessions: boolean
  totalSessions: number
  attendanceRate: number     // %
  avgFocus: number           // 1–5 scale → normalize 0–100
  avgParticipation: number
  avgComprehension: number
  avgDiscipline: number
  avgHwScore: number         // % bài tập về nhà
  speakingAvg: number        // số lần phát biểu TB mỗi buổi
  behaviorScore: number      // 0–100 composite
  focusTrend: 'improving' | 'stable' | 'declining'
  hwTrend: 'improving' | 'stable' | 'declining'
}

export async function computeBt(userId: string): Promise<BehaviorProfile> {
  const records = await prisma.studentSessionRecord.findMany({
    where: { userId },
    select: {
      attendance: true,
      focusLevel: true,
      participationLevel: true,
      comprehension: true,
      discipline: true,
      speakingCount: true,
      hwScore: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  })

  if (records.length === 0) {
    return {
      hasSessions: false, totalSessions: 0, attendanceRate: 0,
      avgFocus: 0, avgParticipation: 0, avgComprehension: 0, avgDiscipline: 0,
      avgHwScore: 0, speakingAvg: 0, behaviorScore: 0,
      focusTrend: 'stable', hwTrend: 'stable',
    }
  }

  const attended = records.filter(r => r.attendance)
  const attendanceRate = Math.round((attended.length / records.length) * 100)

  const avg = (arr: (number | null)[]): number => {
    const valid = arr.filter((v): v is number => v !== null)
    return valid.length > 0 ? Math.round(valid.reduce((s, v) => s + v, 0) / valid.length * 10) / 10 : 0
  }
  const scale = (v: number, max = 5): number => Math.round((v / max) * 100)

  const avgFocusRaw      = avg(records.map(r => r.focusLevel))
  const avgParticipRaw   = avg(records.map(r => r.participationLevel))
  const avgComprehRaw    = avg(records.map(r => r.comprehension))
  const avgDisciplineRaw = avg(records.map(r => r.discipline))
  const avgHwScore       = avg(records.map(r => r.hwScore))
  const speakingAvg      = avg(records.map(r => r.speakingCount))

  // Trend: so sánh nửa đầu vs nửa sau
  const trendOf = (values: (number | null)[]): 'improving' | 'stable' | 'declining' => {
    const valid = values.filter((v): v is number => v !== null)
    if (valid.length < 4) return 'stable'
    const half = Math.floor(valid.length / 2)
    const early = valid.slice(0, half).reduce((s, v) => s + v, 0) / half
    const late  = valid.slice(half).reduce((s, v) => s + v, 0) / (valid.length - half)
    const diff = late - early
    return diff > 0.3 ? 'improving' : diff < -0.3 ? 'declining' : 'stable'
  }

  const focusTrend = trendOf(records.map(r => r.focusLevel))
  const hwTrend    = trendOf(records.map(r => r.hwScore))

  // Composite behavior score (0–100)
  const behaviorScore = Math.round(
    scale(avgFocusRaw) * 0.30 +
    scale(avgComprehRaw) * 0.25 +
    attendanceRate * 0.20 +
    scale(avgDisciplineRaw) * 0.15 +
    Math.min(100, speakingAvg * 10) * 0.10
  )

  return {
    hasSessions: true,
    totalSessions: records.length,
    attendanceRate,
    avgFocus: scale(avgFocusRaw),
    avgParticipation: scale(avgParticipRaw),
    avgComprehension: scale(avgComprehRaw),
    avgDiscipline: scale(avgDisciplineRaw),
    avgHwScore: Math.round(avgHwScore),
    speakingAvg: Math.round(speakingAvg * 10) / 10,
    behaviorScore,
    focusTrend,
    hwTrend,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// E_t^i: Gắn kết + Kỹ năng tư duy — từ StudentSessionRecord
// ─────────────────────────────────────────────────────────────────────────────

export type EngagementProfile = {
  hasSessions: boolean
  engagementScore: number    // 0–100
  engagementLevel: 'high' | 'medium' | 'low'
  // Kỹ năng tư duy (0–100)
  observation: number
  comparison: number
  classification: number
  patternRecognition: number
  expression: number
  thinkingScore: number      // composite 0–100
  // Cảm xúc
  dominantEmotion: string
  emotionPositiveRate: number  // % buổi có cảm xúc tích cực
  emotionTrend: 'improving' | 'stable' | 'declining'
}

export async function computeEt(userId: string): Promise<EngagementProfile> {
  const records = await prisma.studentSessionRecord.findMany({
    where: { userId },
    select: {
      focusLevel: true,
      participationLevel: true,
      observation: true,
      comparison: true,
      classification: true,
      patternRecognition: true,
      expression: true,
      emotionState: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  })

  if (records.length === 0) {
    return {
      hasSessions: false, engagementScore: 0, engagementLevel: 'low',
      observation: 0, comparison: 0, classification: 0,
      patternRecognition: 0, expression: 0, thinkingScore: 0,
      dominantEmotion: 'neutral', emotionPositiveRate: 0, emotionTrend: 'stable',
    }
  }

  const avg = (arr: (number | null)[]): number => {
    const valid = arr.filter((v): v is number => v !== null)
    return valid.length > 0 ? Math.round(valid.reduce((s, v) => s + v, 0) / valid.length * 10) / 10 : 0
  }
  const scale = (v: number, max = 5): number => Math.round((v / max) * 100)

  const obsRaw    = avg(records.map(r => r.observation))
  const cmpRaw    = avg(records.map(r => r.comparison))
  const clsRaw    = avg(records.map(r => r.classification))
  const patRaw    = avg(records.map(r => r.patternRecognition))
  const expRaw    = avg(records.map(r => r.expression))
  const focusRaw  = avg(records.map(r => r.focusLevel))
  const participRaw = avg(records.map(r => r.participationLevel))

  const thinkingScore = Math.round(
    (scale(obsRaw) + scale(cmpRaw) + scale(clsRaw) + scale(patRaw) + scale(expRaw)) / 5
  )

  // Engagement = tổng hợp focus + participation + thinking
  const engagementScore = Math.round(
    scale(focusRaw) * 0.35 +
    scale(participRaw) * 0.30 +
    thinkingScore * 0.35
  )
  const engagementLevel = engagementScore >= 65 ? 'high' : engagementScore >= 35 ? 'medium' : 'low'

  // Cảm xúc
  const emotionCounts: Record<string, number> = {}
  for (const r of records) {
    if (r.emotionState) emotionCounts[r.emotionState] = (emotionCounts[r.emotionState] ?? 0) + 1
  }
  const dominantEmotion = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'neutral'
  const positiveEmotions = ['great', 'good']
  const positiveCount = records.filter(r => r.emotionState && positiveEmotions.includes(r.emotionState)).length
  const emotionPositiveRate = Math.round((positiveCount / records.length) * 100)

  // Emotion trend
  const emotionTrend = (() => {
    const withEmotion = records.filter(r => r.emotionState)
    if (withEmotion.length < 4) return 'stable' as const
    const scoreMap: Record<string, number> = { great: 5, good: 4, neutral: 3, tired: 2, frustrated: 1 }
    const scores = withEmotion.map(r => scoreMap[r.emotionState!] ?? 3)
    const half = Math.floor(scores.length / 2)
    const earlyAvg = scores.slice(0, half).reduce((s, v) => s + v, 0) / half
    const lateAvg  = scores.slice(half).reduce((s, v) => s + v, 0) / (scores.length - half)
    const diff = lateAvg - earlyAvg
    return diff > 0.4 ? 'improving' : diff < -0.4 ? 'declining' : 'stable'
  })()

  return {
    hasSessions: true,
    engagementScore,
    engagementLevel,
    observation: scale(obsRaw),
    comparison: scale(cmpRaw),
    classification: scale(clsRaw),
    patternRecognition: scale(patRaw),
    expression: scale(expRaw),
    thinkingScore,
    dominantEmotion,
    emotionPositiveRate,
    emotionTrend,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SRL_t^i: Năng lực tự học — tích hợp cả Answer + SessionRecord
// ─────────────────────────────────────────────────────────────────────────────

export async function computeSRL(userId: string): Promise<{
  srlScore: number
  srlLevel: 'high' | 'medium' | 'low'
  srlLabel: string
  breadthScore: number
  consistencyScore: number
  initiativeScore: number
  selfRegulationScore: number  // Mới: từ session data
  details: string
}> {
  const [answers, allSubjects, aiSets, sessionRecords] = await Promise.all([
    prisma.studentAnswer.findMany({
      where: { userId },
      select: { subjectId: true, isCorrect: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.subject.count(),
    prisma.homeworkSet.count({ where: { isAIGenerated: true, aiGeneratorId: userId } }),
    prisma.studentSessionRecord.findMany({
      where: { userId },
      select: { attendance: true, hwScore: true, discipline: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    }),
  ])

  if (answers.length === 0 && sessionRecords.length === 0) {
    return { srlScore: 0, srlLevel: 'low', srlLabel: 'Chưa có dữ liệu', breadthScore: 0, consistencyScore: 0, initiativeScore: 0, selfRegulationScore: 0, details: 'Chưa làm bài' }
  }

  // 1. Breadth (đa dạng chủ đề)
  const uniqueSubjects = new Set(answers.map(a => a.subjectId)).size
  const breadthScore = allSubjects > 0 ? Math.min(100, Math.round((uniqueSubjects / allSubjects) * 100)) : 0

  // 2. Consistency (đều đặn — từ answer data)
  let consistencyScore = 0
  if (answers.length > 0) {
    const daySet = new Set(answers.map(a => a.createdAt.toISOString().slice(0, 10))).size
    const totalDays = answers.length >= 2
      ? Math.max(1, Math.round((answers[answers.length - 1].createdAt.getTime() - answers[0].createdAt.getTime()) / (1000 * 3600 * 24)))
      : 1
    consistencyScore = Math.min(100, Math.round((daySet / totalDays) * 100))
  }

  // 3. Initiative (chủ động làm bài AI)
  const initiativeScore = Math.min(100, aiSets * 20)

  // 4. Self-regulation (MỚI: từ session records — ý thức, BTVN, đi học đều)
  let selfRegulationScore = 0
  if (sessionRecords.length > 0) {
    const attended = sessionRecords.filter(r => r.attendance).length
    const attendRate = attended / sessionRecords.length
    const avgHw = (() => {
      const valid = sessionRecords.filter(r => r.hwScore !== null).map(r => r.hwScore as number)
      return valid.length > 0 ? valid.reduce((s, v) => s + v, 0) / valid.length : 0
    })()
    const avgDiscipline = (() => {
      const valid = sessionRecords.filter(r => r.discipline !== null).map(r => r.discipline as number)
      return valid.length > 0 ? valid.reduce((s, v) => s + v, 0) / valid.length : 3
    })()
    selfRegulationScore = Math.round(
      attendRate * 100 * 0.40 +
      avgHw * 0.35 +
      (avgDiscipline / 5) * 100 * 0.25
    )
  }

  // SRL tổng hợp (có tính session nếu có)
  const hasSessions = sessionRecords.length > 0
  const srlScore = hasSessions
    ? Math.round(breadthScore * 0.25 + consistencyScore * 0.30 + initiativeScore * 0.15 + selfRegulationScore * 0.30)
    : Math.round(breadthScore * 0.40 + consistencyScore * 0.40 + initiativeScore * 0.20)

  const srlLevel = srlScore >= 60 ? 'high' : srlScore >= 30 ? 'medium' : 'low'
  const srlLabel =
    srlLevel === 'high' ? 'Tự chủ cao — học chủ động, đa dạng, đều đặn' :
    srlLevel === 'medium' ? 'Tự chủ trung bình — cần hỗ trợ định hướng' :
    'Tự chủ thấp — cần hướng dẫn chặt chẽ'

  return {
    srlScore, srlLevel, srlLabel,
    breadthScore, consistencyScore, initiativeScore, selfRegulationScore,
    details: `CĐ: ${uniqueSubjects}/${allSubjects} · Ngày học: ${new Set(answers.map(a => a.createdAt.toISOString().slice(0,10))).size} · Bài AI: ${aiSets} · Sessions: ${sessionRecords.length}`,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// getA2PLMContext: lấy toàn bộ context cho AI routes (NÂNG CẤP)
// ─────────────────────────────────────────────────────────────────────────────

export async function getA2PLMContext(userId: string, req: NextRequest) {
  const [profile, srl, bt, et] = await Promise.all([
    prisma.learnerProfile.findUnique({ where: { userId } }).catch(() => null),
    computeSRL(userId),
    computeBt(userId),
    computeEt(userId),
  ])

  const context = extractLearningContext(req)

  let daysToExam: number | null = null
  if (profile?.targetDate) {
    daysToExam = Math.max(0, Math.round((profile.targetDate.getTime() - Date.now()) / (1000 * 3600 * 24)))
  }

  return { profile, srl, context, daysToExam, bt, et }
}

// ─────────────────────────────────────────────────────────────────────────────
// formatA2PLMContext: format Z_t^i đầy đủ cho GPT prompt
// ─────────────────────────────────────────────────────────────────────────────

export function formatA2PLMContext(
  profile: any,
  srl: Awaited<ReturnType<typeof computeSRL>>,
  context: ReturnType<typeof extractLearningContext>,
  daysToExam: number | null,
  bt?: BehaviorProfile,
  et?: EngagementProfile,
): string {
  const lines: string[] = []

  // P_i — Hồ sơ người học
  if (profile) {
    lines.push(`HỒ SƠ NGƯỜI HỌC (P_i):`)
    lines.push(`- Trình độ nền: ${profile.backgroundLevel === 'BEGINNER' ? 'Mới bắt đầu' : profile.backgroundLevel === 'INTERMEDIATE' ? 'Trung bình' : 'Khá'}`)
    lines.push(`- Phong cách học: ${profile.learningStyle === 'VISUAL' ? 'Trực quan' : profile.learningStyle === 'READING' ? 'Đọc hiểu' : profile.learningStyle === 'KINESTHETIC' ? 'Thực hành' : 'Đa dạng'}`)
    lines.push(`- Năng lực tự học: ${profile.selfStudyCapacity === 'HIGH' ? 'Cao' : profile.selfStudyCapacity === 'MEDIUM' ? 'Trung bình' : 'Thấp'}`)
    lines.push(`- Phụ huynh đồng hành: ${profile.parentInvolvement === 'HIGH' ? 'Cao' : profile.parentInvolvement === 'MEDIUM' ? 'Vừa phải' : 'Ít'}`)
    lines.push(`- Giờ học/tuần: ${profile.weeklyHours}h`)
    if (profile.additionalNotes) lines.push(`- Ghi chú PH: ${profile.additionalNotes}`)
  } else {
    lines.push(`HỒ SƠ NGƯỜI HỌC (P_i): Chưa thiết lập`)
  }

  // G_i — Mục tiêu học tập
  lines.push(`\nMỤC TIÊU HỌC TẬP (G_i):`)
  if (profile) {
    lines.push(`- Mục tiêu: ${profile.targetGoal === 'SCHOLARSHIP' ? 'Học bổng lớp 1' : profile.targetGoal === 'FOUNDATION' ? 'Củng cố nền' : 'Nâng cao'}`)
    if (profile.targetSchool) lines.push(`- Trường: ${profile.targetSchool}`)
    if (daysToExam !== null) lines.push(`- Còn lại: ${daysToExam} ngày đến kỳ thi`)
  } else {
    lines.push(`- Mục tiêu: Học bổng lớp 1 (mặc định)`)
  }

  // B_t^i — Hành vi học tập (từ SessionRecord)
  if (bt?.hasSessions) {
    lines.push(`\nHÀNH VI HỌC TẬP (B_t^i) — ${bt.totalSessions} buổi học:`)
    lines.push(`- Tỷ lệ đi học: ${bt.attendanceRate}%`)
    lines.push(`- Tập trung: ${bt.avgFocus}/100 (xu hướng: ${bt.focusTrend === 'improving' ? '↑ tăng' : bt.focusTrend === 'declining' ? '↓ giảm' : '→ ổn định'})`)
    lines.push(`- Tham gia: ${bt.avgParticipation}/100 | Phát biểu: ${bt.speakingAvg} lần/buổi`)
    lines.push(`- Hiểu bài: ${bt.avgComprehension}/100 | Ý thức: ${bt.avgDiscipline}/100`)
    lines.push(`- BTVN: ${bt.avgHwScore}% (xu hướng: ${bt.hwTrend === 'improving' ? '↑ tốt hơn' : bt.hwTrend === 'declining' ? '↓ sa sút' : '→ ổn định'})`)
    lines.push(`- Điểm hành vi tổng hợp: ${bt.behaviorScore}/100`)
  } else {
    lines.push(`\nHÀNH VI HỌC TẬP (B_t^i): Chưa có dữ liệu buổi học`)
  }

  // E_t^i — Gắn kết + Kỹ năng tư duy (từ SessionRecord)
  if (et?.hasSessions) {
    lines.push(`\nGẮN KẾT & KỸ NĂNG TƯ DUY (E_t^i):`)
    lines.push(`- Điểm gắn kết: ${et.engagementScore}/100 (${et.engagementLevel === 'high' ? 'Cao' : et.engagementLevel === 'medium' ? 'Trung bình' : 'Thấp'})`)
    lines.push(`- Kỹ năng tư duy: Quan sát ${et.observation} | So sánh ${et.comparison} | Phân loại ${et.classification} | Quy luật ${et.patternRecognition} | Diễn đạt ${et.expression}`)
    lines.push(`- Điểm tư duy tổng hợp: ${et.thinkingScore}/100`)
    lines.push(`- Cảm xúc chủ đạo: ${et.dominantEmotion} | Buổi tích cực: ${et.emotionPositiveRate}% (xu hướng: ${et.emotionTrend === 'improving' ? '↑ tốt hơn' : et.emotionTrend === 'declining' ? '↓ xấu đi' : '→ ổn định'})`)
  } else {
    lines.push(`\nGẮN KẾT & KỸ NĂNG TƯ DUY (E_t^i): Chưa có dữ liệu buổi học`)
  }

  // SRL_t^i — Năng lực tự học
  lines.push(`\nNĂNG LỰC TỰ HỌC (SRL_t^i): ${srl.srlScore}/100 — ${srl.srlLabel}`)
  lines.push(`- Chi tiết: ${srl.details}`)
  if (srl.selfRegulationScore > 0) lines.push(`- Tự điều chỉnh (từ buổi học): ${srl.selfRegulationScore}/100`)

  // C_t^i — Ngữ cảnh học tập
  lines.push(`\nNGỮ CẢNH HỌC TẬP (C_t^i):`)
  lines.push(`- Thiết bị: ${context.device === 'mobile' ? 'Di động' : context.device === 'tablet' ? 'Máy tính bảng' : 'Máy tính'}`)
  lines.push(`- Thời điểm: ${context.timeOfDay}`)
  lines.push(`- Lưu ý: ${context.contextNote}`)

  return lines.join('\n')
}

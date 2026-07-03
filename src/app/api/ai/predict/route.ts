import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { openai, AVAB_SYSTEM } from '@/lib/openai'
import { prisma } from '@/lib/prisma'
import { getA2PLMContext, formatA2PLMContext, computeKtBKT } from '@/lib/a2plm'
import { getAICache, canRefresh, saveAICache } from '@/lib/ai-cache'

/**
 * Bài toán 2: Dự báo tiến trình học tập — A2PLM đầy đủ
 * Y_t+1^i = Ψ(Z_t^i, X_1:t^i, G_k, R_t)
 * Output: Y = (A_t+1, Eng_t+1, Risk_t+1, Load_t+1, Ready_t+1)
 * π* = argmax E[Σ γᵗ(μ₁ΔK + μ₂SRL + μ₃ENG + μ₄RET - μ₅CL - μ₆COST)]
 */
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 })

  try {
    const userId = (session.user as any).id

    const force = req.nextUrl.searchParams.get('force') === '1'
    if (!force) {
      const cached = await getAICache(userId, 'predict')
      if (cached.cached) return NextResponse.json({ success: true, data: cached.data, fromCache: true, refreshedAt: cached.refreshedAt })
      return NextResponse.json({ success: true, data: null })
    }
    const isInit = req.nextUrl.searchParams.get('init') === '1'
    if (!isInit) {
      const check = await canRefresh(userId)
      if (!check.allowed) return NextResponse.json({ success: false, error: 'refresh_limit', nextAt: check.nextAt, daysLeft: check.daysLeft }, { status: 429 })
    }

    // Z_t^i đầy đủ (bao gồm B_t^i và E_t^i)
    const { profile, srl, context, daysToExam, bt, et } = await getA2PLMContext(userId, req)

    const [answers, allSubjects] = await Promise.all([
      prisma.studentAnswer.findMany({
        where: { userId },
        select: { subjectId: true, isCorrect: true, score: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.subject.findMany({ select: { id: true, name: true, icon: true } }),
    ])

    const totalSubjects = allSubjects.length
    const totalAnswered = answers.length
    const totalCorrect  = answers.filter(a => a.isCorrect).length
    const overallAccuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0
    const subjectsDone  = new Set(answers.map(a => a.subjectId)).size
    const coveragePct   = Math.round((subjectsDone / Math.max(totalSubjects, 1)) * 100)
    const totalScore    = answers.reduce((sum, a) => sum + a.score, 0)

    // Recent vs Early accuracy (trend)
    const desc = [...answers].reverse() // desc order
    const recent50 = desc.slice(0, Math.min(50, desc.length))
    const early50  = desc.slice(-Math.min(50, desc.length))
    const recentAccuracy = recent50.length > 0 ? Math.round(recent50.filter(a => a.isCorrect).length / recent50.length * 100) : 0
    const earlyAccuracy  = early50.length > 0 ? Math.round(early50.filter(a => a.isCorrect).length / early50.length * 100) : 0
    const improvement = recentAccuracy - earlyAccuracy

    // K_t^i BKT per subject
    const bktProfiles = computeKtBKT(answers, allSubjects, profile?.backgroundLevel)
    const avgPMastery = bktProfiles.length > 0
      ? Math.round(bktProfiles.reduce((s, k) => s + k.pMastery, 0) / bktProfiles.length * 100)
      : 0
    const improvingSubjects  = bktProfiles.filter(k => k.trend === 'improving').length
    const decliningSubjects  = bktProfiles.filter(k => k.trend === 'declining').length

    // ── A_t+1: Xác suất thành công (tích hợp BKT + B_t^i + E_t^i) ──────────
    let probability = 0
    probability += Math.min(40, avgPMastery * 0.40)           // K_t^i BKT
    probability += Math.min(20, coveragePct * 0.20)            // độ phủ CĐ
    probability += Math.min(10, Math.max(0, improvement) * 0.5) // trend
    probability += Math.min(10, totalAnswered * 0.05)           // kinh nghiệm
    // B_t^i contribution
    if (bt.hasSessions) probability += Math.min(10, bt.behaviorScore * 0.10)
    // E_t^i contribution
    if (et.hasSessions) probability += Math.min(10, et.engagementScore * 0.10)
    // G_i deadline pressure
    if (daysToExam !== null && daysToExam < 30 && overallAccuracy < 60) probability *= 0.88
    probability = Math.round(Math.min(98, probability))

    // ── Eng_t+1: Rủi ro gắn kết (từ E_t^i nếu có, fallback coverage) ────────
    const engagementRisk = et.hasSessions
      ? (et.engagementScore < 35 ? 'high' : et.engagementScore < 60 ? 'medium' : 'low')
      : (coveragePct < 30 ? 'high' : coveragePct < 60 ? 'medium' : 'low')

    // ── Load_t+1: Tải nhận thức (từ B_t^i nếu có) ────────────────────────────
    const cognitiveLoad = bt.hasSessions
      ? (bt.avgComprehension < 40 ? 'high' : bt.avgComprehension < 65 ? 'medium' : 'low')
      : (recentAccuracy < 40 ? 'high' : recentAccuracy < 65 ? 'medium' : 'low')

    // ── Ready_t+1: Mức sẵn sàng học tiếp ────────────────────────────────────
    const readinessScore = bt.hasSessions
      ? Math.round(avgPMastery * 0.40 + bt.avgComprehension * 0.30 + Math.min(100, Math.max(0, improvement + 50)) * 0.30)
      : Math.round(overallAccuracy * 0.5 + coveragePct * 0.3 + Math.min(100, improvement + 50) * 0.2)
    const readinessToAdvance = readinessScore >= 70 ? 'ready' : readinessScore >= 45 ? 'borderline' : 'not_ready'

    // ── RET: Khả năng duy trì (từ SRL + B_t^i) ────────────────────────────────
    const retentionSignal = bt.hasSessions
      ? (bt.attendanceRate >= 80 && srl.srlLevel !== 'low' ? 'strong' : bt.attendanceRate >= 60 ? 'moderate' : 'weak')
      : (srl.srlLevel === 'high' ? 'strong' : srl.srlLevel === 'medium' ? 'moderate' : 'weak')

    const a2plmText = formatA2PLMContext(profile, srl, context, daysToExam, bt, et)

    const prompt = `${a2plmText}

DỮ LIỆU DỰ BÁO — Y_t+1^i = Ψ(Z_t^i, X_1:t^i, G_k):

K_t^i (BKT): P(mastery) TB = ${avgPMastery}% | ${improvingSubjects} CĐ đang tiến bộ, ${decliningSubjects} CĐ đang giảm
Answer stats: Độ chính xác ${overallAccuracy}% | Gần đây ${recentAccuracy}% | Cải thiện ${improvement > 0 ? '+' : ''}${improvement}%
Độ phủ: ${subjectsDone}/${totalSubjects} CĐ (${coveragePct}%)

Vector Y_t+1 ước tính:
- A_t+1 (xác suất thành công): ${probability}%
- Eng_t+1 (rủi ro gắn kết): ${engagementRisk}
- Load_t+1 (tải nhận thức): ${cognitiveLoad}
- Ready_t+1 (sẵn sàng học tiếp): ${readinessToAdvance}
- RET (duy trì tiến trình): ${retentionSignal}
${daysToExam !== null ? `\nKHẨN CẤP G_i: Còn ${daysToExam} ngày đến kỳ thi!` : ''}

Dự báo đa chiều theo framework π* = argmax E[Σ γᵗ(μ₁ΔK + μ₂SRL + μ₃ENG + μ₄RET - μ₅CL - μ₆COST)], JSON (không markdown):
{
  "probability": ${probability},
  "level": "Xuất sắc/Tốt/Trung bình/Cần cố gắng/Đang khởi đầu",
  "verdict": "Dự báo tổng hợp Y_t+1 (1-2 câu, ngôn ngữ sư phạm, tính đến G_i)",
  "successForecast": "Dự báo A_t+1: xác suất thành công bước tiếp",
  "engagementForecast": "Dự báo Eng_t+1: rủi ro gắn kết${et.hasSessions ? ' (dựa trên E_t^i thực tế)' : ''}",
  "cognitiveLoadForecast": "Dự báo Load_t+1: tải nhận thức${bt.hasSessions ? ' (dựa trên B_t^i)' : ''}",
  "retentionForecast": "Dự báo RET: khả năng duy trì tiến trình",
  "srlForecast": "Dự báo phát triển SRL_t^i trong 2–4 tuần tới",
  "readinessSignals": ["Tín hiệu sẵn sàng 1", "Tín hiệu 2"],
  "riskSignals": ["Tín hiệu rủi ro 1", "Tín hiệu 2"],
  "strongPoints": ["Điểm mạnh 1", "Điểm mạnh 2"],
  "gapAreas": ["Khoảng trống 1", "Khoảng trống 2"],
  "timeToReady": "Ước tính thời gian đạt 80%+ (có tính G_i deadline)",
  "actionPlan": ["Hành động ưu tiên 1", "Hành động 2", "Hành động 3"],
  "interventionUrgency": "immediate/soon/monitor",
  "parentNote": "Lời nhắn thực tế cho phụ huynh"
}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: AVAB_SYSTEM }, { role: 'user', content: prompt }],
      max_tokens: 600,
      temperature: 0.3,
    })

    const raw = completion.choices[0].message.content || '{}'
    const prediction = JSON.parse(raw.replace(/```json|```/g, '').trim())

    const responseData = {
      stats: { totalScore, overallAccuracy, subjectsDone, totalSubjects, coveragePct, totalAnswered, improvement, recentAccuracy },
      bkt: { avgPMastery, improvingSubjects, decliningSubjects },
      multiDimension: { engagementRisk, cognitiveLoad, readinessToAdvance, retentionSignal },
      srl,
      profile: profile ? { targetSchool: profile.targetSchool, targetGoal: profile.targetGoal, backgroundLevel: profile.backgroundLevel } : null,
      bt: bt.hasSessions ? { behaviorScore: bt.behaviorScore, attendanceRate: bt.attendanceRate, avgFocus: bt.avgFocus, focusTrend: bt.focusTrend } : null,
      et: et.hasSessions ? { engagementScore: et.engagementScore, thinkingScore: et.thinkingScore, emotionPositiveRate: et.emotionPositiveRate } : null,
      daysToExam,
      ...prediction,
      probability: prediction.probability ?? probability,
    }

    await saveAICache(userId, 'predict', responseData)
    return NextResponse.json({ success: true, data: responseData })
  } catch (err) {
    console.error('AI predict error:', err)
    return NextResponse.json({ success: false, error: 'AI không khả dụng' }, { status: 500 })
  }
}

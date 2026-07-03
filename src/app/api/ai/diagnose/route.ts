import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { openai, AVAB_SYSTEM } from '@/lib/openai'
import { prisma } from '@/lib/prisma'
import { getA2PLMContext, formatA2PLMContext, computeKtBKT } from '@/lib/a2plm'
import { getAICache, canRefresh, saveAICache } from '@/lib/ai-cache'

/**
 * Bài toán 1: Chẩn đoán trạng thái người học — A2PLM đầy đủ
 * Z_t^i = Φ(K_t^i [BKT], B_t^i [SessionRecord], E_t^i [SessionRecord], P_i, G_i, C_t^i)
 */
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 })

  try {
    const userId = (session.user as any).id

    // Cache check
    const force = req.nextUrl.searchParams.get('force') === '1'
    if (!force) {
      const cached = await getAICache(userId, 'diagnose')
      if (cached.cached) return NextResponse.json({ success: true, data: cached.data, fromCache: true, refreshedAt: cached.refreshedAt })
      return NextResponse.json({ success: true, data: null })
    }
    const isInit = req.nextUrl.searchParams.get('init') === '1'
    if (!isInit) {
      const check = await canRefresh(userId)
      if (!check.allowed) return NextResponse.json({ success: false, error: 'refresh_limit', nextAt: check.nextAt, daysLeft: check.daysLeft }, { status: 429 })
    }

    // Lấy A2PLM context đầy đủ — bao gồm B_t^i (bt) và E_t^i (et)
    const { profile, srl, context, daysToExam, bt, et } = await getA2PLMContext(userId, req)

    const [answers, allSubjects] = await Promise.all([
      prisma.studentAnswer.findMany({
        where: { userId },
        select: { subjectId: true, isCorrect: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.subject.findMany({ orderBy: { order: 'asc' }, select: { id: true, name: true, order: true, icon: true } }),
    ])

    if (answers.length === 0 && !bt.hasSessions) {
      const emptyData = { empty: true, message: 'Học viên đang bắt đầu hành trình. Hãy làm thử một số bài để AI có thể phân tích sâu hơn!', profile, srl }
      await saveAICache(userId, 'diagnose', emptyData)
      return NextResponse.json({ success: true, data: emptyData })
    }

    // ── K_t^i: BKT đúng công thức ─────────────────────────────────────────
    const knowledgeProfile = computeKtBKT(answers, allSubjects, profile?.backgroundLevel)
    const mastered    = knowledgeProfile.filter(k => k.masteryLevel === 'mastered')
    const developing  = knowledgeProfile.filter(k => k.masteryLevel === 'developing')
    const struggling  = knowledgeProfile.filter(k => ['struggling', 'at_risk'].includes(k.masteryLevel))

    // Bổ sung stats từ answer data
    const totalAnswered = answers.length
    const timeSpread = answers.length >= 2
      ? (answers[answers.length - 1].createdAt.getTime() - answers[0].createdAt.getTime()) / (1000 * 3600 * 24) : 0
    const avgPerDay = timeSpread > 0 ? (totalAnswered / timeSpread).toFixed(1) : totalAnswered.toString()
    const half = Math.floor(answers.length / 2)
    const earlyAcc = half > 0 ? Math.round(answers.slice(0, half).filter(a => a.isCorrect).length / half * 100) : 0
    const lateAcc  = half > 0 ? Math.round(answers.slice(half).filter(a => a.isCorrect).length / (answers.length - half) * 100) : 0
    const learningTrend = lateAcc - earlyAcc

    // Cognitive load từ answer data (nếu không có session)
    let maxConsecutiveWrong = 0, streak = 0
    for (const a of answers) {
      if (!a.isCorrect) { streak++; maxConsecutiveWrong = Math.max(maxConsecutiveWrong, streak) }
      else streak = 0
    }
    // Ưu tiên dùng session data cho cognitive load nếu có
    const cognitiveLoadLevel = bt.hasSessions
      ? (bt.avgComprehension < 40 ? 'high' : bt.avgComprehension < 65 ? 'medium' : 'low')
      : (maxConsecutiveWrong >= 6 ? 'high' : maxConsecutiveWrong >= 3 ? 'medium' : 'low')

    // Engagement: ưu tiên E_t^i từ session, fallback sang answer coverage
    const engagementLevel = et.hasSessions ? et.engagementLevel
      : (new Set(answers.map(a => a.subjectId)).size / Math.max(allSubjects.length, 1) >= 0.5 ? 'high' : 'medium')
    const engagementScore = et.hasSessions ? et.engagementScore
      : Math.min(100, Math.round((new Set(answers.map(a => a.subjectId)).size / Math.max(allSubjects.length, 1)) * 60 + (totalAnswered / 100) * 40))

    // ── Format Z_t^i đầy đủ cho GPT ──────────────────────────────────────
    const a2plmText = formatA2PLMContext(profile, srl, context, daysToExam, bt, et)

    const bktSummary = knowledgeProfile.length > 0
      ? knowledgeProfile.map(k => `${k.name}: P(L_t)=${k.pMastery} (${k.masteryLevel}, ${k.attempted} câu, trend: ${k.trend})`).join('\n  ')
      : 'Chưa có dữ liệu'

    const prompt = `${a2plmText}

DỮ LIỆU TRI THỨC — K_t^i (BKT Bayesian Knowledge Tracing):
${bktSummary}

TỔNG KẾT K_t^i:
- Nắm vững (P≥0.80): ${mastered.map(k => k.name).join(', ') || 'Chưa có'}
- Đang phát triển (0.55–0.79): ${developing.map(k => k.name).join(', ') || 'Chưa có'}
- Cần hỗ trợ (P<0.55): ${struggling.map(k => k.name).join(', ') || 'Chưa có'}

DỮ LIỆU BỔ SUNG (Answer-based):
- Tổng câu: ${totalAnswered} | TB ${avgPerDay} câu/ngày
- Xu hướng học tập: ${learningTrend > 0 ? '+' : ''}${learningTrend}%
- Tải nhận thức ước tính: ${cognitiveLoadLevel}

Dựa trên Z_t^i = Φ(K_t^i, B_t^i, E_t^i, P_i, G_i, C_t^i) ở trên, chẩn đoán trạng thái người học theo JSON (không markdown):
{
  "overallState": "Trạng thái tổng quan Z_t^i (ngôn ngữ sư phạm, tích hợp cả 5 thành phần)",
  "knowledgeSummary": "Phân tích K_t^i: bản đồ BKT, xu hướng, điểm mạnh/yếu",
  "behaviorInsight": "Phân tích B_t^i: hành vi học tập, mẫu đáng chú ý${bt.hasSessions ? ', so sánh buổi học với tự học' : ''}",
  "engagementAnalysis": "Phân tích E_t^i: gắn kết, kỹ năng tư duy, cảm xúc học tập",
  "cognitiveProfile": "Nhận xét tải nhận thức — phù hợp lứa tuổi 5–6 tuổi",
  "contextualFactors": "Yếu tố C_t^i cần lưu ý (thiết bị, thời điểm, điều kiện)",
  "srlInsight": "Đánh giá SRL_t^i và hướng phát triển năng lực tự học",
  "profileAlignment": "Độ phù hợp năng lực hiện tại với mục tiêu G_i",
  "diagnosticConclusion": "Kết luận Z_t^i tổng hợp — cơ sở ra quyết định sư phạm"
}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: AVAB_SYSTEM }, { role: 'user', content: prompt }],
      max_tokens: 700,
      temperature: 0.3,
    })

    const raw = completion.choices[0].message.content || '{}'
    const aiDiagnosis = JSON.parse(raw.replace(/```json|```/g, '').trim())

    const responseData = {
      // K_t^i — BKT
      knowledgeProfile,
      masteredCount: mastered.length,
      developingCount: developing.length,
      strugglingCount: struggling.length,
      totalSubjects: allSubjects.length,
      // B_t^i — Hành vi
      behavior: {
        totalAnswered, avgPerDay, learningTrend,
        learningTrendLabel: learningTrend > 5 ? 'Đang tiến bộ tốt' : learningTrend < -5 ? 'Có dấu hiệu chững lại' : 'Ổn định',
        // Session data
        behaviorScore: bt.behaviorScore,
        attendanceRate: bt.attendanceRate,
        avgFocus: bt.avgFocus,
        avgComprehension: bt.avgComprehension,
        focusTrend: bt.focusTrend,
        hwTrend: bt.hwTrend,
        hasSessions: bt.hasSessions,
      },
      // E_t^i — Gắn kết + Tư duy
      engagement: {
        level: engagementLevel,
        score: engagementScore,
        thinkingScore: et.thinkingScore,
        dominantEmotion: et.dominantEmotion,
        emotionPositiveRate: et.emotionPositiveRate,
        hasSessions: et.hasSessions,
      },
      cognitive: { load: cognitiveLoadLevel, maxConsecutiveWrong },
      // A2PLM context
      srl, profile, bt, et,
      context: { device: context.device, timeOfDay: context.timeOfDay, note: context.contextNote },
      daysToExam,
      ...aiDiagnosis,
    }

    await saveAICache(userId, 'diagnose', responseData)
    return NextResponse.json({ success: true, data: responseData })
  } catch (err) {
    console.error('AI diagnose error:', err)
    return NextResponse.json({ success: false, error: 'AI không khả dụng' }, { status: 500 })
  }
}

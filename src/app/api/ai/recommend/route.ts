import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { openai, AVAB_SYSTEM } from '@/lib/openai'
import { prisma } from '@/lib/prisma'
import { getA2PLMContext, formatA2PLMContext } from '@/lib/a2plm'
import { getAICache, canRefresh, saveAICache } from '@/lib/ai-cache'

/**
 * Bài toán 4: Khuyến nghị can thiệp sư phạm — Aware Recommendation
 * Tích hợp đầy đủ: Z_t^i × I_t^i = (L, M, T, R, S)
 * Aware = context (C_t^i) × profile (P_i) × behavior (B_t^i) × engagement (E_t^i) × SRL
 */
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 })

  try {
    const userId = (session.user as any).id
    const subjectId = new URL(req.url).searchParams.get('subjectId')

    const force = req.nextUrl.searchParams.get('force') === '1'
    if (!force) {
      const cached = await getAICache(userId, 'recommend')
      if (cached.cached) return NextResponse.json({ success: true, data: cached.data, fromCache: true, refreshedAt: cached.refreshedAt })
      return NextResponse.json({ success: true, data: null })
    }
    const isInit = req.nextUrl.searchParams.get('init') === '1'
    if (!isInit) {
      const check = await canRefresh(userId)
      if (!check.allowed) return NextResponse.json({ success: false, error: 'refresh_limit', nextAt: check.nextAt, daysLeft: check.daysLeft }, { status: 429 })
    }

    // Z_t^i đầy đủ — bao gồm B_t^i và E_t^i
    const { profile, srl, context, daysToExam, bt, et } = await getA2PLMContext(userId, req)

    // Câu sai gần đây — cho R_t^i (tài nguyên)
    const [wrongAnswers, subjectScores, allAnswers] = await Promise.all([
      prisma.studentAnswer.findMany({
        where: { userId, isCorrect: false, ...(subjectId ? { subjectId } : {}) },
        include: { question: { select: { content: true, correctAnswer: true, order: true } } },
        orderBy: { createdAt: 'desc' },
        take: 8,
      }),
      prisma.studentAnswer.groupBy({
        by: ['subjectId'], where: { userId },
        _avg: { score: true }, _count: { score: true },
      }),
      prisma.studentAnswer.findMany({
        where: { userId }, select: { isCorrect: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      }),
    ])

    const totalAcc = allAnswers.length > 0
      ? Math.round(allAnswers.filter(a => a.isCorrect).length / allAnswers.length * 100) : 0

    // Xác định mức hỗ trợ tích hợp B_t^i + E_t^i
    let supportScore = 0
    supportScore += totalAcc < 50 ? 30 : totalAcc < 70 ? 20 : 10
    if (bt.hasSessions) {
      supportScore += bt.avgComprehension < 40 ? 25 : bt.avgComprehension < 65 ? 15 : 5
      supportScore += bt.avgFocus < 40 ? 15 : bt.avgFocus < 65 ? 8 : 3
    }
    if (et.hasSessions) {
      supportScore += et.engagementScore < 35 ? 20 : et.engagementScore < 60 ? 12 : 4
      supportScore += et.emotionPositiveRate < 40 ? 10 : et.emotionPositiveRate < 70 ? 5 : 0
    }
    const supportLevel = supportScore >= 55 ? 'high' : supportScore >= 30 ? 'medium' : 'low'

    // Chuyên đề cần tập trung (từ subjectScores)
    const weakSubjectIds = subjectScores.filter(s => (s._avg.score ?? 0) < 0.6).map(s => s.subjectId)
    const weakSubjectNames = weakSubjectIds.length > 0
      ? await prisma.subject.findMany({ where: { id: { in: weakSubjectIds.slice(0, 3) } }, select: { name: true, icon: true } })
      : []

    // Kỹ năng tư duy yếu nhất từ E_t^i (để gợi ý bài tập phù hợp)
    const thinkingWeaknesses = et.hasSessions ? (() => {
      const skills = [
        { name: 'Quan sát', score: et.observation },
        { name: 'So sánh', score: et.comparison },
        { name: 'Phân loại', score: et.classification },
        { name: 'Quy luật', score: et.patternRecognition },
        { name: 'Diễn đạt', score: et.expression },
      ]
      return skills.filter(s => s.score < 60).sort((a, b) => a.score - b.score).slice(0, 2).map(s => s.name)
    })() : []

    const a2plmText = formatA2PLMContext(profile, srl, context, daysToExam, bt, et)

    const prompt = `${a2plmText}

BỐI CẢNH AWARE RECOMMENDATION:
- Độ chính xác: ${totalAcc}% | Mức hỗ trợ tổng hợp: ${supportLevel} (score=${supportScore})
${wrongAnswers.length > 0 ? `- Lỗi sai điển hình:\n${wrongAnswers.slice(0,4).map(a => `  · "${a.question.content}" (đúng: ${a.question.correctAnswer})`).join('\n')}` : ''}
- Chuyên đề yếu: ${weakSubjectNames.map(s => s.name).join(', ') || 'Chưa xác định'}
${thinkingWeaknesses.length > 0 ? `- Kỹ năng tư duy cần tăng (E_t^i): ${thinkingWeaknesses.join(', ')}` : ''}
${bt.hasSessions ? `- Hành vi B_t^i: Focus=${bt.avgFocus}/100, Hiểu bài=${bt.avgComprehension}/100, BTVN=${bt.avgHwScore}%, xu hướng focus ${bt.focusTrend}` : ''}
${et.hasSessions ? `- Gắn kết E_t^i: ${et.engagementScore}/100, Tư duy=${et.thinkingScore}/100, Cảm xúc tích cực=${et.emotionPositiveRate}%` : ''}

NHIỆM VỤ: Khuyến nghị can thiệp sư phạm AWARE — tích hợp Z_t^i × C_t^i × I_t^i.
Phong cách học P_i: ${profile?.learningStyle ?? 'MIXED'} | PH đồng hành: ${profile?.parentInvolvement ?? 'MEDIUM'} | SRL: ${srl.srlLevel}(${srl.srlScore}/100)

JSON (không markdown):
{
  "teachingStrategy": "Chiến lược sư phạm M_t^i — phù hợp learningStyle, B_t^i và E_t^i",
  "supportLevel": "${supportLevel}",
  "supportGuidance": "Hướng dẫn thực hiện mức hỗ trợ — tính đến B_t^i và E_t^i",
  "exercises": [
    {
      "type": "Loại bài tập (gắn kỹ năng tư duy cần tăng)",
      "description": "Mô tả — phù hợp learningStyle và kỹ năng yếu nhất",
      "difficulty": "Dễ/Trung bình/Khó",
      "example": "Ví dụ mẫu cụ thể",
      "pedagogicalReason": "Lý do sư phạm — liên quan lỗi sai + E_t^i"
    }
  ],
  "srlDevelopmentActions": ["Hành động SRL 1 (từ mức ${srl.srlLevel})", "Hành động SRL 2"],
  "selfStudyStrategy": "S_t^i — chiến lược tự học phù hợp B_t^i và SRL",
  "resourceRecommendations": ["R_t^i tài nguyên 1 — phù hợp learningStyle", "Tài nguyên 2"],
  "teacherActions": ["T_t^i hành động GV 1 — dựa trên B_t^i", "Hành động 2"],
  "parentActions": ["Hành động PH 1 — phù hợp parentInvolvement", "Hành động 2"],
  "contextAdaptations": "Điều chỉnh C_t^i: ${context.timeOfDay} trên ${context.device}${et.hasSessions && et.dominantEmotion !== 'neutral' ? ` | Cảm xúc chủ đạo: ${et.dominantEmotion}` : ''}",
  "dailyGoal": "Mục tiêu hôm nay — tính deadline G_i${daysToExam !== null ? ` (còn ${daysToExam} ngày)` : ''}",
  "motivation": "Câu động viên cá nhân hóa — phù hợp trạng thái cảm xúc hiện tại"
}
Gợi ý 3 bài tập đa dạng, ưu tiên kỹ năng tư duy yếu nhất.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: AVAB_SYSTEM }, { role: 'user', content: prompt }],
      max_tokens: 650,
      temperature: 0.5,
    })

    const raw = completion.choices[0].message.content || '{}'
    const recommendations = JSON.parse(raw.replace(/```json|```/g, '').trim())

    const responseData = {
      ...recommendations,
      supportLevel,
      supportScore,
      srl,
      profile: profile ? { learningStyle: profile.learningStyle, parentInvolvement: profile.parentInvolvement, targetGoal: profile.targetGoal } : null,
      bt: bt.hasSessions ? { behaviorScore: bt.behaviorScore, avgFocus: bt.avgFocus, avgComprehension: bt.avgComprehension, avgHwScore: bt.avgHwScore } : null,
      et: et.hasSessions ? { engagementScore: et.engagementScore, thinkingScore: et.thinkingScore, thinkingWeaknesses, emotionPositiveRate: et.emotionPositiveRate } : null,
      daysToExam,
    }
    await saveAICache(userId, 'recommend', responseData)
    return NextResponse.json({ success: true, data: responseData })
  } catch (err) {
    console.error('AI recommend error:', err)
    return NextResponse.json({ success: false, error: 'AI không khả dụng' }, { status: 500 })
  }
}

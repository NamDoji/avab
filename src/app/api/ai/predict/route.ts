import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { openai, AVAB_SYSTEM } from '@/lib/openai'
import { prisma } from '@/lib/prisma'
import { getA2PLMContext, formatA2PLMContext } from '@/lib/a2plm'

// Bài toán 2: Dự báo tiến trình học tập — A2PLM đầy đủ
// π* = argmax_π E[Σ γᵗ(μ₁ΔK + μ₂SRL + μ₃ENG + μ₄RET - μ₅CL - μ₆COST)]
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 })

  try {
    const userId = (session.user as any).id
    const { profile, srl, context, daysToExam } = await getA2PLMContext(userId, req)

    const [answers, totalSubjects] = await Promise.all([
      prisma.studentAnswer.findMany({
        where: { userId },
        select: { subjectId: true, isCorrect: true, score: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.subject.count(),
    ])

    const totalAnswered = answers.length
    const totalCorrect = answers.filter(a => a.isCorrect).length
    const overallAccuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0
    const subjectsDone = new Set(answers.map(a => a.subjectId)).size
    const coveragePct = Math.round((subjectsDone / totalSubjects) * 100)
    const totalScore = answers.reduce((sum, a) => sum + a.score, 0)

    const recent = answers.slice(0, Math.min(50, answers.length))
    const early = answers.slice(-Math.min(50, answers.length))
    const recentAccuracy = recent.length > 0 ? Math.round(recent.filter(a => a.isCorrect).length / recent.length * 100) : 0
    const earlyAccuracy = early.length > 0 ? Math.round(early.filter(a => a.isCorrect).length / early.length * 100) : 0
    const improvement = recentAccuracy - earlyAccuracy

    // Tính xác suất đỗ
    let probability = 0
    probability += Math.min(overallAccuracy * 0.4, 40)
    probability += Math.min(coveragePct * 0.3, 30)
    probability += Math.min(totalAnswered * 0.1, 15)
    probability += Math.max(0, Math.min(improvement * 0.5, 15))
    // Điều chỉnh theo G_i: nếu có deadline gần → penalty nếu chưa sẵn sàng
    if (daysToExam !== null && daysToExam < 30 && overallAccuracy < 60) probability *= 0.9
    probability = Math.round(Math.min(probability, 98))

    // Chỉ số đa chiều
    const engagementRiskScore = Math.max(0, 100 - coveragePct - Math.min(totalAnswered / 2, 30))
    const engagementRisk = engagementRiskScore > 60 ? 'high' : engagementRiskScore > 30 ? 'medium' : 'low'

    const recentAnswers = answers.slice(0, 10)
    let streak = 0, maxStreak = 0
    for (const a of recentAnswers) {
      if (!a.isCorrect) { streak++; maxStreak = Math.max(maxStreak, streak) } else streak = 0
    }
    const cognitiveLoad = maxStreak >= 5 ? 'high' : maxStreak >= 3 ? 'medium' : 'low'

    const readinessScore = Math.round(overallAccuracy * 0.5 + coveragePct * 0.3 + Math.min(improvement, 20) * 0.2)
    const readinessToAdvance = readinessScore >= 70 ? 'ready' : readinessScore >= 45 ? 'borderline' : 'not_ready'

    // SRL ảnh hưởng đến dự báo retention
    const retentionSignal = srl.srlLevel === 'high' ? 'strong' : srl.srlLevel === 'medium' ? 'moderate' : 'weak'

    const a2plmText = formatA2PLMContext(profile, srl, context, daysToExam)

    const prompt = `${a2plmText}

DỮ LIỆU DỰ BÁO (Bài toán 2 — DKT/multi-task prediction):
- Độ chính xác: ${overallAccuracy}% | Gần đây: ${recentAccuracy}% | Cải thiện: ${improvement > 0 ? '+' : ''}${improvement}%
- Độ phủ: ${subjectsDone}/${totalSubjects} chuyên đề (${coveragePct}%)
- Xác suất đỗ (tính toán): ${probability}%
- Rủi ro gắn kết: ${engagementRisk} | Tải nhận thức: ${cognitiveLoad}
- Sẵn sàng tiếp: ${readinessToAdvance}
- Retention signal (từ SRL): ${retentionSignal}
${daysToExam !== null ? `- KHẨN CẤP: Còn ${daysToExam} ngày đến kỳ thi!` : ''}

Dự báo đa chiều JSON — có xem xét P_i, G_i, SRL (không markdown):
{
  "probability": ${probability},
  "level": "Xuất sắc/Tốt/Trung bình/Cần cố gắng",
  "verdict": "Dự báo học tập (1-2 câu, ngôn ngữ sư phạm, tính đến mục tiêu G_i)",
  "successForecast": "Xác suất thành công bước tiếp + điều kiện đi kèm",
  "engagementForecast": "Dự báo rủi ro gắn kết — có tính đến profile phụ huynh",
  "cognitiveLoadForecast": "Dự báo tải nhận thức — phù hợp phong cách học P_i",
  "retentionForecast": "Dự báo khả năng duy trì tiến trình (RET) — liên quan SRL",
  "srlForecast": "Dự báo phát triển SRL trong 2-4 tuần tới",
  "readinessSignals": ["Tín hiệu sẵn sàng 1", "Tín hiệu sẵn sàng 2"],
  "riskSignals": ["Tín hiệu rủi ro 1", "Tín hiệu rủi ro 2"],
  "strongPoints": ["Điểm mạnh 1", "Điểm mạnh 2"],
  "gapAreas": ["Khoảng trống 1", "Khoảng trống 2"],
  "timeToReady": "Ước tính thời gian đạt 80%+ (có tính đến G_i deadline)",
  "actionPlan": ["Hành động ưu tiên 1", "Hành động 2", "Hành động 3"],
  "interventionUrgency": "immediate/soon/monitor",
  "parentNote": "Lời nhắn thực tế cho phụ huynh — phù hợp mức parentInvolvement"
}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: AVAB_SYSTEM }, { role: 'user', content: prompt }],
      max_tokens: 550,
      temperature: 0.3,
    })

    const raw = completion.choices[0].message.content || '{}'
    const prediction = JSON.parse(raw.replace(/```json|```/g, '').trim())

    return NextResponse.json({
      success: true,
      data: {
        stats: { totalScore, overallAccuracy, subjectsDone, totalSubjects, coveragePct, totalAnswered, improvement, recentAccuracy },
        multiDimension: { engagementRisk, cognitiveLoad, readinessToAdvance },
        // A2PLM
        srl, profile: profile ? { targetSchool: profile.targetSchool, targetGoal: profile.targetGoal, backgroundLevel: profile.backgroundLevel } : null,
        daysToExam,
        ...prediction, probability: prediction.probability ?? probability,
      },
    })
  } catch (err) {
    console.error('AI predict error:', err)
    return NextResponse.json({ success: false, error: 'AI không khả dụng' }, { status: 500 })
  }
}

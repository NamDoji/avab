import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { openai, AVAB_SYSTEM } from '@/lib/openai'
import { prisma } from '@/lib/prisma'

// AI đánh giá khả năng đỗ học bổng lớp 1
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 })
  }

  try {
    const userId = (session.user as any).id

    // Thu thập toàn bộ dữ liệu học sinh
    const [answers, totalSubjects] = await Promise.all([
      prisma.studentAnswer.findMany({
        where: { userId },
        select: { subjectId: true, isCorrect: true, score: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.subject.count(),
    ])

    const totalAnswered = answers.length
    const totalCorrect = answers.filter((a) => a.isCorrect).length
    const overallAccuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0

    // Chuyên đề đã làm
    const subjectsDone = new Set(answers.map((a) => a.subjectId)).size
    const coveragePct = Math.round((subjectsDone / totalSubjects) * 100)

    // Tính điểm tổng
    const totalScore = answers.reduce((sum, a) => sum + a.score, 0)

    // Tốc độ cải thiện (so sánh 50 câu đầu vs 50 câu gần nhất)
    const recent = answers.slice(0, Math.min(50, answers.length))
    const early = answers.slice(-Math.min(50, answers.length))
    const recentAccuracy = recent.length > 0
      ? Math.round((recent.filter((a) => a.isCorrect).length / recent.length) * 100)
      : 0
    const earlyAccuracy = early.length > 0
      ? Math.round((early.filter((a) => a.isCorrect).length / early.length) * 100)
      : 0
    const improvement = recentAccuracy - earlyAccuracy

    // Thuật toán tính xác suất đỗ (0-100)
    let probability = 0
    probability += Math.min(overallAccuracy * 0.4, 40)  // Độ chính xác (max 40%)
    probability += Math.min(coveragePct * 0.3, 30)       // Độ phủ chuyên đề (max 30%)
    probability += Math.min(totalAnswered * 0.1, 15)      // Số lượng luyện tập (max 15%)
    probability += Math.max(0, Math.min(improvement * 0.5, 15)) // Cải thiện (max 15%)
    probability = Math.round(Math.min(probability, 98))

    // Tính các chỉ số đa chiều theo Biài toán 2: Dự báo tiến trình học tập
    // Risk engagement: tỷ lệ câu chưa làm so với tổng
    const engagementRiskScore = Math.max(0, 100 - coveragePct - Math.min(totalAnswered / 2, 30))
    const engagementRisk = engagementRiskScore > 60 ? 'high' : engagementRiskScore > 30 ? 'medium' : 'low'

    // Cognitive load proxy: cắn mạnh số câu sai liên tiếp
    const recentAnswers = answers.slice(0, 10)
    let streak = 0, maxStreak = 0
    for (const a of recentAnswers) {
      if (!a.isCorrect) { streak++; maxStreak = Math.max(maxStreak, streak) } else streak = 0
    }
    const cognitiveLoad = maxStreak >= 5 ? 'high' : maxStreak >= 3 ? 'medium' : 'low'

    // Readiness to advance: cần độ chính xác cao + độ phủ rộng
    const readinessScore = Math.round(overallAccuracy * 0.5 + coveragePct * 0.3 + Math.min(improvement, 20) * 0.2)
    const readinessToAdvance = readinessScore >= 70 ? 'ready' : readinessScore >= 45 ? 'borderline' : 'not_ready'

    const prompt = `Học sinh luyện thi học bổng lớp 1. Dự báo tiến trình học tập theo hướng DKT/multi-task prediction:

DỮ LIỆU ĐẦU VÀO:
- Tổng điểm tich lũy: ${totalScore}
- Độ chính xác thoảng: ${overallAccuracy}% | Gần đây: ${recentAccuracy}%
- Độ phủ chuyên đề: ${subjectsDone}/${totalSubjects} (${coveragePct}%)
- Câu hỏi đã làm: ${totalAnswered} | Cải thiện: ${improvement > 0 ? '+' : ''}${improvement}%
- Xác suất đỗ (tính toán): ${probability}%
- Rủi ro gắt kết: ${engagementRisk} | Tải nhận thức: ${cognitiveLoad}
- Sẵn sàng tiếp theo: ${readinessToAdvance}

Dự báo JSON đa chiều (không markdown):
{
  "probability": ${probability},
  "level": "Xuất sắc/Tốt/Trung bình/Cần cố gắng",
  "verdict": "Dự báo tính huống học tập sắp tới (1-2 câu, ngôn ngữ sư phạm)",
  "successForecast": "Xác suất thành công bước tiếp theo (%) và điều kiện kèm",
  "engagementForecast": "Dự báo mức gắt kết trong 1-2 tuần tới nếu không can thiệp",
  "cognitiveLoadForecast": "Dự báo tải nhận thức khi tiếp tuc theo lộ trình hiện tại",
  "readinessSignals": ["Dấu hiệu sẵn sàng 1", "Dấu hiệu sẵn sàng 2"],
  "riskSignals": ["Dấu hiệu rủi ro 1", "Dấu hiệu rủi ro 2"],
  "strongPoints": ["Điểm mạnh 1", "Điểm mạnh 2"],
  "gapAreas": ["Khoảng trống 1", "Khoảng trống 2"],
  "timeToReady": "Ước tính thời gian đạt 80%+ sẵn sàng",
  "actionPlan": ["Hành động uu tiên 1", "Hành động uu tiên 2", "Hành động uu tiên 3"],
  "interventionUrgency": "immediate/soon/monitor",
  "parentNote": "Lời nhắn thực tế cho phụ huynh (có thể hành động ngay)"
}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: AVAB_SYSTEM },
        { role: 'user', content: prompt },
      ],
      max_tokens: 450,
      temperature: 0.3,
    })

    const raw = completion.choices[0].message.content || '{}'
    const prediction = JSON.parse(raw.replace(/```json|```/g, '').trim())

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalScore,
          overallAccuracy,
          subjectsDone,
          totalSubjects,
          coveragePct,
          totalAnswered,
          improvement,
          recentAccuracy,
        },
        // Chỉ số đa chiều (Biài toán 2)
        multiDimension: {
          engagementRisk,
          cognitiveLoad,
          readinessToAdvance,
        },
        ...prediction,
        probability: prediction.probability ?? probability,
      },
    })
  } catch (err) {
    console.error('AI predict error:', err)
    return NextResponse.json({ success: false, error: 'AI không khả dụng' }, { status: 500 })
  }
}

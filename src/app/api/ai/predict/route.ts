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

    const prompt = `Học sinh luyện thi học bổng lớp 1:
- Tổng điểm: ${totalScore}
- Độ chính xác tổng: ${overallAccuracy}%
- Đã làm ${subjectsDone}/${totalSubjects} chuyên đề (${coveragePct}%)
- Tổng câu đã làm: ${totalAnswered}
- Độ chính xác gần đây: ${recentAccuracy}%
- Cải thiện so với ban đầu: ${improvement > 0 ? '+' : ''}${improvement}%
- Xác suất đỗ tính toán: ${probability}%

Đánh giá JSON (không markdown):
{
  "probability": ${probability},
  "level": "Xuất sắc/Tốt/Trung bình/Cần cố gắng thêm",
  "verdict": "Nhận xét tổng quan 1-2 câu thật sự có giá trị",
  "strongPoints": ["Điểm mạnh 1", "Điểm mạnh 2"],
  "gapAreas": ["Khoảng trống cần bù 1", "Khoảng trống cần bù 2"],
  "timeToReady": "Ước tính thời gian để đạt 80%+ sẵn sàng",
  "actionPlan": ["Hành động 1 cần làm ngay", "Hành động 2", "Hành động 3"],
  "parentNote": "Lời nhắn cho phụ huynh (1-2 câu thực tế, không hoa mỹ)"
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

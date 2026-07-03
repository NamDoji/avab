import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { openai, AVAB_SYSTEM } from '@/lib/openai'
import { prisma } from '@/lib/prisma'

// Bài toán 3: Lựa chọn gói can thiệp sư phạm
// Recommender systems — lựa chọn gói can thiệp tối ưu dựa trên chẩn đoán + dự báo
// Đầu ra: Lộ trình học tập, phương pháp, tài nguyên ưu tiên, chiến lược hỗ trợ
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 })

  try {
    const userId = (session.user as any).id

    // Thu thập dữ liệu đầu vào: trạng thái tri thức + hành vi + bối cảnh học tập
    const [answers, allSubjects] = await Promise.all([
      prisma.studentAnswer.findMany({
        where: { userId },
        select: { subjectId: true, isCorrect: true, score: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.subject.findMany({
        orderBy: { order: 'asc' },
        select: { id: true, name: true, order: true },
      }),
    ])

    if (answers.length < 5) {
      return NextResponse.json({
        success: true,
        data: {
          empty: true,
          message: 'Cần ít nhất 5 câu trả lời để AI có thể đề xuất gói can thiệp phù hợp.',
        },
      })
    }

    // ── Tính toán đầu vào cho Recommender ──
    const subjectStats: Record<string, { correct: number; total: number }> = {}
    for (const a of answers) {
      if (!subjectStats[a.subjectId]) subjectStats[a.subjectId] = { correct: 0, total: 0 }
      subjectStats[a.subjectId].total++
      if (a.isCorrect) subjectStats[a.subjectId].correct++
    }

    const overall = answers.length > 0
      ? Math.round(answers.filter(a => a.isCorrect).length / answers.length * 100)
      : 0

    // Phân loại chuyên đề
    const masteredSubjects = allSubjects.filter(s => {
      const st = subjectStats[s.id]
      return st && st.total >= 3 && (st.correct / st.total) >= 0.8
    })
    const strugglingSubjects = allSubjects.filter(s => {
      const st = subjectStats[s.id]
      return st && (st.correct / st.total) < 0.5
    })
    const notStarted = allSubjects.filter(s => !subjectStats[s.id])

    // Xu hướng học tập gần đây (5 câu cuối)
    const recent = answers.slice(-5)
    const recentAcc = recent.length > 0 ? Math.round(recent.filter(a => a.isCorrect).length / recent.length * 100) : 0

    // Tính urgency dựa trên multiple factors
    const urgencyScore =
      (overall < 50 ? 3 : overall < 70 ? 2 : 1) +
      (strugglingSubjects.length > 5 ? 2 : strugglingSubjects.length > 2 ? 1 : 0) +
      (recentAcc < 40 ? 2 : recentAcc < 60 ? 1 : 0)

    const packageType = urgencyScore >= 5 ? 'intensive' : urgencyScore >= 3 ? 'standard' : 'light'

    const prompt = `Học sinh luyện thi học bổng lớp 1. Nhiệm vụ: Lựa chọn gói can thiệp sư phạm tối ưu.

DỮ LIỆU TRẠNG THÁI TRI THỨC:
- Độ chính xác tổng: ${overall}%
- Đã nắm vững (≥80%): ${masteredSubjects.length} chuyên đề (${masteredSubjects.map(s => s.name).join(', ') || 'Chưa có'})
- Cần hỗ trợ (<50%): ${strugglingSubjects.length} chuyên đề (${strugglingSubjects.map(s => s.name).slice(0, 4).join(', ') || 'Chưa có'})
- Chưa bắt đầu: ${notStarted.length} chuyên đề
- Xu hướng gần đây: ${recentAcc}% (${recentAcc > overall ? 'đang tốt lên' : 'đang chững lại'})
- Gói can thiệp gợi ý: ${packageType === 'intensive' ? 'Tăng cường' : packageType === 'standard' ? 'Tiêu chuẩn' : 'Duy trì'}

Dựa trên Recommender Systems và context-aware decision making, đề xuất JSON (không markdown):
{
  "packageType": "${packageType}",
  "packageLabel": "Tên gói can thiệp theo ngôn ngữ sư phạm",
  "packageRationale": "Lý do chọn gói này (1-2 câu theo khung can thiệp sư phạm)",
  "interventionGoal": "Mục tiêu can thiệp cụ thể (SMART)",
  "priorityTopics": ["Chuyên đề ưu tiên 1 + lý do ngắn", "Chuyên đề ưu tiên 2 + lý do ngắn", "Chuyên đề ưu tiên 3 + lý do ngắn"],
  "learningPathway": ["Bước 1 (Ngày 1-3): ...", "Bước 2 (Ngày 4-7): ...", "Bước 3 (Tuần 2): ...", "Bước 4 (Tuần 3-4): ..."],
  "teachingMethod": "Phương pháp sư phạm phù hợp nhất cho tình trạng hiện tại",
  "supportIntensity": "Mức độ hỗ trợ cần thiết (cao/trung bình/thấp) và cách thực hiện",
  "estimatedDays": 21,
  "successCriteria": "Tiêu chí thành công cụ thể (đo lường được)",
  "parentGuidance": "Hướng dẫn phụ huynh hỗ trợ tại nhà (thực tế, cụ thể)"
}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: AVAB_SYSTEM },
        { role: 'user', content: prompt },
      ],
      max_tokens: 600,
      temperature: 0.4,
    })

    const raw = completion.choices[0].message.content || '{}'
    const intervention = JSON.parse(raw.replace(/```json|```/g, '').trim())

    return NextResponse.json({
      success: true,
      data: {
        // Dữ liệu thô
        stats: {
          overall,
          masteredCount: masteredSubjects.length,
          strugglingCount: strugglingSubjects.length,
          notStartedCount: notStarted.length,
          recentAccuracy: recentAcc,
          urgencyScore,
        },
        // Can thiệp AI
        ...intervention,
        packageType: intervention.packageType ?? packageType,
      },
    })
  } catch (err) {
    console.error('AI intervene error:', err)
    return NextResponse.json({ success: false, error: 'AI không khả dụng' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { openai, AVAB_SYSTEM } from '@/lib/openai'
import { prisma } from '@/lib/prisma'

// Bài toán 1: Chẩn đoán trạng thái người học
// Mô hình hóa trạng thái tri thức theo hướng BKT/DKT
// Đầu ra: Hồ sơ trạng thái học tập hợp nhất
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 })

  try {
    const userId = (session.user as any).id

    // Thu thập dữ liệu đa chiều theo hướng learner modeling
    const [answers, allSubjects] = await Promise.all([
      prisma.studentAnswer.findMany({
        where: { userId },
        include: {
          question: { select: { content: true, subjectId: true, points: true } },
        },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.subject.findMany({
        orderBy: { order: 'asc' },
        select: { id: true, name: true, order: true, icon: true },
      }),
    ])

    if (answers.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          empty: true,
          message: 'Chưa có dữ liệu học tập. Hãy làm thử một số bài để AI có thể phân tích!',
        },
      })
    }

    // ── Mô hình hóa tri thức theo từng chuyên đề (BKT-inspired) ──
    const subjectMap: Record<string, { name: string; icon: string | null; answers: typeof answers }> = {}
    for (const s of allSubjects) {
      subjectMap[s.id] = { name: s.name, icon: s.icon, answers: [] }
    }
    for (const a of answers) {
      if (subjectMap[a.subjectId]) subjectMap[a.subjectId].answers.push(a)
    }

    const knowledgeProfile = allSubjects
      .filter(s => subjectMap[s.id].answers.length > 0)
      .map(s => {
        const sa = subjectMap[s.id].answers
        const correct = sa.filter(a => a.isCorrect).length
        const accuracy = Math.round((correct / sa.length) * 100)
        // Chuỗi đúng/sai gần đây (5 câu cuối) — tín hiệu "hiểu bền vững"
        const recent5 = sa.slice(-5).map(a => a.isCorrect ? 1 : 0) as number[]
        const recentAcc = recent5.length > 0 ? Math.round(recent5.reduce((a: number, b: number) => a + b, 0) / recent5.length * 100) : 0
        // Phân loại theo BKT threshold
        const masteryLevel =
          accuracy >= 80 && recentAcc >= 70 ? 'mastered' :
          accuracy >= 60 ? 'developing' :
          accuracy >= 30 ? 'struggling' : 'at_risk'
        return {
          subjectId: s.id,
          name: s.name,
          icon: s.icon,
          attempted: sa.length,
          accuracy,
          recentAccuracy: recentAcc,
          masteryLevel,
        }
      })

    // ── Phân tích hành vi học tập ──
    const totalAnswered = answers.length
    const timeSpread = answers.length >= 2
      ? (new Date(answers[answers.length - 1].createdAt).getTime() - new Date(answers[0].createdAt).getTime()) / (1000 * 3600 * 24)
      : 0
    const avgPerDay = timeSpread > 0 ? (totalAnswered / timeSpread).toFixed(1) : totalAnswered.toString()

    // Xu hướng cải thiện (BKT: learning rate)
    const half = Math.floor(answers.length / 2)
    const earlyAcc = half > 0 ? Math.round(answers.slice(0, half).filter(a => a.isCorrect).length / half * 100) : 0
    const lateAcc = half > 0 ? Math.round(answers.slice(half).filter(a => a.isCorrect).length / (answers.length - half) * 100) : 0
    const learningTrend = lateAcc - earlyAcc // dương = đang tiến bộ, âm = đang chững lại

    // Tải nhận thức (cognitive load proxy): tỷ lệ câu sai liên tiếp
    let consecutiveWrong = 0, maxConsecutiveWrong = 0, currentStreak = 0
    for (const a of answers) {
      if (!a.isCorrect) { currentStreak++; maxConsecutiveWrong = Math.max(maxConsecutiveWrong, currentStreak) }
      else currentStreak = 0
    }
    const cognitiveLoadLevel = maxConsecutiveWrong >= 6 ? 'high' : maxConsecutiveWrong >= 3 ? 'medium' : 'low'

    // Mức độ gắn kết (engagement): độ đa dạng chuyên đề đã làm
    const subjectsCovered = new Set(answers.map(a => a.subjectId)).size
    const engagementScore = Math.min(100, Math.round((subjectsCovered / allSubjects.length) * 60 + (totalAnswered / 100) * 40))
    const engagementLevel = engagementScore >= 60 ? 'high' : engagementScore >= 30 ? 'medium' : 'low'

    const mastered = knowledgeProfile.filter(k => k.masteryLevel === 'mastered')
    const developing = knowledgeProfile.filter(k => k.masteryLevel === 'developing')
    const struggling = knowledgeProfile.filter(k => ['struggling', 'at_risk'].includes(k.masteryLevel))

    const prompt = `Dữ liệu học sinh luyện thi học bổng lớp 1:

TRI THỨC (BKT-inspired):
- Nắm vững (≥80%): ${mastered.map(k => k.name).join(', ') || 'Chưa có'}
- Đang phát triển (60-79%): ${developing.map(k => k.name).join(', ') || 'Chưa có'}
- Cần hỗ trợ (<60%): ${struggling.map(k => k.name).join(', ') || 'Chưa có'}

HÀNH VI HỌC TẬP:
- Tổng câu đã làm: ${totalAnswered}
- Trung bình ${avgPerDay} câu/ngày
- Xu hướng cải thiện: ${learningTrend > 0 ? '+' : ''}${learningTrend}% (${learningTrend > 5 ? 'đang tiến bộ tốt' : learningTrend < -5 ? 'có dấu hiệu chững lại' : 'ổn định'})
- Chuỗi sai dài nhất: ${maxConsecutiveWrong} câu → Tải nhận thức: ${cognitiveLoadLevel}
- Mức độ gắn kết: ${engagementLevel} (${subjectsCovered}/${allSubjects.length} chuyên đề)

Chẩn đoán trạng thái học tập theo JSON (không markdown):
{
  "overallState": "Trạng thái tổng quan 1 câu súc tích (ngôn ngữ sư phạm)",
  "knowledgeSummary": "Nhận xét về bản đồ tri thức 1-2 câu",
  "behaviorInsight": "Nhận xét về hành vi học tập 1-2 câu",
  "engagementAnalysis": "Đánh giá mức độ gắn kết và động lực",
  "cognitiveProfile": "Nhận xét về khả năng nhận thức (phù hợp lứa tuổi 5-6)",
  "contextualFactors": "Yếu tố ngữ cảnh cần lưu ý (theo hướng multimodal learning analytics)",
  "diagnosticConclusion": "Kết luận chẩn đoán tổng hợp — cơ sở để ra quyết định dạy học"
}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: AVAB_SYSTEM },
        { role: 'user', content: prompt },
      ],
      max_tokens: 500,
      temperature: 0.3,
    })

    const raw = completion.choices[0].message.content || '{}'
    const aiDiagnosis = JSON.parse(raw.replace(/```json|```/g, '').trim())

    return NextResponse.json({
      success: true,
      data: {
        knowledgeProfile,
        masteredCount: mastered.length,
        developingCount: developing.length,
        strugglingCount: struggling.length,
        totalSubjects: allSubjects.length,
        // Chỉ số hành vi
        behavior: {
          totalAnswered,
          avgPerDay,
          learningTrend,
          learningTrendLabel: learningTrend > 5 ? 'Đang tiến bộ tốt' : learningTrend < -5 ? 'Có dấu hiệu chững lại' : 'Ổn định',
        },
        // Chỉ số nhận thức
        cognitive: {
          load: cognitiveLoadLevel,
          maxConsecutiveWrong,
        },
        // Chỉ số gắn kết
        engagement: {
          level: engagementLevel,
          score: engagementScore,
          subjectsCovered,
        },
        // AI chẩn đoán
        ...aiDiagnosis,
      },
    })
  } catch (err) {
    console.error('AI diagnose error:', err)
    return NextResponse.json({ success: false, error: 'AI không khả dụng' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { openai, AVAB_SYSTEM } from '@/lib/openai'
import { prisma } from '@/lib/prisma'
import { getA2PLMContext, formatA2PLMContext } from '@/lib/a2plm'

// Bài toán 4: Khuyến nghị can thiệp sư phạm — A2PLM đầy đủ
// Aware recommendation: context × profile × goals × SRL
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 })

  try {
    const userId = (session.user as any).id
    const { profile, srl, context, daysToExam } = await getA2PLMContext(userId, req)
    const subjectId = new URL(req.url).searchParams.get('subjectId')

    const wrongAnswers = await prisma.studentAnswer.findMany({
      where: { userId, isCorrect: false, ...(subjectId ? { subjectId } : {}) },
      include: { question: { select: { content: true, correctAnswer: true, order: true } } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    const subjectScores = await prisma.studentAnswer.groupBy({
      by: ['subjectId'], where: { userId }, _avg: { score: true }, _count: { score: true },
    })
    const weakSubjects = subjectScores.filter(s => (s._avg.score || 0) < 0.6).map(s => s.subjectId)
    const subjects = await prisma.subject.findMany({
      where: weakSubjects.length > 0 ? { id: { in: weakSubjects } } : {},
      take: 3, select: { name: true, icon: true },
    })

    const allAnswers = await prisma.studentAnswer.findMany({
      where: { userId }, select: { isCorrect: true, createdAt: true }, orderBy: { createdAt: 'desc' },
    })
    const totalAcc = allAnswers.length > 0 ? Math.round(allAnswers.filter(a => a.isCorrect).length / allAnswers.length * 100) : 0
    const supportLevel = totalAcc < 50 ? 'high' : totalAcc < 70 ? 'medium' : 'low'

    const a2plmText = formatA2PLMContext(profile, srl, context, daysToExam)

    const prompt = `${a2plmText}

BỐI CẢNH HỌC TẬP HIỆN TẠI:
- Độ chính xác: ${totalAcc}% | Mức hỗ trợ cần: ${supportLevel}
- Câu sai gần đây: ${wrongAnswers.length}
${wrongAnswers.length > 0 ? `Câu sai điển hình:\n${wrongAnswers.slice(0, 5).map(a => `- "${a.question.content}" (đúng: ${a.question.correctAnswer})`).join('\n')}` : ''}
- Chuyên đề còn yếu: ${subjects.map(s => s.name).join(', ') || 'Chưa xác định'}

NHIỆM VỤ: Khuyến nghị can thiệp sư phạm TỔNG HỢP — aware recommendation, tính đến:
- Phong cách học P_i: ${profile?.learningStyle ?? 'MIXED'}
- Mức gắn kết phụ huynh: ${profile?.parentInvolvement ?? 'MEDIUM'}
- SRL hiện tại: ${srl.srlLevel} (${srl.srlScore}/100)
- Mục tiêu G_i: ${profile?.targetGoal ?? 'SCHOLARSHIP'} ${profile?.targetSchool ? `→ ${profile.targetSchool}` : ''}
- Ngữ cảnh C_t: ${context.timeOfDay} trên ${context.device}

Khuyến nghị JSON (không markdown):
{
  "teachingStrategy": "Chiến lược sư phạm — phù hợp learningStyle và SRL level",
  "supportLevel": "${supportLevel}",
  "supportGuidance": "Hướng dẫn thực hiện mức hỗ trợ này",
  "exercises": [
    {
      "type": "Loại bài tập",
      "description": "Mô tả cụ thể — phù hợp learningStyle",
      "difficulty": "Dễ/Trung bình/Khó",
      "example": "Ví dụ mẫu",
      "pedagogicalReason": "Lý do sư phạm — liên quan đến lỗi sai cụ thể"
    }
  ],
  "srlDevelopmentActions": ["Hành động phát triển SRL 1", "Hành động phát triển SRL 2"],
  "selfStudyStrategy": "Chiến lược tự học — phù hợp SRL level và selfStudyCapacity",
  "resourceRecommendations": ["Tài nguyên 1 — phù hợp learningStyle", "Tài nguyên 2"],
  "teacherActions": ["Hành động giáo viên 1", "Hành động 2"],
  "parentActions": ["Hành động phụ huynh 1 — phù hợp parentInvolvement", "Hành động 2"],
  "contextAdaptations": "Điều chỉnh theo ngữ cảnh ${context.timeOfDay}/${context.device}",
  "dailyGoal": "Mục tiêu hôm nay — có tính deadline G_i",
  "motivation": "Câu động viên phù hợp trẻ 5-6 tuổi"
}
Gợi ý 3 bài tập, phù hợp phong cách học.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: AVAB_SYSTEM }, { role: 'user', content: prompt }],
      max_tokens: 600,
      temperature: 0.5,
    })

    const raw = completion.choices[0].message.content || '{}'
    const recommendations = JSON.parse(raw.replace(/```json|```/g, '').trim())

    return NextResponse.json({
      success: true,
      data: {
        ...recommendations, supportLevel,
        srl, profile: profile ? { learningStyle: profile.learningStyle, parentInvolvement: profile.parentInvolvement, targetGoal: profile.targetGoal } : null,
        daysToExam,
      },
    })
  } catch (err) {
    console.error('AI recommend error:', err)
    return NextResponse.json({ success: false, error: 'AI không khả dụng' }, { status: 500 })
  }
}

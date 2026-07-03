import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { openai, AVAB_SYSTEM } from '@/lib/openai'
import { prisma } from '@/lib/prisma'
import { getA2PLMContext, formatA2PLMContext } from '@/lib/a2plm'
import { getAICache, canRefresh, saveAICache } from '@/lib/ai-cache'

// Bài toán 3: Lựa chọn gói can thiệp sư phạm — A2PLM đầy đủ
// Recommender systems — context-aware decision making
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 })

  try {
    const userId = (session.user as any).id

    const force = req.nextUrl.searchParams.get('force') === '1'
    if (!force) {
      const cached = await getAICache(userId, 'intervene')
      if (cached.cached) {
        return NextResponse.json({ success: true, data: cached.data, fromCache: true, refreshedAt: cached.refreshedAt })
      }
    } else {
      const check = await canRefresh(userId)
      if (!check.allowed) {
        return NextResponse.json({ success: false, error: 'refresh_limit', nextAt: check.nextAt, daysLeft: check.daysLeft }, { status: 429 })
      }
    }

    const { profile, srl, context, daysToExam } = await getA2PLMContext(userId, req)

    const [answers, allSubjects] = await Promise.all([
      prisma.studentAnswer.findMany({
        where: { userId },
        select: { subjectId: true, isCorrect: true, score: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.subject.findMany({ orderBy: { order: 'asc' }, select: { id: true, name: true, order: true } }),
    ])

    if (answers.length < 5) {
      return NextResponse.json({ success: true, data: { empty: true, message: 'Cần ít nhất 5 câu trả lời để AI đề xuất gói can thiệp.', profile } })
    }

    const subjectStats: Record<string, { correct: number; total: number }> = {}
    for (const a of answers) {
      if (!subjectStats[a.subjectId]) subjectStats[a.subjectId] = { correct: 0, total: 0 }
      subjectStats[a.subjectId].total++
      if (a.isCorrect) subjectStats[a.subjectId].correct++
    }

    const overall = answers.length > 0 ? Math.round(answers.filter(a => a.isCorrect).length / answers.length * 100) : 0
    const masteredSubjects = allSubjects.filter(s => { const st = subjectStats[s.id]; return st && st.total >= 3 && (st.correct / st.total) >= 0.8 })
    const strugglingSubjects = allSubjects.filter(s => { const st = subjectStats[s.id]; return st && (st.correct / st.total) < 0.5 })
    const notStarted = allSubjects.filter(s => !subjectStats[s.id])

    const recent = answers.slice(-5)
    const recentAcc = recent.length > 0 ? Math.round(recent.filter(a => a.isCorrect).length / recent.length * 100) : 0

    // Urgency với A2PLM: tính COST — thêm yếu tố deadline và SRL
    let urgencyScore = (overall < 50 ? 3 : overall < 70 ? 2 : 1)
      + (strugglingSubjects.length > 5 ? 2 : strugglingSubjects.length > 2 ? 1 : 0)
      + (recentAcc < 40 ? 2 : recentAcc < 60 ? 1 : 0)
      + (daysToExam !== null && daysToExam < 30 ? 2 : daysToExam !== null && daysToExam < 60 ? 1 : 0) // G_i deadline pressure
      + (srl.srlLevel === 'low' ? 1 : 0) // SRL thấp cần support nhiều hơn

    const packageType = urgencyScore >= 6 ? 'intensive' : urgencyScore >= 3 ? 'standard' : 'light'

    const a2plmText = formatA2PLMContext(profile, srl, context, daysToExam)

    const prompt = `${a2plmText}

DỮ LIỆU ĐẦU VÀO CHO RECOMMENDER SYSTEM:
- Độ chính xác tổng: ${overall}% | Gần đây: ${recentAcc}%
- Nắm vững: ${masteredSubjects.length} CĐ (${masteredSubjects.map(s => s.name).join(', ') || 'Chưa có'})
- Cần hỗ trợ: ${strugglingSubjects.length} CĐ (${strugglingSubjects.map(s => s.name).slice(0, 4).join(', ') || 'Chưa có'})
- Chưa bắt đầu: ${notStarted.length} CĐ
- Urgency score: ${urgencyScore}/10 → Gói đề xuất: ${packageType}
- SRL: ${srl.srlScore}/100 (${srl.srlLevel})

Lựa chọn gói can thiệp A2PLM — context-aware recommendation JSON (không markdown):
{
  "packageType": "${packageType}",
  "packageLabel": "Tên gói can thiệp (ngôn ngữ sư phạm, tính đến P_i và G_i)",
  "packageRationale": "Lý do chọn gói này — đề cập đến mục tiêu G_i và trình độ P_i",
  "interventionGoal": "Mục tiêu SMART — gắn với targetSchool và deadline nếu có",
  "priorityTopics": ["CĐ ưu tiên 1 + lý do ngắn", "CĐ ưu tiên 2 + lý do ngắn", "CĐ ưu tiên 3 + lý do ngắn"],
  "learningPathway": ["Bước 1 (Ngày 1-3): ...", "Bước 2 (Ngày 4-7): ...", "Bước 3 (Tuần 2): ...", "Bước 4 (Tuần 3-4): ..."],
  "teachingMethod": "Phương pháp — phù hợp với learningStyle ${profile?.learningStyle ?? 'MIXED'}",
  "supportIntensity": "Mức hỗ trợ — phù hợp parentInvolvement và SRL hiện tại",
  "srlDevelopmentPlan": "Kế hoạch tăng SRL trong gói can thiệp này",
  "estimatedDays": 21,
  "successCriteria": "Tiêu chí thành công đo lường được — liên quan G_i",
  "parentGuidance": "Hướng dẫn phụ huynh — phù hợp với mức parentInvolvement"
}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: AVAB_SYSTEM }, { role: 'user', content: prompt }],
      max_tokens: 650,
      temperature: 0.4,
    })

    const raw = completion.choices[0].message.content || '{}'
    const intervention = JSON.parse(raw.replace(/```json|```/g, '').trim())

    const responseData = {
      stats: { overall, masteredCount: masteredSubjects.length, strugglingCount: strugglingSubjects.length, notStartedCount: notStarted.length, recentAccuracy: recentAcc, urgencyScore },
      srl, profile: profile ? { targetSchool: profile.targetSchool, targetGoal: profile.targetGoal, weeklyHours: profile.weeklyHours } : null,
      daysToExam,
      ...intervention, packageType: intervention.packageType ?? packageType,
    }
    await saveAICache(userId, 'intervene', responseData)
    return NextResponse.json({ success: true, data: responseData })
  } catch (err) {
    console.error('AI intervene error:', err)
    return NextResponse.json({ success: false, error: 'AI không khả dụng' }, { status: 500 })
  }
}

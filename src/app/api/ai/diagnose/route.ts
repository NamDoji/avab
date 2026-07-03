import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { openai, AVAB_SYSTEM } from '@/lib/openai'
import { prisma } from '@/lib/prisma'
import { getA2PLMContext, formatA2PLMContext } from '@/lib/a2plm'
import { getAICache, canRefresh, saveAICache } from '@/lib/ai-cache'

// Bài toán 1: Chẩn đoán trạng thái người học — A2PLM đầy đủ
// I_t = Π_θ(K_t, B_t, E_t, P, G, C_t, R, T, M)
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 })

  try {
    const userId = (session.user as any).id

    // Cache check: không có force=1 → trả cache nếu có
    const force = req.nextUrl.searchParams.get('force') === '1'
    if (!force) {
      const cached = await getAICache(userId, 'diagnose')
      if (cached.cached) {
        return NextResponse.json({ success: true, data: cached.data, fromCache: true, refreshedAt: cached.refreshedAt })
      }
    } else {
      // Kiểm tra giới hạn 14 ngày
      const check = await canRefresh(userId)
      if (!check.allowed) {
        return NextResponse.json({ success: false, error: 'refresh_limit', nextAt: check.nextAt, daysLeft: check.daysLeft }, { status: 429 })
      }
    }

    // Lấy A2PLM context (P_i, G_i, C_t^i, SRL_t^i)
    const { profile, srl, context, daysToExam } = await getA2PLMContext(userId, req)

    const [answers, allSubjects] = await Promise.all([
      prisma.studentAnswer.findMany({
        where: { userId },
        include: { question: { select: { content: true, subjectId: true, points: true } } },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.subject.findMany({ orderBy: { order: 'asc' }, select: { id: true, name: true, order: true, icon: true } }),
    ])

    if (answers.length === 0) {
      return NextResponse.json({ success: true, data: { empty: true, message: 'Chưa có dữ liệu học tập. Hãy làm thử một số bài để AI có thể phân tích!', profile, srl } })
    }

    // BKT-inspired knowledge profiling
    const subjectMap: Record<string, { name: string; icon: string | null; answers: typeof answers }> = {}
    for (const s of allSubjects) subjectMap[s.id] = { name: s.name, icon: s.icon, answers: [] }
    for (const a of answers) { if (subjectMap[a.subjectId]) subjectMap[a.subjectId].answers.push(a) }

    const knowledgeProfile = allSubjects.filter(s => subjectMap[s.id].answers.length > 0).map(s => {
      const sa = subjectMap[s.id].answers
      const correct = sa.filter(a => a.isCorrect).length
      const accuracy = Math.round((correct / sa.length) * 100)
      const recent5 = sa.slice(-5).map(a => a.isCorrect ? 1 : 0) as number[]
      const recentAcc = recent5.length > 0 ? Math.round(recent5.reduce((a, b) => a + b, 0) / recent5.length * 100) : 0
      const masteryLevel = accuracy >= 80 && recentAcc >= 70 ? 'mastered' : accuracy >= 60 ? 'developing' : accuracy >= 30 ? 'struggling' : 'at_risk'
      return { subjectId: s.id, name: s.name, icon: s.icon, attempted: sa.length, accuracy, recentAccuracy: recentAcc, masteryLevel }
    })

    const totalAnswered = answers.length
    const timeSpread = answers.length >= 2
      ? (new Date(answers[answers.length - 1].createdAt).getTime() - new Date(answers[0].createdAt).getTime()) / (1000 * 3600 * 24) : 0
    const avgPerDay = timeSpread > 0 ? (totalAnswered / timeSpread).toFixed(1) : totalAnswered.toString()

    const half = Math.floor(answers.length / 2)
    const earlyAcc = half > 0 ? Math.round(answers.slice(0, half).filter(a => a.isCorrect).length / half * 100) : 0
    const lateAcc = half > 0 ? Math.round(answers.slice(half).filter(a => a.isCorrect).length / (answers.length - half) * 100) : 0
    const learningTrend = lateAcc - earlyAcc

    let currentStreak = 0, maxConsecutiveWrong = 0
    for (const a of answers) {
      if (!a.isCorrect) { currentStreak++; maxConsecutiveWrong = Math.max(maxConsecutiveWrong, currentStreak) }
      else currentStreak = 0
    }
    const cognitiveLoadLevel = maxConsecutiveWrong >= 6 ? 'high' : maxConsecutiveWrong >= 3 ? 'medium' : 'low'

    const subjectsCovered = new Set(answers.map(a => a.subjectId)).size
    const engagementScore = Math.min(100, Math.round((subjectsCovered / allSubjects.length) * 60 + (totalAnswered / 100) * 40))
    const engagementLevel = engagementScore >= 60 ? 'high' : engagementScore >= 30 ? 'medium' : 'low'

    const mastered = knowledgeProfile.filter(k => k.masteryLevel === 'mastered')
    const developing = knowledgeProfile.filter(k => k.masteryLevel === 'developing')
    const struggling = knowledgeProfile.filter(k => ['struggling', 'at_risk'].includes(k.masteryLevel))

    // Format A2PLM context cho GPT
    const a2plmText = formatA2PLMContext(profile, srl, context, daysToExam)

    const prompt = `${a2plmText}

DỮ LIỆU HỌC TẬP THỰC TẾ (K_t^i, B_t^i, E_t^i):
TRI THỨC (BKT-inspired):
- Nắm vững (≥80%): ${mastered.map(k => k.name).join(', ') || 'Chưa có'}
- Đang phát triển (60-79%): ${developing.map(k => k.name).join(', ') || 'Chưa có'}
- Cần hỗ trợ (<60%): ${struggling.map(k => k.name).join(', ') || 'Chưa có'}

HÀNH VI HỌC TẬP (B_t^i):
- Tổng câu: ${totalAnswered} | Trung bình ${avgPerDay} câu/ngày
- Xu hướng: ${learningTrend > 0 ? '+' : ''}${learningTrend}% | Tải nhận thức: ${cognitiveLoadLevel}
- Gắn kết: ${engagementLevel} (${subjectsCovered}/${allSubjects.length} chuyên đề)

NĂNG LỰC TỰ HỌC (SRL_t^i): ${srl.srlScore}/100 — ${srl.srlLabel}

Chẩn đoán tích hợp A2PLM theo JSON (không markdown):
{
  "overallState": "Trạng thái tổng quan (ngôn ngữ sư phạm, có xem xét P_i và G_i)",
  "knowledgeSummary": "Nhận xét bản đồ tri thức",
  "behaviorInsight": "Nhận xét hành vi — có xem xét SRL và ngữ cảnh học",
  "engagementAnalysis": "Đánh giá gắn kết — phù hợp với profile phụ huynh",
  "cognitiveProfile": "Nhận xét nhận thức — phù hợp lứa tuổi và phong cách học",
  "contextualFactors": "Yếu tố ngữ cảnh cần lưu ý (thiết bị, thời gian, điều kiện)",
  "srlInsight": "Đánh giá năng lực tự học và hướng phát triển SRL",
  "profileAlignment": "Mức độ phù hợp giữa năng lực hiện tại và mục tiêu (G_i)",
  "diagnosticConclusion": "Kết luận chẩn đoán tổng hợp — cơ sở ra quyết định dạy học"
}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: AVAB_SYSTEM }, { role: 'user', content: prompt }],
      max_tokens: 600,
      temperature: 0.3,
    })

    const raw = completion.choices[0].message.content || '{}'
    const aiDiagnosis = JSON.parse(raw.replace(/```json|```/g, '').trim())

    const responseData = {
      knowledgeProfile, masteredCount: mastered.length, developingCount: developing.length,
      strugglingCount: struggling.length, totalSubjects: allSubjects.length,
      behavior: { totalAnswered, avgPerDay, learningTrend, learningTrendLabel: learningTrend > 5 ? 'Đang tiến bộ tốt' : learningTrend < -5 ? 'Có dấu hiệu chững lại' : 'Ổn định' },
      cognitive: { load: cognitiveLoadLevel, maxConsecutiveWrong },
      engagement: { level: engagementLevel, score: engagementScore, subjectsCovered },
      srl, profile, context: { device: context.device, timeOfDay: context.timeOfDay, note: context.contextNote },
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

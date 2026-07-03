import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { openai, AVAB_SYSTEM } from '@/lib/openai'
import { prisma } from '@/lib/prisma'
import { getA2PLMContext, formatA2PLMContext, computeKtBKT } from '@/lib/a2plm'
import { getAICache, canRefresh, saveAICache } from '@/lib/ai-cache'

/**
 * Bài toán 3: Lựa chọn gói can thiệp sư phạm — A2PLM đầy đủ
 * I_t^i = (L_t^i, M_t^i, T_t^i, R_t^i, S_t^i)
 *
 * Score(i, u, t) = λ₁Fit_K + λ₂Fit_B + λ₃Fit_P + λ₄Fit_G + λ₅Fit_M
 *                + λ₆Fit_T + λ₇Fit_R − λ₈CL − λ₉COST + λ₁₀AI_Conf
 */
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 })

  try {
    const userId = (session.user as any).id

    const force = req.nextUrl.searchParams.get('force') === '1'
    if (!force) {
      const cached = await getAICache(userId, 'intervene')
      if (cached.cached) return NextResponse.json({ success: true, data: cached.data, fromCache: true, refreshedAt: cached.refreshedAt })
      return NextResponse.json({ success: true, data: null })
    }
    const isInit = req.nextUrl.searchParams.get('init') === '1'
    if (!isInit) {
      const check = await canRefresh(userId)
      if (!check.allowed) return NextResponse.json({ success: false, error: 'refresh_limit', nextAt: check.nextAt, daysLeft: check.daysLeft }, { status: 429 })
    }

    // Z_t^i đầy đủ
    const { profile, srl, context, daysToExam, bt, et } = await getA2PLMContext(userId, req)

    const [answers, allSubjects] = await Promise.all([
      prisma.studentAnswer.findMany({
        where: { userId },
        select: { subjectId: true, isCorrect: true, score: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.subject.findMany({ orderBy: { order: 'asc' }, select: { id: true, name: true, order: true, icon: true } }),
    ])

    // K_t^i BKT
    const bktProfiles = computeKtBKT(answers, allSubjects, profile?.backgroundLevel)
    const masteredSubjects  = bktProfiles.filter(k => k.masteryLevel === 'mastered')
    const strugglingSubjects = bktProfiles.filter(k => ['struggling', 'at_risk'].includes(k.masteryLevel))
    const notStarted = allSubjects.filter(s => !bktProfiles.find(k => k.subjectId === s.id))
    const avgPMastery = bktProfiles.length > 0
      ? Math.round(bktProfiles.reduce((s, k) => s + k.pMastery, 0) / bktProfiles.length * 100) : 0

    const overall    = answers.length > 0 ? Math.round(answers.filter(a => a.isCorrect).length / answers.length * 100) : 0
    const recent5    = answers.slice(-5)
    const recentAcc  = recent5.length > 0 ? Math.round(recent5.filter(a => a.isCorrect).length / recent5.length * 100) : 0

    // ── Score(i, u, t) — tính cho từng gói can thiệp ────────────────────────
    // λ weights theo báo cáo
    const λ = { k: 0.20, b: 0.15, p: 0.15, g: 0.15, m: 0.10, t: 0.05, r: 0.10, cl: 0.05, cost: 0.05, ai: 0.05 }

    // Các Fit scores (0–100) cho mỗi thành phần
    const fitK = avgPMastery                                                 // tri thức
    const fitB = bt.hasSessions ? bt.behaviorScore : Math.max(0, overall - 10) // hành vi
    const fitP = (() => {                                                    // hồ sơ
      if (!profile) return 50
      const bgScore = profile.backgroundLevel === 'ADVANCED' ? 80 : profile.backgroundLevel === 'INTERMEDIATE' ? 60 : 40
      return bgScore
    })()
    const fitG = (() => {                                                    // mục tiêu
      if (daysToExam === null) return 60
      if (daysToExam < 30) return 30   // deadline gần, cần can thiệp mạnh
      if (daysToExam < 60) return 50
      return 75
    })()
    const fitM = (() => {                                                    // phương pháp
      if (!profile) return 60
      const srlBonus = srl.srlScore > 60 ? 15 : srl.srlScore > 30 ? 8 : 0
      return Math.min(100, 55 + srlBonus)
    })()
    const fitT = profile?.parentInvolvement === 'HIGH' ? 85 :              // tác nhân hỗ trợ
                 profile?.parentInvolvement === 'MEDIUM' ? 65 : 45
    const fitR = Math.min(100, (bktProfiles.length / Math.max(allSubjects.length, 1)) * 120) // tài nguyên
    const clPenalty = bt.hasSessions
      ? (bt.avgComprehension < 40 ? 80 : bt.avgComprehension < 65 ? 50 : 20)
      : (recentAcc < 40 ? 70 : recentAcc < 60 ? 45 : 15)
    const costPenalty = 50 // chi phí vận hành cố định
    const aiConf = Math.min(100, answers.length * 2 + (bt.hasSessions ? 20 : 0))  // AI confidence

    const scoreTotal = Math.round(
      fitK * λ.k + fitB * λ.b + fitP * λ.p + fitG * λ.g + fitM * λ.m +
      fitT * λ.t + fitR * λ.r - clPenalty * λ.cl - costPenalty * λ.cost + aiConf * λ.ai
    )

    // Package selection dựa theo score
    const packageType = scoreTotal < 40 ? 'intensive' : scoreTotal < 65 ? 'standard' : 'light'

    // Urgency tích hợp B_t^i và E_t^i
    let urgencyScore = (overall < 50 ? 3 : overall < 70 ? 2 : 1)
      + (strugglingSubjects.length > 5 ? 2 : strugglingSubjects.length > 2 ? 1 : 0)
      + (recentAcc < 40 ? 2 : recentAcc < 60 ? 1 : 0)
      + (daysToExam !== null && daysToExam < 30 ? 2 : daysToExam !== null && daysToExam < 60 ? 1 : 0)
      + (srl.srlLevel === 'low' ? 1 : 0)
      + (bt.hasSessions && bt.avgFocus < 40 ? 1 : 0)   // B_t^i: tập trung kém
      + (et.hasSessions && et.engagementScore < 35 ? 1 : 0) // E_t^i: gắn kết thấp

    const a2plmText = formatA2PLMContext(profile, srl, context, daysToExam, bt, et)

    const prompt = `${a2plmText}

DỮ LIỆU CHO RECOMMENDER SYSTEM — I_t^i = (L_t^i, M_t^i, T_t^i, R_t^i, S_t^i):

K_t^i (BKT): P(mastery) TB = ${avgPMastery}%
- Nắm vững: ${masteredSubjects.map(k => `${k.name}(${k.masteryPct}%)`).join(', ') || 'Chưa có'}
- Cần hỗ trợ: ${strugglingSubjects.map(k => `${k.name}(${k.masteryPct}%)`).slice(0,4).join(', ') || 'Chưa có'}
- Chưa học: ${notStarted.length} chuyên đề

Score(i,u,t) = ${scoreTotal}/100 → Gói: ${packageType}
(Fit_K=${fitK} | Fit_B=${fitB} | Fit_P=${fitP} | Fit_G=${fitG} | CL_penalty=${clPenalty})
Urgency: ${urgencyScore}/10
${bt.hasSessions ? `B_t^i: Tập trung ${bt.avgFocus}/100 | Hiểu bài ${bt.avgComprehension}/100 | BTVN ${bt.avgHwScore}%` : 'B_t^i: Chưa có dữ liệu buổi học'}
${et.hasSessions ? `E_t^i: Gắn kết ${et.engagementScore}/100 | Tư duy ${et.thinkingScore}/100 | Cảm xúc ${et.emotionPositiveRate}% tích cực` : 'E_t^i: Chưa có dữ liệu buổi học'}

Đề xuất gói can thiệp I_t^i tối ưu — JSON (không markdown):
{
  "packageType": "${packageType}",
  "packageLabel": "Tên gói (ngôn ngữ sư phạm, phản ánh Score=${scoreTotal})",
  "packageRationale": "Lý do chọn gói — tích hợp K_t^i, B_t^i, E_t^i và G_i",
  "interventionGoal": "Mục tiêu SMART (L_t^i) — gắn targetSchool và deadline",
  "priorityTopics": ["CĐ 1 + lý do BKT", "CĐ 2 + lý do", "CĐ 3 + lý do"],
  "learningPathway": ["Bước 1 (Ngày 1-3): ...", "Bước 2 (Ngày 4-7): ...", "Bước 3 (Tuần 2): ...", "Bước 4 (Tuần 3-4): ..."],
  "teachingMethod": "M_t^i — phương pháp phù hợp learningStyle=${profile?.learningStyle ?? 'MIXED'} và B_t^i",
  "mentorType": "T_t^i — loại tác nhân hỗ trợ phù hợp (GV/PH/AI/bạn học)",
  "resourcePlan": "R_t^i — tài nguyên đề xuất phù hợp giai đoạn và learningStyle",
  "selfStudyStrategy": "S_t^i — chiến lược tự học, nâng SRL từ ${srl.srlScore} lên cấp trên",
  "srlDevelopmentPlan": "Kế hoạch phát triển SRL trong gói can thiệp",
  "supportIntensity": "Mức hỗ trợ từ GV và PH — phù hợp parentInvolvement",
  "estimatedDays": 21,
  "successCriteria": "Tiêu chí đo lường — P(mastery) mục tiêu cho từng CĐ ưu tiên",
  "parentGuidance": "Hướng dẫn PH — phù hợp parentInvolvement=${profile?.parentInvolvement ?? 'MEDIUM'}"
}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: AVAB_SYSTEM }, { role: 'user', content: prompt }],
      max_tokens: 700,
      temperature: 0.4,
    })

    const raw = completion.choices[0].message.content || '{}'
    const intervention = JSON.parse(raw.replace(/```json|```/g, '').trim())

    const responseData = {
      stats: {
        overall, avgPMastery, masteredCount: masteredSubjects.length,
        strugglingCount: strugglingSubjects.length, notStartedCount: notStarted.length,
        recentAccuracy: recentAcc, urgencyScore, scoreTotal,
      },
      scoreComponents: { fitK, fitB, fitP, fitG, fitM, fitT, fitR, clPenalty, aiConf },
      srl,
      profile: profile ? { targetSchool: profile.targetSchool, targetGoal: profile.targetGoal, weeklyHours: profile.weeklyHours } : null,
      bt: bt.hasSessions ? { behaviorScore: bt.behaviorScore, avgFocus: bt.avgFocus, avgComprehension: bt.avgComprehension } : null,
      et: et.hasSessions ? { engagementScore: et.engagementScore, thinkingScore: et.thinkingScore } : null,
      daysToExam,
      ...intervention,
      packageType: intervention.packageType ?? packageType,
    }
    await saveAICache(userId, 'intervene', responseData)
    return NextResponse.json({ success: true, data: responseData })
  } catch (err) {
    console.error('AI intervene error:', err)
    return NextResponse.json({ success: false, error: 'AI không khả dụng' }, { status: 500 })
  }
}

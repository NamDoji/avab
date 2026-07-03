/**
 * POST /api/ai/init-all
 *
 * Generate cả 4 tab AI (diagnose, predict, intervene, recommend) song song trong 1 request.
 * Dùng cho lần khởi tạo đầu tiên — KHÔNG kiểm tra canRefresh.
 *
 * Flow:
 *  1. Auth check
 *  2. Lấy toàn bộ dữ liệu 1 lần (answers, subjects, profile, srl, context)
 *  3. Chạy 4 generator song song (Promise.all)
 *  4. Upsert 4 AIAnalysisCache records song song
 *  5. Update aiRefreshedAt 1 lần duy nhất
 *  6. Return { success: true, results: { diagnose, predict, intervene, recommend } }
 *
 * Prompts được copy nguyên từ các route riêng lẻ để đảm bảo nhất quán.
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { openai, AVAB_SYSTEM } from '@/lib/openai'
import { prisma } from '@/lib/prisma'
import { getA2PLMContext, formatA2PLMContext } from '@/lib/a2plm'

// Tăng timeout lên 60s (Vercel Pro) — 4 OpenAI calls song song có thể tốn 10-30s
export const maxDuration = 60

export async function POST(req: NextRequest) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const session = await auth()
  if (!session) {
    return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 })
  }

  try {
    const userId = (session.user as { id: string }).id

    // ── Lấy A2PLM context 1 lần (P_i, G_i, C_t^i, SRL_t^i) ─────────────────
    const { profile, srl, context, daysToExam } = await getA2PLMContext(userId, req)

    // ── Lấy toàn bộ dữ liệu cần thiết 1 lần (batch) ─────────────────────────
    const [answers, allSubjects, wrongAnswers, subjectScores] = await Promise.all([
      // Câu trả lời của user — asc để tính trend; include question để diagnose/recommend có content
      prisma.studentAnswer.findMany({
        where: { userId },
        include: {
          question: {
            select: { content: true, subjectId: true, points: true, correctAnswer: true, order: true },
          },
        },
        orderBy: { createdAt: 'asc' },
      }),
      // Tất cả môn học
      prisma.subject.findMany({
        orderBy: { order: 'asc' },
        select: { id: true, name: true, order: true, icon: true },
      }),
      // Câu sai gần nhất cho recommend
      prisma.studentAnswer.findMany({
        where: { userId, isCorrect: false },
        include: { question: { select: { content: true, correctAnswer: true, order: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      // Điểm trung bình theo môn cho recommend
      prisma.studentAnswer.groupBy({
        by: ['subjectId'],
        where: { userId },
        _avg: { score: true },
        _count: { score: true },
      }),
    ])

    // Format A2PLM context 1 lần dùng chung cho cả 4 prompt
    const a2plmText = formatA2PLMContext(profile, srl, context, daysToExam)

    // ── Generator 1: Diagnose ─────────────────────────────────────────────────
    // Bài toán 1: Chẩn đoán trạng thái người học — A2PLM đầy đủ
    // I_t = Π_θ(K_t, B_t, E_t, P, G, C_t, R, T, M)
    async function generateDiagnose(): Promise<Record<string, unknown>> {
      // Ngưỡng: 0 answers → dữ liệu mặc định, không gọi OpenAI
      if (answers.length === 0) {
        return {
          empty: true,
          message: 'Học viên đang bắt đầu hành trình. Hãy làm thử một số bài để AI có thể phân tích sâu hơn!',
          profile,
          srl,
        }
      }

      // BKT-inspired knowledge profiling
      const subjectMap: Record<string, { name: string; icon: string | null; answers: typeof answers }> = {}
      for (const s of allSubjects) subjectMap[s.id] = { name: s.name, icon: s.icon, answers: [] }
      for (const a of answers) {
        if (subjectMap[a.subjectId]) subjectMap[a.subjectId].answers.push(a)
      }

      const knowledgeProfile = allSubjects
        .filter((s) => subjectMap[s.id].answers.length > 0)
        .map((s) => {
          const sa = subjectMap[s.id].answers
          const correct = sa.filter((a) => a.isCorrect).length
          const accuracy = Math.round((correct / sa.length) * 100)
          const recent5 = sa.slice(-5).map((a) => (a.isCorrect ? 1 : 0)) as number[]
          const recentAcc =
            recent5.length > 0
              ? Math.round((recent5.reduce((a, b) => a + b, 0) / recent5.length) * 100)
              : 0
          const masteryLevel =
            accuracy >= 80 && recentAcc >= 70
              ? 'mastered'
              : accuracy >= 60
              ? 'developing'
              : accuracy >= 30
              ? 'struggling'
              : 'at_risk'
          return { subjectId: s.id, name: s.name, icon: s.icon, attempted: sa.length, accuracy, recentAccuracy: recentAcc, masteryLevel }
        })

      const totalAnswered = answers.length
      const timeSpread =
        answers.length >= 2
          ? (new Date(answers[answers.length - 1].createdAt).getTime() -
              new Date(answers[0].createdAt).getTime()) /
            (1000 * 3600 * 24)
          : 0
      const avgPerDay = timeSpread > 0 ? (totalAnswered / timeSpread).toFixed(1) : totalAnswered.toString()

      const half = Math.floor(answers.length / 2)
      const earlyAcc =
        half > 0 ? Math.round((answers.slice(0, half).filter((a) => a.isCorrect).length / half) * 100) : 0
      const lateAcc =
        half > 0
          ? Math.round((answers.slice(half).filter((a) => a.isCorrect).length / (answers.length - half)) * 100)
          : 0
      const learningTrend = lateAcc - earlyAcc

      let currentStreak = 0
      let maxConsecutiveWrong = 0
      for (const a of answers) {
        if (!a.isCorrect) {
          currentStreak++
          maxConsecutiveWrong = Math.max(maxConsecutiveWrong, currentStreak)
        } else {
          currentStreak = 0
        }
      }
      const cognitiveLoadLevel = maxConsecutiveWrong >= 6 ? 'high' : maxConsecutiveWrong >= 3 ? 'medium' : 'low'

      const subjectsCovered = new Set(answers.map((a) => a.subjectId)).size
      const engagementScore = Math.min(
        100,
        Math.round((subjectsCovered / allSubjects.length) * 60 + (totalAnswered / 100) * 40),
      )
      const engagementLevel = engagementScore >= 60 ? 'high' : engagementScore >= 30 ? 'medium' : 'low'

      const mastered = knowledgeProfile.filter((k) => k.masteryLevel === 'mastered')
      const developing = knowledgeProfile.filter((k) => k.masteryLevel === 'developing')
      const struggling = knowledgeProfile.filter((k) => ['struggling', 'at_risk'].includes(k.masteryLevel))

      const prompt = `${a2plmText}

DỮ LIỆU HỌC TẬP THỰC TẾ (K_t^i, B_t^i, E_t^i):
TRI THỨC (BKT-inspired):
- Nắm vững (≥80%): ${mastered.map((k) => k.name).join(', ') || 'Chưa có'}
- Đang phát triển (60-79%): ${developing.map((k) => k.name).join(', ') || 'Chưa có'}
- Cần hỗ trợ (<60%): ${struggling.map((k) => k.name).join(', ') || 'Chưa có'}

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
        messages: [
          { role: 'system', content: AVAB_SYSTEM },
          { role: 'user', content: prompt },
        ],
        max_tokens: 600,
        temperature: 0.3,
      })

      const raw = completion.choices[0].message.content ?? '{}'
      const aiDiagnosis = JSON.parse(raw.replace(/```json|```/g, '').trim())

      return {
        knowledgeProfile,
        masteredCount: mastered.length,
        developingCount: developing.length,
        strugglingCount: struggling.length,
        totalSubjects: allSubjects.length,
        behavior: {
          totalAnswered,
          avgPerDay,
          learningTrend,
          learningTrendLabel:
            learningTrend > 5 ? 'Đang tiến bộ tốt' : learningTrend < -5 ? 'Có dấu hiệu chững lại' : 'Ổn định',
        },
        cognitive: { load: cognitiveLoadLevel, maxConsecutiveWrong },
        engagement: { level: engagementLevel, score: engagementScore, subjectsCovered },
        srl,
        profile,
        context: { device: context.device, timeOfDay: context.timeOfDay, note: context.contextNote },
        daysToExam,
        ...aiDiagnosis,
      }
    }

    // ── Generator 2: Predict ──────────────────────────────────────────────────
    // Bài toán 2: Dự báo tiến trình học tập — A2PLM đầy đủ
    // π* = argmax_π E[Σ γᵗ(μ₁ΔK + μ₂SRL + μ₃ENG + μ₄RET - μ₅CL - μ₆COST)]
    async function generatePredict(): Promise<Record<string, unknown>> {
      // Predict không có ngưỡng riêng — dùng mọi dữ liệu có
      // Đảo thứ tự để recent = mới nhất (answers gốc là asc)
      const answersDesc = [...answers].reverse()

      const totalAnswered = answers.length
      const totalCorrect = answers.filter((a) => a.isCorrect).length
      const overallAccuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0
      const subjectsDone = new Set(answers.map((a) => a.subjectId)).size
      const totalSubjects = allSubjects.length
      const coveragePct = totalSubjects > 0 ? Math.round((subjectsDone / totalSubjects) * 100) : 0
      const totalScore = answers.reduce((sum, a) => sum + a.score, 0)

      const recent = answersDesc.slice(0, Math.min(50, answersDesc.length))
      const early = answersDesc.slice(-Math.min(50, answersDesc.length))
      const recentAccuracy =
        recent.length > 0 ? Math.round((recent.filter((a) => a.isCorrect).length / recent.length) * 100) : 0
      const earlyAccuracy =
        early.length > 0 ? Math.round((early.filter((a) => a.isCorrect).length / early.length) * 100) : 0
      const improvement = recentAccuracy - earlyAccuracy

      // Tính xác suất đỗ
      let probability = 0
      probability += Math.min(overallAccuracy * 0.4, 40)
      probability += Math.min(coveragePct * 0.3, 30)
      probability += Math.min(totalAnswered * 0.1, 15)
      probability += Math.max(0, Math.min(improvement * 0.5, 15))
      // Điều chỉnh theo G_i deadline
      if (daysToExam !== null && daysToExam < 30 && overallAccuracy < 60) probability *= 0.9
      probability = Math.round(Math.min(probability, 98))

      const engagementRiskScore = Math.max(0, 100 - coveragePct - Math.min(totalAnswered / 2, 30))
      const engagementRisk = engagementRiskScore > 60 ? 'high' : engagementRiskScore > 30 ? 'medium' : 'low'

      const recentAnswers = answersDesc.slice(0, 10)
      let streak = 0
      let maxStreak = 0
      for (const a of recentAnswers) {
        if (!a.isCorrect) {
          streak++
          maxStreak = Math.max(maxStreak, streak)
        } else {
          streak = 0
        }
      }
      const cognitiveLoad = maxStreak >= 5 ? 'high' : maxStreak >= 3 ? 'medium' : 'low'

      const readinessScore = Math.round(overallAccuracy * 0.5 + coveragePct * 0.3 + Math.min(improvement, 20) * 0.2)
      const readinessToAdvance = readinessScore >= 70 ? 'ready' : readinessScore >= 45 ? 'borderline' : 'not_ready'
      const retentionSignal = srl.srlLevel === 'high' ? 'strong' : srl.srlLevel === 'medium' ? 'moderate' : 'weak'

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
        messages: [
          { role: 'system', content: AVAB_SYSTEM },
          { role: 'user', content: prompt },
        ],
        max_tokens: 550,
        temperature: 0.3,
      })

      const raw = completion.choices[0].message.content ?? '{}'
      const prediction = JSON.parse(raw.replace(/```json|```/g, '').trim())

      return {
        stats: { totalScore, overallAccuracy, subjectsDone, totalSubjects, coveragePct, totalAnswered, improvement, recentAccuracy },
        multiDimension: { engagementRisk, cognitiveLoad, readinessToAdvance },
        srl,
        profile: profile
          ? { targetSchool: profile.targetSchool, targetGoal: profile.targetGoal, backgroundLevel: profile.backgroundLevel }
          : null,
        daysToExam,
        ...prediction,
        probability: (prediction as Record<string, unknown>).probability ?? probability,
      }
    }

    // ── Generator 3: Intervene ────────────────────────────────────────────────
    // Bài toán 3: Lựa chọn gói can thiệp sư phạm — A2PLM đầy đủ
    // Recommender systems — context-aware decision making
    async function generateIntervene(): Promise<Record<string, unknown>> {
      // Ngưỡng: < 5 answers → dữ liệu mặc định, không gọi OpenAI
      if (answers.length < 5) {
        return {
          empty: true,
          message: 'Cần ít nhất 5 câu trả lời để AI đề xuất gói can thiệp.',
          profile,
        }
      }

      const subjectStats: Record<string, { correct: number; total: number }> = {}
      for (const a of answers) {
        if (!subjectStats[a.subjectId]) subjectStats[a.subjectId] = { correct: 0, total: 0 }
        subjectStats[a.subjectId].total++
        if (a.isCorrect) subjectStats[a.subjectId].correct++
      }

      const overall =
        answers.length > 0
          ? Math.round((answers.filter((a) => a.isCorrect).length / answers.length) * 100)
          : 0
      const masteredSubjects = allSubjects.filter((s) => {
        const st = subjectStats[s.id]
        return st && st.total >= 3 && st.correct / st.total >= 0.8
      })
      const strugglingSubjects = allSubjects.filter((s) => {
        const st = subjectStats[s.id]
        return st && st.correct / st.total < 0.5
      })
      const notStarted = allSubjects.filter((s) => !subjectStats[s.id])

      const recent5 = answers.slice(-5)
      const recentAcc =
        recent5.length > 0
          ? Math.round((recent5.filter((a) => a.isCorrect).length / recent5.length) * 100)
          : 0

      // Urgency — tính COST: deadline, SRL, accuracy
      let urgencyScore =
        (overall < 50 ? 3 : overall < 70 ? 2 : 1) +
        (strugglingSubjects.length > 5 ? 2 : strugglingSubjects.length > 2 ? 1 : 0) +
        (recentAcc < 40 ? 2 : recentAcc < 60 ? 1 : 0) +
        (daysToExam !== null && daysToExam < 30 ? 2 : daysToExam !== null && daysToExam < 60 ? 1 : 0) +
        (srl.srlLevel === 'low' ? 1 : 0)

      const packageType = urgencyScore >= 6 ? 'intensive' : urgencyScore >= 3 ? 'standard' : 'light'

      const prompt = `${a2plmText}

DỮ LIỆU ĐẦU VÀO CHO RECOMMENDER SYSTEM:
- Độ chính xác tổng: ${overall}% | Gần đây: ${recentAcc}%
- Nắm vững: ${masteredSubjects.length} CĐ (${masteredSubjects.map((s) => s.name).join(', ') || 'Chưa có'})
- Cần hỗ trợ: ${strugglingSubjects.length} CĐ (${strugglingSubjects
        .map((s) => s.name)
        .slice(0, 4)
        .join(', ') || 'Chưa có'})
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
        messages: [
          { role: 'system', content: AVAB_SYSTEM },
          { role: 'user', content: prompt },
        ],
        max_tokens: 650,
        temperature: 0.4,
      })

      const raw = completion.choices[0].message.content ?? '{}'
      const intervention = JSON.parse(raw.replace(/```json|```/g, '').trim())

      return {
        stats: {
          overall,
          masteredCount: masteredSubjects.length,
          strugglingCount: strugglingSubjects.length,
          notStartedCount: notStarted.length,
          recentAccuracy: recentAcc,
          urgencyScore,
        },
        srl,
        profile: profile
          ? { targetSchool: profile.targetSchool, targetGoal: profile.targetGoal, weeklyHours: profile.weeklyHours }
          : null,
        daysToExam,
        ...intervention,
        packageType: (intervention as Record<string, unknown>).packageType ?? packageType,
      }
    }

    // ── Generator 4: Recommend ────────────────────────────────────────────────
    // Bài toán 4: Khuyến nghị can thiệp sư phạm — A2PLM đầy đủ
    // Aware recommendation: context × profile × goals × SRL
    async function generateRecommend(): Promise<Record<string, unknown>> {
      const totalAcc =
        answers.length > 0
          ? Math.round((answers.filter((a) => a.isCorrect).length / answers.length) * 100)
          : 0
      const supportLevel = totalAcc < 50 ? 'high' : totalAcc < 70 ? 'medium' : 'low'

      // Lấy tên các môn yếu từ subjectScores (đã batch ở trên)
      const weakSubjectIds = subjectScores.filter((s) => (s._avg.score ?? 0) < 0.6).map((s) => s.subjectId)
      const weakSubjectNames = await prisma.subject.findMany({
        where: weakSubjectIds.length > 0 ? { id: { in: weakSubjectIds } } : {},
        take: 3,
        select: { name: true, icon: true },
      })

      const prompt = `${a2plmText}

BỐI CẢNH HỌC TẬP HIỆN TẠI:
- Độ chính xác: ${totalAcc}% | Mức hỗ trợ cần: ${supportLevel}
- Câu sai gần đây: ${wrongAnswers.length}
${
  wrongAnswers.length > 0
    ? `Câu sai điển hình:\n${wrongAnswers
        .slice(0, 5)
        .map((a) => `- "${a.question.content}" (đúng: ${a.question.correctAnswer})`)
        .join('\n')}`
    : ''
}
- Chuyên đề còn yếu: ${weakSubjectNames.map((s) => s.name).join(', ') || 'Chưa xác định'}

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
        messages: [
          { role: 'system', content: AVAB_SYSTEM },
          { role: 'user', content: prompt },
        ],
        max_tokens: 600,
        temperature: 0.5,
      })

      const raw = completion.choices[0].message.content ?? '{}'
      const recommendations = JSON.parse(raw.replace(/```json|```/g, '').trim())

      return {
        ...recommendations,
        supportLevel,
        srl,
        profile: profile
          ? { learningStyle: profile.learningStyle, parentInvolvement: profile.parentInvolvement, targetGoal: profile.targetGoal }
          : null,
        daysToExam,
      }
    }

    // ── Chạy 4 generator song song — mỗi cái fail riêng ──────────────────────
    const [diagnose, predict, intervene, recommend] = await Promise.all([
      generateDiagnose().catch((e: unknown) => { console.error('diagnose fail:', e); return { error: true } }),
      generatePredict().catch((e: unknown) => { console.error('predict fail:', e); return { error: true } }),
      generateIntervene().catch((e: unknown) => { console.error('intervene fail:', e); return { error: true } }),
      generateRecommend().catch((e: unknown) => { console.error('recommend fail:', e); return { error: true } }),
    ])

    // ── Upsert 4 cache records song song (không update aiRefreshedAt ở đây) ───
    const now = new Date()
    await Promise.all([
      prisma.aIAnalysisCache.upsert({
        where: { userId_analysisType: { userId, analysisType: 'diagnose' } },
        update: { data: diagnose as object, refreshedAt: now },
        create: { userId, analysisType: 'diagnose', data: diagnose as object, refreshedAt: now },
      }),
      prisma.aIAnalysisCache.upsert({
        where: { userId_analysisType: { userId, analysisType: 'predict' } },
        update: { data: predict as object, refreshedAt: now },
        create: { userId, analysisType: 'predict', data: predict as object, refreshedAt: now },
      }),
      prisma.aIAnalysisCache.upsert({
        where: { userId_analysisType: { userId, analysisType: 'intervene' } },
        update: { data: intervene as object, refreshedAt: now },
        create: { userId, analysisType: 'intervene', data: intervene as object, refreshedAt: now },
      }),
      prisma.aIAnalysisCache.upsert({
        where: { userId_analysisType: { userId, analysisType: 'recommend' } },
        update: { data: recommend as object, refreshedAt: now },
        create: { userId, analysisType: 'recommend', data: recommend as object, refreshedAt: now },
      }),
    ])

    // ── Update aiRefreshedAt 1 lần duy nhất ───────────────────────────────────
    await prisma.user.update({
      where: { id: userId },
      data: { aiRefreshedAt: now },
    })

    return NextResponse.json({
      success: true,
      results: { diagnose, predict, intervene, recommend },
    })
  } catch (err) {
    console.error('AI init-all error:', err)
    return NextResponse.json({ success: false, error: 'AI không khả dụng' }, { status: 500 })
  }
}

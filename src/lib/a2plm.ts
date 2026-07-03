/**
 * A2PLM Helper — AI-Augmented Adaptive Personalized Learning Model
 * Các hàm tính toán P_i, G_i, C_t^i, SRL_t^i cho 4 bài toán AI giáo dục
 */

import { NextRequest } from 'next/server'
import { prisma } from './prisma'

// ── C_t^i: Ngữ cảnh học tập ────────────────────────────────────────────────

export function extractLearningContext(req: NextRequest) {
  const ua = req.headers.get('user-agent') ?? ''
  const now = new Date()
  const hour = now.getHours() // server time (UTC) — close enough for proxy

  // Device detection
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone/i.test(ua)
  const isTablet = /iPad|Android.*Tablet/i.test(ua)
  const device = isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop'

  // Time of day (Vietnam GMT+7)
  const vnHour = (hour + 7) % 24
  const timeOfDay =
    vnHour >= 5 && vnHour < 9   ? 'buổi sáng sớm (5–9h)' :
    vnHour >= 9 && vnHour < 12  ? 'buổi sáng (9–12h)' :
    vnHour >= 12 && vnHour < 14 ? 'buổi trưa (12–14h)' :
    vnHour >= 14 && vnHour < 18 ? 'buổi chiều (14–18h)' :
    vnHour >= 18 && vnHour < 22 ? 'buổi tối (18–22h)' :
                                   'đêm khuya (22–5h)'

  return {
    device,
    timeOfDay,
    vnHour,
    isMobile,
    // Gợi ý theo context
    contextNote:
      vnHour >= 22 || vnHour < 5
        ? 'Học đêm khuya — tải nhận thức thường cao hơn, nên rút ngắn session'
        : device === 'mobile'
        ? 'Học trên di động — ưu tiên bài ngắn, có hình ảnh rõ ràng'
        : 'Điều kiện học tập tiêu chuẩn',
  }
}

// ── SRL_t^i: Năng lực tự học ───────────────────────────────────────────────

export async function computeSRL(userId: string): Promise<{
  srlScore: number          // 0–100
  srlLevel: 'high' | 'medium' | 'low'
  srlLabel: string
  breadthScore: number      // Độ đa dạng chủ đề (0–100)
  consistencyScore: number  // Độ đều đặn học (0–100)
  initiativeScore: number   // Chủ động làm bài tập AI (0–100)
  details: string
}> {
  const [answers, allSubjects, aiSets] = await Promise.all([
    prisma.studentAnswer.findMany({
      where: { userId },
      select: { subjectId: true, isCorrect: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.subject.count(),
    // Bài AI do học viên tạo (chủ động) — chỉ tính homeworkSet của chính họ
    prisma.homeworkSet.count({
      where: { isAIGenerated: true, aiGeneratorId: userId },
    }),
  ])

  if (answers.length === 0) {
    return { srlScore: 0, srlLevel: 'low', srlLabel: 'Chưa có dữ liệu', breadthScore: 0, consistencyScore: 0, initiativeScore: 0, details: 'Chưa làm bài' }
  }

  // 1. Breadth: số chuyên đề khác nhau / tổng chuyên đề
  const uniqueSubjects = new Set(answers.map(a => a.subjectId)).size
  const breadthScore = Math.min(100, Math.round((uniqueSubjects / allSubjects) * 100))

  // 2. Consistency: phân phối đều đặn theo ngày
  const daySet = new Set(answers.map(a => a.createdAt.toISOString().slice(0, 10))).size
  const totalDays = answers.length >= 2
    ? Math.max(1, Math.round((answers[answers.length - 1].createdAt.getTime() - answers[0].createdAt.getTime()) / (1000 * 3600 * 24)))
    : 1
  const consistencyScore = Math.min(100, Math.round((daySet / totalDays) * 100))

  // 3. Initiative: số bài AI tự tạo (SRL hành vi chủ động nhất)
  const initiativeScore = Math.min(100, aiSets * 20) // mỗi bài = 20 điểm, tối đa 5 bài

  // SRL tổng hợp (weighted)
  const srlScore = Math.round(breadthScore * 0.4 + consistencyScore * 0.4 + initiativeScore * 0.2)
  const srlLevel = srlScore >= 60 ? 'high' : srlScore >= 30 ? 'medium' : 'low'
  const srlLabel =
    srlLevel === 'high' ? 'Tự chủ cao — học chủ động, đa dạng, đều đặn' :
    srlLevel === 'medium' ? 'Tự chủ trung bình — cần hỗ trợ định hướng' :
    'Tự chủ thấp — cần hướng dẫn chặt chẽ'

  return {
    srlScore, srlLevel, srlLabel,
    breadthScore, consistencyScore, initiativeScore,
    details: `Chuyên đề: ${uniqueSubjects}/${allSubjects} · Ngày học: ${daySet}/${totalDays} · Bài AI tự tạo: ${aiSets}`,
  }
}

// ── Lấy toàn bộ context A2PLM ─────────────────────────────────────────────

export async function getA2PLMContext(userId: string, req: NextRequest) {
  const [profile, srl] = await Promise.all([
    prisma.learnerProfile.findUnique({ where: { userId } }).catch(() => null),
    computeSRL(userId),
  ])

  const context = extractLearningContext(req)

  // Tính ngày còn lại đến deadline G_i
  let daysToExam: number | null = null
  if (profile?.targetDate) {
    daysToExam = Math.max(0, Math.round((profile.targetDate.getTime() - Date.now()) / (1000 * 3600 * 24)))
  }

  return { profile, srl, context, daysToExam }
}

// ── Format context thành text cho GPT prompt ──────────────────────────────

export function formatA2PLMContext(profile: any, srl: ReturnType<typeof computeSRL> extends Promise<infer T> ? T : never, context: ReturnType<typeof extractLearningContext>, daysToExam: number | null): string {
  const lines: string[] = []

  // P_i — Hồ sơ người học
  if (profile) {
    lines.push(`HỒ SƠ NGƯỜI HỌC (P_i):`)
    lines.push(`- Trình độ nền: ${profile.backgroundLevel === 'BEGINNER' ? 'Mới bắt đầu' : profile.backgroundLevel === 'INTERMEDIATE' ? 'Trung bình' : 'Khá'}`)
    lines.push(`- Phong cách học: ${profile.learningStyle === 'VISUAL' ? 'Trực quan (hình ảnh)' : profile.learningStyle === 'READING' ? 'Đọc hiểu' : profile.learningStyle === 'KINESTHETIC' ? 'Thực hành' : 'Đa dạng'}`)
    lines.push(`- Năng lực tự học: ${profile.selfStudyCapacity === 'HIGH' ? 'Cao' : profile.selfStudyCapacity === 'MEDIUM' ? 'Trung bình' : 'Thấp'}`)
    lines.push(`- Phụ huynh đồng hành: ${profile.parentInvolvement === 'HIGH' ? 'Cao (học cùng con)' : profile.parentInvolvement === 'MEDIUM' ? 'Vừa phải' : 'Ít'}`)
    lines.push(`- Thời gian học/tuần: ${profile.weeklyHours} giờ`)
    if (profile.additionalNotes) lines.push(`- Ghi chú: ${profile.additionalNotes}`)
  } else {
    lines.push(`HỒ SƠ NGƯỜI HỌC (P_i): Chưa thiết lập (dùng giá trị mặc định)`)
  }

  // G_i — Mục tiêu học tập
  lines.push(`\nMỤC TIÊU HỌC TẬP (G_i):`)
  if (profile) {
    lines.push(`- Mục tiêu: ${profile.targetGoal === 'SCHOLARSHIP' ? 'Học bổng / đỗ trường chất lượng cao' : profile.targetGoal === 'FOUNDATION' ? 'Củng cố nền tảng' : 'Nâng cao'}`)
    if (profile.targetSchool) lines.push(`- Trường mục tiêu: ${profile.targetSchool}`)
    if (daysToExam !== null) lines.push(`- Thời gian còn lại: ${daysToExam} ngày đến kỳ thi`)
    else if (profile.targetDate) lines.push(`- Kỳ thi: ${new Date(profile.targetDate).toLocaleDateString('vi-VN')}`)
    else lines.push(`- Chưa đặt deadline cụ thể`)
  } else {
    lines.push(`- Mục tiêu mặc định: Học bổng lớp 1`)
  }

  // SRL_t^i — Năng lực tự học
  lines.push(`\nNĂNG LỰC TỰ HỌC (SRL_t^i): ${srl.srlScore}/100 — ${srl.srlLabel}`)
  lines.push(`- Chi tiết: ${srl.details}`)

  // C_t^i — Ngữ cảnh học tập
  lines.push(`\nNGỮ CẢNH HỌC TẬP (C_t^i):`)
  lines.push(`- Thiết bị: ${context.device === 'mobile' ? 'Di động' : context.device === 'tablet' ? 'Máy tính bảng' : 'Máy tính'}`)
  lines.push(`- Thời điểm: ${context.timeOfDay}`)
  lines.push(`- Lưu ý ngữ cảnh: ${context.contextNote}`)

  return lines.join('\n')
}

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { openai } from '@/lib/openai'

async function requireAdminOrTeacher() {
  const session = await auth()
  if (!session?.user) return { error: 'Chưa đăng nhập', status: 401 as const }
  const role = (session.user as any).role
  if (role !== 'ADMIN' && role !== 'TEACHER') return { error: 'Không có quyền', status: 403 as const }
  return { session, role, userId: (session.user as any).id as string }
}

const L: Record<number, string> = { 1: 'Rất yếu', 2: 'Yếu', 3: 'Trung bình', 4: 'Tốt', 5: 'Xuất sắc' }
const E: Record<string, string> = {
  great: 'Rất vui vẻ, hứng khởi', good: 'Vui vẻ, tích cực',
  neutral: 'Bình thường', tired: 'Mệt mỏi, buồn ngủ', frustrated: 'Chán nản, khó chịu',
}

// Random variation để nhận xét không lặp
const STYLE_VARIANTS = [
  'Bắt đầu bằng quan sát cụ thể về hành vi trong buổi học, sau đó phân tích',
  'Bắt đầu bằng điểm mạnh nổi bật nhất, sau đó dẫn vào nhận xét tổng quan',
  'Bắt đầu bằng sự so sánh tiến bộ so với buổi trước, sau đó nhận xét hiện tại',
  'Bắt đầu bằng câu hỏi tu từ hoặc nhận xét cảm xúc, sau đó phân tích khách quan',
  'Bắt đầu bằng một điểm cụ thể con làm tốt hoặc chưa tốt nhất, sau đó mở rộng',
]

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; feedbackId: string }> }
) {
  const check = await requireAdminOrTeacher()
  if ('error' in check) return NextResponse.json({ success: false, error: check.error }, { status: check.status })

  const { id: subjectId, feedbackId } = await params
  const { userId } = await req.json()

  const feedback = await prisma.sessionFeedback.findUnique({
    where: { id: feedbackId },
    include: {
      subject: { select: { name: true, courseId: true } },
      records: {
        where: userId ? { userId } : {},
        include: { user: { select: { id: true, name: true } } },
      },
    },
  })
  if (!feedback) return NextResponse.json({ success: false, error: 'Không tìm thấy session' }, { status: 404 })

  // TEACHER chỉ được gọi nếu là người tạo buổi học
  if (check.role === 'TEACHER' && feedback.createdBy !== check.userId) {
    return NextResponse.json({ success: false, error: 'Bạn không có quyền với buổi học này' }, { status: 403 })
  }

  const records = feedback.records
  if (records.length === 0) return NextResponse.json({ success: false, error: 'Không có học sinh' }, { status: 400 })

  // Lấy lịch sử buổi trước (tối đa 3) để so sánh tiến bộ + tránh lặp
  const prevFeedbacks = await prisma.sessionFeedback.findMany({
    where: { subjectId, createdAt: { lt: feedback.createdAt } },
    orderBy: { sessionDate: 'desc' },
    take: 3,
    include: {
      records: {
        select: {
          userId: true, focusLevel: true, comprehension: true,
          hwScore: true, attendance: true, aiComment: true,
        },
      },
    },
  })

  // Số buổi học để tính session index
  const sessionNumber = prevFeedbacks.length + 1

  const results: Record<string, string> = {}

  for (const record of records) {
    const prevData = prevFeedbacks
      .map(pf => pf.records.find(r => r.userId === record.userId))
      .filter(Boolean)

    // Lịch sử tiến bộ
    const trendFocus = prevData.map(p => p?.focusLevel ?? '?').join('→')
    const trendComp = prevData.map(p => p?.comprehension ?? '?').join('→')
    const prevComparison = prevData.length > 0
      ? `Tiến trình ${sessionNumber} buổi — Tập trung: ${trendFocus}; Hiểu bài: ${trendComp}`
      : 'Đây là buổi đầu tiên được ghi nhận'

    // Nhận xét AI buổi trước (để GPT tránh lặp)
    const prevComment = (prevData[0] as any)?.aiComment
    const prevOpeningLine = prevComment
      ? prevComment.split('\n')[0].slice(0, 80)
      : null

    // Chọn style viết ngẫu nhiên để không nhàm
    const styleVariant = STYLE_VARIANTS[Math.floor(Math.random() * STYLE_VARIANTS.length)]

    // Điểm nổi bật để cá nhân hóa
    const highlights: string[] = []
    if (record.focusLevel === 5) highlights.push('tập trung xuất sắc')
    if (record.focusLevel !== null && record.focusLevel <= 2) highlights.push('hay mất tập trung')
    if (record.speakingCount !== null && record.speakingCount >= 5) highlights.push(`phát biểu nhiều (${record.speakingCount} lần)`)
    if (record.speakingCount === 0) highlights.push('chưa phát biểu lần nào')
    if (record.comprehension === 5) highlights.push('hiểu bài rất nhanh')
    if (record.comprehension !== null && record.comprehension <= 2) highlights.push('chưa nắm vững bài')
    if (record.emotionState === 'great') highlights.push('rất hứng khởi học tập')
    if (record.emotionState === 'tired') highlights.push('có vẻ mệt mỏi')
    if (record.observation === 5 || record.patternRecognition === 5) highlights.push('kỹ năng tư duy tốt')

    const highlightText = highlights.length > 0 ? `Điểm nổi bật: ${highlights.join(', ')}` : ''

    const prompt = `Bạn là giáo viên dạy Toán Tư Duy cho trẻ 5-6 tuổi tại AvaB. Viết nhận xét buổi học cho: ${record.user.name ?? 'học sinh'} — Buổi ${sessionNumber} — Chuyên đề: ${feedback.subject.name}.

PHONG CÁCH VIẾT LẦN NÀY: ${styleVariant}
${prevOpeningLine ? `TRÁNH bắt đầu tương tự: "${prevOpeningLine}..."` : ''}
${highlightText}

DỮ LIỆU BUỔI HỌC:
- Có mặt: ${record.attendance ? 'Có' : 'Vắng'}
${record.attendance ? `- Tập trung: ${record.focusLevel ? `${L[record.focusLevel]} (${record.focusLevel}/5)` : 'Chưa đánh giá'}
- Tham gia: ${record.participationLevel ? `${L[record.participationLevel]}/5` : '-'} | Phát biểu: ${record.speakingCount ?? '-'} lần
- Trả lời câu hỏi: ${record.answerQuality ? `${L[record.answerQuality]}/5` : '-'} | Hiểu bài: ${record.comprehension ? `${L[record.comprehension]}/5` : '-'}
- Ý thức: ${record.discipline ? `${L[record.discipline]}/5` : '-'} | Cảm xúc: ${record.emotionState ? E[record.emotionState] : '-'}
- KN tư duy: Quan sát ${record.observation ?? '-'} | So sánh ${record.comparison ?? '-'} | Phân loại ${record.classification ?? '-'} | Quy luật ${record.patternRecognition ?? '-'} | Diễn đạt ${record.expression ?? '-'}
- BTVN buổi trước: ${record.hwScore !== null ? `${record.hwScore}% (${record.hwCorrect}/${record.hwTotal} đúng)` : 'Chưa làm'}
${record.teacherNote ? `- Ghi chú GV: ${record.teacherNote}` : ''}` : ''}

TIẾN BỘ: ${prevComparison}

Trả về JSON (không markdown, không code block):
{
  "overview": "2-3 câu tổng quan — ${styleVariant.slice(0, 30)}...",
  "strengths": "Điểm mạnh cụ thể, kể tên kỹ năng hoặc hành vi",
  "improvements": "1-2 điểm cần cải thiện, lời lẽ xây dựng nhẹ nhàng",
  "parentNote": "Khuyến nghị phụ huynh — cụ thể, có thể làm ngay tại nhà tối nay",
  "nextPlan": "Kế hoạch buổi tiếp theo — cụ thể, ngắn",
  "encouragement": "Câu động viên cá nhân, ấm áp, phù hợp tên ${record.user.name ?? 'con'}"
}`

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
        temperature: 0.85, // cao để đa dạng
      })
      const raw = completion.choices[0].message.content || '{}'
      // Clean JSON from potential code blocks
      const cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim()
      const parsed = JSON.parse(cleaned)

      const fullComment = [
        `📋 **Tổng quan:** ${parsed.overview}`,
        `✨ **Điểm mạnh:** ${parsed.strengths}`,
        `💪 **Cần cải thiện:** ${parsed.improvements}`,
        `👨‍👩‍👧 **Gửi phụ huynh:** ${parsed.parentNote}`,
        `📅 **Buổi tiếp theo:** ${parsed.nextPlan}`,
        `🌟 **Động viên:** ${parsed.encouragement}`,
      ].join('\n\n')

      await prisma.studentSessionRecord.update({
        where: { feedbackId_userId: { feedbackId, userId: record.userId } },
        data: { aiComment: fullComment, aiCommentAt: new Date() },
      })

      results[record.userId] = fullComment
    } catch (err) {
      console.error(`AI generate error for ${record.userId}:`, err)
      results[record.userId] = 'ERROR'
    }
  }

  // Lọc bỏ lỗi trước khi trả về
  const successResults = Object.fromEntries(
    Object.entries(results).filter(([, v]) => v !== 'ERROR')
  )

  return NextResponse.json({
    success: true,
    data: successResults,
    errors: Object.keys(results).filter(k => results[k] === 'ERROR'),
  })
}

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { openai } from '@/lib/openai'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user) return { error: 'Chưa đăng nhập', status: 401 }
  if ((session.user as any).role !== 'ADMIN') return { error: 'Không có quyền', status: 403 }
  return { session }
}

const LEVEL_LABELS: Record<number, string> = { 1: 'Rất thấp', 2: 'Thấp', 3: 'Trung bình', 4: 'Tốt', 5: 'Xuất sắc' }
const EMOTION_LABELS: Record<string, string> = {
  great: 'Rất vui vẻ, hứng khởi', good: 'Vui vẻ, tích cực',
  neutral: 'Bình thường', tired: 'Mệt mỏi, buồn ngủ', frustrated: 'Chán nản, khó chịu',
}

// POST: Sinh AI nhận xét cho 1 hoặc tất cả học sinh
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; feedbackId: string }> }
) {
  const check = await requireAdmin()
  if (check.error) return NextResponse.json({ success: false, error: check.error }, { status: check.status })

  const { id: subjectId, feedbackId } = await params
  const body = await req.json()
  const { userId } = body // nếu null → sinh cho tất cả

  // Lấy thông tin session
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

  const records = feedback.records
  if (records.length === 0) return NextResponse.json({ success: false, error: 'Không có học sinh' }, { status: 400 })

  // Lấy lịch sử buổi trước để so sánh tiến bộ
  const prevFeedbacks = await prisma.sessionFeedback.findMany({
    where: { subjectId, createdAt: { lt: feedback.createdAt } },
    orderBy: { sessionDate: 'desc' },
    take: 3,
    include: {
      records: {
        where: userId ? { userId } : {},
        select: { userId: true, focusLevel: true, comprehension: true, hwScore: true, attendance: true },
      },
    },
  })

  const results: Record<string, string> = {}

  for (const record of records) {
    // Dữ liệu buổi trước của học sinh này
    const prevData = prevFeedbacks
      .map(pf => pf.records.find(r => r.userId === record.userId))
      .filter(Boolean)

    const prevComparison = prevData.length > 0
      ? `Các buổi trước: Tập trung ${prevData.map(p => p?.focusLevel ?? '?').join('→')}; Hiểu bài ${prevData.map(p => p?.comprehension ?? '?').join('→')}`
      : 'Đây là buổi đầu tiên được ghi nhận'

    const prompt = `Bạn là giáo viên chuyên dạy trẻ em 5-6 tuổi luyện thi học bổng lớp 1 tại AvaB.
Hãy viết nhận xét buổi học cho học sinh ${record.user.name ?? 'học sinh'} trong buổi ${feedback.subject.name}.

DỮ LIỆU BUỔI HỌC HÔM NAY:
- Có mặt: ${record.attendance ? 'Có' : 'Vắng'}
${record.attendance ? `
- Tập trung: ${record.focusLevel ? `${LEVEL_LABELS[record.focusLevel]} (${record.focusLevel}/5)` : 'Chưa đánh giá'}
- Tham gia: ${record.participationLevel ? `${LEVEL_LABELS[record.participationLevel]} (${record.participationLevel}/5)` : 'Chưa đánh giá'}
- Số lần phát biểu: ${record.speakingCount ?? 'Chưa ghi nhận'}
- Kết quả trả lời: ${record.answerQuality ? `${LEVEL_LABELS[record.answerQuality]} (${record.answerQuality}/5)` : 'Chưa đánh giá'}
- Hiểu bài: ${record.comprehension ? `${LEVEL_LABELS[record.comprehension]} (${record.comprehension}/5)` : 'Chưa đánh giá'}
- Ý thức học tập: ${record.discipline ? `${LEVEL_LABELS[record.discipline]} (${record.discipline}/5)` : 'Chưa đánh giá'}
${record.observation || record.comparison || record.classification ? `
KỸ NĂNG TƯ DUY:
- Quan sát: ${record.observation ? `${record.observation}/5` : '-'} | So sánh: ${record.comparison ? `${record.comparison}/5` : '-'} | Phân loại: ${record.classification ? `${record.classification}/5` : '-'}
- Quy luật: ${record.patternRecognition ? `${record.patternRecognition}/5` : '-'} | Diễn đạt: ${record.expression ? `${record.expression}/5` : '-'}` : ''}
- Cảm xúc/thái độ: ${record.emotionState ? EMOTION_LABELS[record.emotionState] : 'Không ghi nhận'}
- Điểm BTVN buổi trước: ${record.hwScore !== null ? `${record.hwScore}% (${record.hwCorrect}/${record.hwTotal} câu đúng)` : 'Chưa làm BTVN'}
${record.teacherNote ? `- Ghi chú GV: ${record.teacherNote}` : ''}` : ''}

SO VỚI BUỔI TRƯỚC: ${prevComparison}

YÊU CẦU NHẬN XÉT:
- Tự nhiên, chân thật, không dùng mẫu cố định
- Đề cập tiến bộ hoặc sa sút cụ thể so với buổi trước
- Phù hợp với trẻ 5-6 tuổi (dễ hiểu, tích cực)
- Không lặp lại nhận xét chung chung

Trả về JSON (không markdown):
{
  "overview": "Tổng quan buổi học hôm nay (2-3 câu, tự nhiên, sinh động)",
  "strengths": "Điểm mạnh nổi bật của học sinh (cụ thể, có tham chiếu số liệu)",
  "improvements": "Điểm cần cải thiện (nhẹ nhàng, xây dựng, không phê bình nặng nề)",
  "parentNote": "Khuyến nghị dành cho phụ huynh (thực tế, có thể làm ngay tại nhà)",
  "nextPlan": "Kế hoạch buổi tiếp theo (ngắn gọn, cụ thể)",
  "encouragement": "Câu động viên cá nhân cho học sinh (ấm áp, phù hợp lứa tuổi)"
}`

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
        temperature: 0.7, // higher temperature for natural variation
      })
      const raw = completion.choices[0].message.content || '{}'
      const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim())
      const fullComment = [
        `📋 **Tổng quan:** ${parsed.overview}`,
        `✨ **Điểm mạnh:** ${parsed.strengths}`,
        `💪 **Cần cải thiện:** ${parsed.improvements}`,
        `👨‍👩‍👧 **Gửi phụ huynh:** ${parsed.parentNote}`,
        `📅 **Buổi tiếp theo:** ${parsed.nextPlan}`,
        `🌟 **Động viên:** ${parsed.encouragement}`,
      ].join('\n\n')

      // Lưu vào DB
      await prisma.studentSessionRecord.update({
        where: { feedbackId_userId: { feedbackId, userId: record.userId } },
        data: { aiComment: fullComment, aiCommentAt: new Date() },
      })

      results[record.userId] = fullComment
    } catch (err) {
      console.error(`AI generate error for ${record.userId}:`, err)
      results[record.userId] = 'Lỗi sinh nhận xét'
    }
  }

  return NextResponse.json({ success: true, data: results })
}

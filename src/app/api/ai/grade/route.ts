import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { openai, AVAB_SYSTEM } from '@/lib/openai'

// AI chấm bài tự luận — khi đáp án không đơn giản là so khớp số
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 })
  }

  try {
    const body = await req.json()

    // Mode 1: Notebook free-text grading (studentText + subjectName + subjectId)
    if (body.studentText !== undefined) {
      const { subjectId: _subjectId, subjectName, studentText } = body

      if (!studentText?.trim()) {
        return NextResponse.json({ success: false, error: 'Thiếu bài làm' }, { status: 400 })
      }

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: AVAB_SYSTEM },
          {
            role: 'user',
            content: `Bạn là AI chấm bài toán tư duy cho học sinh tiểu học Việt Nam (luyện thi học bổng vào lớp 1).
Chuyên đề: ${subjectName || 'Toán Tư Duy'}
Bài làm của học sinh:
${studentText}

Hãy chấm và trả về JSON (không thêm markdown):
{
  "score": <điểm từ 0-10>,
  "feedback": "<nhận xét chi tiết về bài làm, điểm mạnh yếu>",
  "pathway": "<lộ trình học tập cá nhân hoá tiếp theo>",
  "prediction": "<dự đoán khả năng đỗ vào trường CLC và học bổng>"
}`,
          },
        ],
        max_tokens: 600,
        temperature: 0.4,
      })

      const raw = completion.choices[0].message.content || '{}'
      const result = JSON.parse(raw.replace(/```json|```/g, '').trim())
      return NextResponse.json({ success: true, data: result })
    }

    // Mode 2: Single-question grading (question + correctAnswer + studentAnswer)
    const { question, correctAnswer, studentAnswer, subjectName } = body

    if (!question || !correctAnswer || !studentAnswer) {
      return NextResponse.json({ success: false, error: 'Thiếu dữ liệu' }, { status: 400 })
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: AVAB_SYSTEM },
        {
          role: 'user',
          content: `Chuyên đề: ${subjectName || 'Toán Tư Duy'}

Câu hỏi: ${question}
Đáp án đúng: ${correctAnswer}
Học sinh trả lời: ${studentAnswer}

Hãy chấm bài theo định dạng JSON sau (không thêm markdown):
{
  "isCorrect": true/false,
  "score": 0 hoặc 1,
  "partialCredit": false,
  "feedback": "Nhận xét ngắn gọn, động viên (1-2 câu)",
  "hint": "Gợi ý nếu sai (1 câu, không tiết lộ đáp án)"
}`,
        },
      ],
      max_tokens: 200,
      temperature: 0.3,
    })

    const raw = completion.choices[0].message.content || '{}'
    const result = JSON.parse(raw.replace(/```json|```/g, '').trim())

    return NextResponse.json({ success: true, data: result })
  } catch (err) {
    console.error('AI grade error:', err)
    return NextResponse.json({ success: false, error: 'AI không khả dụng' }, { status: 500 })
  }
}

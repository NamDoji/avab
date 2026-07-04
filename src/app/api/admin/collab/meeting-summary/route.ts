import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { openai } from '@/lib/openai'

// POST /api/admin/collab/meeting-summary
// Body: { content: string }
// Returns: { success: true, data: { summary, actionItems } }
export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session || (session.user as { role?: string })?.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json() as { content?: string }
    const { content } = body

    if (!content?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Nội dung cuộc họp không được để trống' },
        { status: 400 },
      )
    }

    if (content.trim().length > 20000) {
      return NextResponse.json(
        { success: false, error: 'Nội dung quá dài (tối đa 20.000 ký tự)' },
        { status: 400 },
      )
    }

    const prompt = `Bạn là trợ lý AI của AvaB - hệ thống quản lý giáo dục.
Hãy tóm tắt cuộc họp và trích xuất các action items từ nội dung sau.

NỘI DUNG CUỘC HỌP:
${content.trim()}

Trả về JSON với format chính xác:
{
  "summary": "Tóm tắt ngắn gọn 2-4 câu về nội dung chính của cuộc họp",
  "actionItems": [
    {
      "action": "Mô tả việc cần làm cụ thể",
      "assignee": "Tên người thực hiện (nếu có, để trống nếu không rõ)",
      "deadline": "Deadline (nếu có, VD: '20/07/2026', 'Cuối tuần này', hoặc để trống)"
    }
  ]
}

Lưu ý:
- Tóm tắt bằng tiếng Việt, ngắn gọn, nêu bật điểm chính
- Action items phải cụ thể, có thể thực hiện được
- Nếu không có action items rõ ràng, trả về mảng rỗng
- CHỈ trả về JSON, không có text thừa`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 1200,
      response_format: { type: 'json_object' },
    })

    const raw = completion.choices[0]?.message?.content ?? '{}'

    let parsed: { summary?: string; actionItems?: unknown[] }
    try {
      parsed = JSON.parse(raw) as { summary?: string; actionItems?: unknown[] }
    } catch {
      return NextResponse.json(
        { success: false, error: 'AI trả về định dạng không hợp lệ, thử lại' },
        { status: 500 },
      )
    }

    const summary = typeof parsed.summary === 'string' ? parsed.summary : 'Không thể tóm tắt'
    const rawItems = Array.isArray(parsed.actionItems) ? parsed.actionItems : []
    const actionItems = rawItems.map((item) => {
      const i = item as Record<string, unknown>
      return {
        action: typeof i.action === 'string' ? i.action : '',
        assignee: typeof i.assignee === 'string' ? i.assignee : '',
        deadline: typeof i.deadline === 'string' ? i.deadline : '',
      }
    }).filter((i) => i.action.trim())

    return NextResponse.json({ success: true, data: { summary, actionItems } })
  } catch (error) {
    console.error('POST /api/admin/collab/meeting-summary error:', error)
    return NextResponse.json(
      { success: false, error: 'Lỗi xử lý AI, vui lòng thử lại' },
      { status: 500 },
    )
  }
}

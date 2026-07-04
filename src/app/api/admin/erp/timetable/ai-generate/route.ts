import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const DAYS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6']

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { classes, subjects, periodsPerDay = 10 } = body

  // classes: [{ name: string, grade: string }]
  // subjects: [{ name: string, teacher: string, periodsPerWeek: number }]

  const prompt = `
Bạn là AI chuyên xếp thời khóa biểu trường học.

Dữ liệu đầu vào:
- Lớp học: ${JSON.stringify(classes)}
- Môn học + giáo viên: ${JSON.stringify(subjects)}
- Số tiết/ngày: ${periodsPerDay}
- Các ngày học: Thứ 2 đến Thứ 6

Yêu cầu:
1. Mỗi môn có đúng số tiết/tuần như đã chỉ định
2. Một giáo viên không dạy 2 lớp cùng giờ
3. Phân bổ đều qua các ngày, không dồn quá nhiều tiết một ngày
4. Môn khó (Toán, Văn) ưu tiên tiết đầu ngày (tiết 1-4)

Trả về JSON theo format sau (KHÔNG kèm markdown, chỉ JSON thuần):
{
  "timetable": {
    "[tên lớp]": {
      "[Thứ 2]": { "[Tiết 1]": { "subject": "...", "teacher": "..." }, ... },
      "[Thứ 3]": { ... },
      ...
    },
    ...
  },
  "conflicts": [],
  "stats": {
    "totalPeriods": number,
    "conflicts": number,
    "efficiency": "95%"
  }
}

Nếu có xung đột không giải quyết được, liệt kê trong "conflicts" với mô tả ngắn.
`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 4000,
      temperature: 0.3,
      response_format: { type: 'json_object' },
    })

    const raw = completion.choices[0]?.message?.content ?? '{}'
    let parsed: Record<string, unknown>
    try {
      parsed = JSON.parse(raw)
    } catch {
      return NextResponse.json({ error: 'AI trả về dữ liệu không hợp lệ' }, { status: 500 })
    }

    // Attach metadata
    return NextResponse.json({
      ...parsed,
      meta: {
        model: 'gpt-4o-mini',
        days: DAYS,
        periodsPerDay,
        generatedAt: new Date().toISOString(),
      },
    })
  } catch (err) {
    console.error('[ai-timetable]', err)
    return NextResponse.json({ error: 'Lỗi kết nối AI' }, { status: 500 })
  }
}

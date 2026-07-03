import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { openai } from '@/lib/openai'

type RouteContext = { params: Promise<{ courseId: string }> }

// Supported actions the AI Chat can trigger
type ChatAction =
  | { type: 'generate'; contentType: 'lessons' | 'homework' | 'answers' | 'quiz' | 'teacher-guide' | 'video-script'; subjectId?: string }
  | { type: 'generate_all' }
  | { type: 'chat_only' }

const SYSTEM_PROMPT = `Bạn là trợ lý AI của AvaB — nền tảng giáo dục K12.
Bạn đang hỗ trợ Admin quản lý và tạo nội dung cho một khóa học cụ thể.

Nhiệm vụ của bạn:
1. Trả lời câu hỏi về khóa học
2. Phân tích yêu cầu và xác định action cần thực hiện
3. Xác nhận với người dùng trước khi thực hiện action

Các action bạn có thể đề xuất:
- generate:lessons — Tạo nội dung lý thuyết bài giảng
- generate:homework — Tạo bài tập về nhà (30 câu/chuyên đề)
- generate:answers — Tạo đáp án chi tiết
- generate:quiz — Tạo đề kiểm tra 45 phút
- generate:teacher-guide — Tạo hướng dẫn giảng dạy cho giáo viên
- generate:video-script — Tạo kịch bản video bài giảng
- generate:all — Chạy toàn bộ pipeline (lý thuyết → BTVN → đáp án → quiz → GV guide → video)

Khi người dùng yêu cầu generate nội dung, hãy:
1. Xác nhận bạn hiểu yêu cầu
2. Gọi function suggest_action với action phù hợp
3. Trả lời thân thiện bằng tiếng Việt

Ví dụ mapping:
- "viết lại lý thuyết" / "gen lesson" / "tạo bài giảng" → generate:lessons
- "tạo bài tập" / "sinh BTVN" / "30 câu" → generate:homework  
- "đáp án" / "lời giải" → generate:answers
- "đề kiểm tra" / "quiz" / "đề thi" → generate:quiz
- "hướng dẫn giáo viên" / "giáo án" / "teacher guide" → generate:teacher-guide
- "kịch bản video" / "video script" / "script" → generate:video-script
- "tạo tất cả" / "full pipeline" / "generate hết" → generate:all`

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const session = await auth()
    if (!session || (session.user as { role?: string })?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { courseId } = await context.params
    const body = await req.json() as { message: string; history?: { role: 'user' | 'assistant'; content: string }[] }

    const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...(body.history ?? []).slice(-6), // keep last 6 turns for context
      { role: 'user', content: body.message },
    ]

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      tools: [
        {
          type: 'function',
          function: {
            name: 'suggest_action',
            description: 'Đề xuất hoặc thực hiện action generate nội dung cho khóa học',
            parameters: {
              type: 'object',
              properties: {
                action: {
                  type: 'string',
                  enum: ['generate:lessons', 'generate:homework', 'generate:answers', 'generate:quiz', 'generate:teacher-guide', 'generate:video-script', 'generate:all'],
                  description: 'Action cần thực hiện',
                },
                confirm: {
                  type: 'boolean',
                  description: 'Người dùng đã xác nhận chưa',
                },
              },
              required: ['action'],
            },
          },
        },
      ],
      tool_choice: 'auto',
      temperature: 0.7,
      max_tokens: 500,
    })

    const choice = completion.choices[0]
    const text   = choice.message.content ?? ''
    const toolCall = choice.message.tool_calls?.[0]

    let action: ChatAction = { type: 'chat_only' }

    if (toolCall && 'function' in toolCall && toolCall.function.name === 'suggest_action') {
      try {
        const args = JSON.parse((toolCall as { function: { name: string; arguments: string } }).function.arguments) as { action: string; confirm?: boolean }
        const [, contentType] = args.action.split(':')

        if (args.action === 'generate:all') {
          action = { type: 'generate_all' }
        } else if (contentType) {
          action = {
            type: 'generate',
            contentType: contentType as 'lessons' | 'homework' | 'answers' | 'quiz' | 'teacher-guide' | 'video-script',
          }
        }
      } catch { /* ignore parse error */ }
    }

    return NextResponse.json({
      reply:  text || buildDefaultReply(action),
      action,
      courseId,
    })
  } catch (err) {
    console.error('[AI Chat] POST error:', err)
    return NextResponse.json({ error: 'Internal server error', details: String(err) }, { status: 500 })
  }
}

function buildDefaultReply(action: ChatAction): string {
  if (action.type === 'generate_all') return 'Bắt đầu chạy toàn bộ pipeline nhé!'
  if (action.type === 'generate') {
    const labels: Record<string, string> = {
      lessons: 'lý thuyết bài giảng',
      homework: 'bài tập về nhà (30 câu)',
      answers: 'đáp án chi tiết',
      quiz: 'đề kiểm tra',
      'teacher-guide': 'hướng dẫn giảng dạy',
      'video-script': 'kịch bản video',
    }
    return `Đang generate ${labels[action.contentType] ?? action.contentType} cho khóa học...`
  }
  return 'Tôi có thể giúp gì cho bạn?'
}

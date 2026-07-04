import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { openai } from '@/lib/openai'

// Context-aware system prompts per section
function buildSystemPrompt(pathname: string): string {
  const base = `Bạn là AI Assistant của AvaB — nền tảng AI Education Platform K12.
Bạn hỗ trợ Admin quản lý và vận hành hệ thống AvaB.
Trả lời ngắn gọn, chính xác, bằng tiếng Việt.`

  if (pathname.includes('/ai-studio/course-generator')) {
    return `${base}
    
Bạn đang trong Course Generator. Các lệnh nhanh:
- "Generate lý thuyết" → tạo nội dung bài giảng cho khóa học
- "Generate bài tập" → tạo 30 câu BTVN
- "Generate đáp án" → tạo đáp án chi tiết
- "Generate quiz" → tạo đề kiểm tra
- "Generate teacher guide" → tạo hướng dẫn giáo viên
- "Generate video script" → tạo kịch bản video
- "Full pipeline" → chạy tất cả
- "Xuất DOCX" → export khóa học ra Word`
  }

  if (pathname.includes('/ai-studio')) {
    return `${base}

Bạn đang trong AI Studio. Bạn có thể:
- Giải thích cách tạo project mới
- Hướng dẫn sử dụng Course Generator
- Giải đáp về AI Pipeline (lý thuyết → BTVN → đáp án → quiz → GV guide → video)
- Giới thiệu các tính năng của AI Studio`
  }

  if (pathname.includes('/roles') || pathname.includes('/permissions') || pathname.includes('/audit')) {
    return `${base}

Bạn đang trong hệ thống RBAC (phân quyền). Bạn có thể:
- Giải thích về các roles: Super Admin, Teacher, Student, Parent, v.v.
- Hướng dẫn tạo role mới và gán permissions
- Giải thích permission matrix
- Hướng dẫn gán user vào role
- Giải thích audit log`
  }

  if (pathname.includes('/courses')) {
    return `${base}

Bạn đang trong Quản lý Khóa học. Bạn có thể:
- Hướng dẫn tạo khóa học mới
- Giải thích cấu trúc Course → Subject → Material
- Hướng dẫn quản lý học viên trong khóa học`
  }

  if (pathname.includes('/analytics')) {
    return `${base}

Bạn đang trong Analytics. Bạn có thể:
- Giải thích các số liệu dashboard
- Đề xuất cải thiện dựa trên dữ liệu
- Hướng dẫn đọc báo cáo học tập`
  }

  if (pathname.includes('/finance')) {
    return `${base}

Bạn đang trong Tài chính. Bạn có thể:
- Hướng dẫn tạo đợt thu học phí
- Giải thích báo cáo doanh thu
- Hỗ trợ quản lý học phí theo khóa/buổi`
  }

  return `${base}

Bạn có thể giúp:
- Điều hướng đến các tính năng: Courses, AI Studio, Analytics, RBAC, Finance
- Giải thích cách sử dụng từng module
- Trả lời câu hỏi về hệ thống AvaB
- Đề xuất workflow phù hợp

Các module chính: Dashboard | AI Studio | Course Library | Question Bank | Analytics | RBAC | Finance | Teacher/Student/Parent Portal`
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || !['ADMIN','SUPER_ADMIN'].includes((session.user as { role?: string })?.role ?? '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json() as {
      message: string
      pathname: string
      history?: { role: 'user' | 'assistant'; content: string }[]
    }

    const systemPrompt = buildSystemPrompt(body.pathname ?? '')

    const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
      { role: 'system', content: systemPrompt },
      ...(body.history ?? []).slice(-8),
      { role: 'user', content: body.message },
    ]

    const completion = await openai.chat.completions.create({
      model:       'gpt-4o',
      messages,
      max_tokens:  600,
      temperature: 0.7,
    })

    const reply = completion.choices[0]?.message?.content ?? 'Xin lỗi, tôi không thể trả lời lúc này.'

    return NextResponse.json({ reply })
  } catch (err) {
    console.error('[Global AI Chat] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

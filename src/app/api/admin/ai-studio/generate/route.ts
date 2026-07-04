import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { openai } from '@/lib/openai'
import { checkModuleAccess } from '@/lib/module-gate'

// ─── Prompt builders ─────────────────────────────────────────────────────────

function buildCurriculumPrompt(p: {
  grade: string; subject: string; subjectName?: string | null
  topic: string; objective?: string | null; chapter?: string | null
  difficulty: string; curriculum: string
}): string {
  const subj = p.subjectName ?? p.subject
  const diff = { easy: 'dễ', medium: 'trung bình', hard: 'khó' }[p.difficulty] ?? 'trung bình'

  return `Bạn là chuyên gia giáo dục của AvaB — nền tảng học K12 chất lượng cao tại Việt Nam.

Tạo ĐỀ CƯƠNG CHI TIẾT cho bài học sau:
- Chương trình: ${p.curriculum}
- Lớp: ${p.grade}
- Môn: ${subj}
${p.chapter ? `- Chương: ${p.chapter}` : ''}
- Chủ đề: ${p.topic}
${p.objective ? `- Mục tiêu: ${p.objective}` : ''}
- Độ khó: ${diff}

Trả về đề cương dạng markdown với:

## 🎯 Mục tiêu học tập
(4–6 mục tiêu cụ thể, có thể đo lường bằng động từ Bloom)

## 📚 Kiến thức nền cần có
(3–5 điểm kiến thức cần biết trước)

## 🗂️ Cấu trúc bài học
1. **Giới thiệu / Khởi động** (X phút)
   - ...
2. **Kiến thức lý thuyết** (X phút)
   - Mục 1: ...
   - Mục 2: ...
3. **Ví dụ minh họa** (X phút)
4. **Thực hành** (X phút)
5. **Tổng kết** (X phút)

## 📝 Kế hoạch bài tập về nhà
- Số câu: 30 (10 dễ + 10 trung bình + 10 khó)
- Loại câu hỏi: ...

## ⚠️ Lưu ý giảng dạy
(2–3 lưu ý quan trọng cho giáo viên)

Viết bằng tiếng Việt, rõ ràng, chuyên nghiệp.`
}

function buildLessonPrompt(p: {
  grade: string; subject: string; subjectName?: string | null
  topic: string; objective?: string | null
  difficulty: string; curriculum: string
}, curriculumOutline?: string): string {
  const subj = p.subjectName ?? p.subject
  const diff = { easy: 'dễ', medium: 'trung bình', hard: 'khó' }[p.difficulty] ?? 'trung bình'

  return `Bạn là chuyên gia giáo dục của AvaB.

Tạo BÀI HỌC HOÀN CHỈNH theo chuẩn AvaB Lesson Standard.

Thông tin:
- Chương trình: ${p.curriculum}
- Lớp: ${p.grade}
- Môn: ${subj}
- Chủ đề: ${p.topic}
- Độ khó: ${diff}
${p.objective ? `- Mục tiêu: ${p.objective}` : ''}

${curriculumOutline ? `Đề cương đã được duyệt:\n${curriculumOutline}\n\n` : ''}

Cấu trúc bắt buộc:

# 📖 Bài học: ${p.topic}
**Lớp:** ${p.grade} | **Môn:** ${subj} | **Độ khó:** ${diff}

---

## 🎯 Mục tiêu bài học
(4–6 mục tiêu cụ thể)

## 📚 Kiến thức cần chuẩn bị trước

## 🌟 Khởi động
(Câu hỏi/trò chơi/tình huống thu hút sự chú ý — 3–5 phút)

## 📝 Nội dung chính
(Giải thích rõ ràng, dễ hiểu theo từng mục trong đề cương)

## 💡 Ví dụ minh họa
(5 ví dụ từ đơn giản → phức tạp, mỗi ví dụ có lời giải đầy đủ)

**Ví dụ 1** (Dễ): ...
**Ví dụ 2**: ...
**Ví dụ 3**: ...
**Ví dụ 4** (Khá): ...
**Ví dụ 5** (Khó): ...

## ✏️ Bài tập thực hành tại lớp
(5 câu — có đáp án)

## 📌 Tổng kết
(3–5 điểm quan trọng cần nhớ)

## 👨‍👩‍👧 Hướng dẫn phụ huynh hỗ trợ tại nhà

---
Viết bằng tiếng Việt. Ngôn ngữ thân thiện với học sinh. Dùng emoji phù hợp.`
}

function buildHomeworkPrompt(p: {
  grade: string; subject: string; subjectName?: string | null
  topic: string; difficulty: string
}, lessonContent?: string): string {
  const subj = p.subjectName ?? p.subject
  const n    = 30
  const easy = 10, med = 10, hard = 10

  return `Bạn là chuyên gia giáo dục của AvaB.

Tạo bộ ${n} CÂU BÀI TẬP VỀ NHÀ (BTVN) theo chuẩn AvaB.

Thông tin:
- Lớp: ${p.grade}
- Môn: ${subj}
- Chủ đề: ${p.topic}
- Phân bố: ${easy} câu DỄ + ${med} câu KHÁ + ${hard} câu KHÓ

${lessonContent ? `Nội dung bài học đã tạo (dùng làm context):\n${lessonContent.slice(0, 1500)}\n\n` : ''}

# 📋 BTVN: ${p.topic} — Lớp ${p.grade}
*Họ và tên: _____________________________ | Ngày: ___________ | Điểm: ______*

---

## 🟢 Phần I: Câu DỄ (${easy} câu — 1 điểm/câu)

Câu 1: [đề bài rõ ràng, dễ hiểu]
**Đáp án:** [đáp án ngắn]

(Tiếp tục Câu 2 → Câu ${easy}, mỗi câu có đề bài và đáp án)

---

## 🟡 Phần II: Câu KHÁ (${med} câu — 2 điểm/câu)

Câu ${easy + 1}: [đề bài]
**Đáp án:** [đáp án]
**Lời giải:** [giải ngắn các bước]

(Tiếp tục Câu ${easy + 2} → Câu ${easy + med})

---

## 🔴 Phần III: Câu KHÓ (${hard} câu — 3 điểm/câu)

Câu ${easy + med + 1}: [đề bài nâng cao]
**Đáp án:** [đáp án]
**Lời giải chi tiết:** [giải từng bước đầy đủ]

(Tiếp tục Câu ${easy + med + 2} → Câu ${n})

---
**Tổng điểm tối đa: ${easy * 1 + med * 2 + hard * 3} điểm**

Viết bằng tiếng Việt. Câu hỏi đa dạng, sáng tạo, phù hợp học sinh lớp ${p.grade}.`
}

function buildQAPrompt(p: {
  grade: string; subject: string; subjectName?: string | null; topic: string
}, lessonContent?: string, homeworkContent?: string): string {
  const subj = p.subjectName ?? p.subject

  return `Bạn là chuyên gia kiểm định chất lượng giáo dục AvaB.

Hãy thực hiện QA toàn diện cho bộ học liệu sau:
- Lớp: ${p.grade} | Môn: ${subj} | Chủ đề: ${p.topic}

${lessonContent ? `**BÀI HỌC:**\n${lessonContent.slice(0, 1500)}` : ''}
${homeworkContent ? `\n\n**BÀI TẬP VỀ NHÀ (30 câu):**\n${homeworkContent.slice(0, 1500)}` : ''}

---

Trả về báo cáo QA theo format sau:

# ✅ Báo cáo QA — ${p.topic}

## 📊 Điểm tổng thể
**QA Score: XX/100**

| Tiêu chí | Điểm | Nhận xét |
|---|---|---|
| Độ chính xác nội dung | X/20 | ... |
| Phù hợp lứa tuổi | X/20 | ... |
| Cấu trúc & Format | X/20 | ... |
| Đa dạng câu hỏi | X/20 | ... |
| Chuẩn chương trình | X/20 | ... |

## ✅ Điểm mạnh
(3–5 điểm tốt của tài liệu)

## ⚠️ Vấn đề cần chú ý
(Liệt kê các vấn đề nếu có, mỗi vấn đề ghi: mức độ [LOW/MEDIUM/HIGH] + mô tả + đề xuất sửa)

## 💡 Đề xuất cải thiện
(2–3 gợi ý tổng quát để nâng cao chất lượng)

## 🏁 Kết luận
**Trạng thái:** [✅ PASS / ⚠️ PASS WITH NOTES / ❌ NEEDS REVISION]

Đánh giá khách quan, chuyên nghiệp. Viết bằng tiếng Việt.`
}

// ─── POST handler ──────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {

  // ── Module gate: org phải có module 'ai' ─────────────────────────────
  const gate = await checkModuleAccess(req, 'ai')
  if ('error' in gate) return NextResponse.json({ error: gate.error }, { status: gate.status })

  try {
    const session = await auth()
    if (!session || !['ADMIN','SUPER_ADMIN'].includes((session.user as { role?: string })?.role ?? '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as { id?: string })?.id
    if (!userId) return NextResponse.json({ error: 'No user id' }, { status: 401 })

    const body = await req.json()
    const { type, projectId, context } = body as {
      type: 'curriculum' | 'lesson' | 'homework' | 'qa'
      projectId: string
      context?: string
    }

    if (!type || !projectId) {
      return NextResponse.json({ error: 'Missing type or projectId' }, { status: 400 })
    }

    // Get project
    const project = await prisma.aIProject.findFirst({
      where: { id: projectId, createdBy: userId },
      include: { steps: { orderBy: { stepNum: 'asc' } } },
    })
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

    // Build prompt based on type
    let prompt: string
    let stepNum: number
    let stepType: string

    const stepByDoneType = (t: string) =>
      project.steps.find(s => s.stepType === t && s.status === 'done')

    switch (type) {
      case 'curriculum':
        prompt = buildCurriculumPrompt(project as Parameters<typeof buildCurriculumPrompt>[0])
        stepNum  = 2
        stepType = 'curriculum'
        break
      case 'lesson': {
        const currStep = stepByDoneType('curriculum')
        prompt = buildLessonPrompt(
          project as Parameters<typeof buildLessonPrompt>[0],
          context ?? currStep?.content ?? undefined
        )
        stepNum  = 3
        stepType = 'lesson'
        break
      }
      case 'homework': {
        const lessonStep = stepByDoneType('lesson')
        prompt = buildHomeworkPrompt(
          project as Parameters<typeof buildHomeworkPrompt>[0],
          context ?? lessonStep?.content ?? undefined
        )
        stepNum  = 4
        stepType = 'homework'
        break
      }
      case 'qa': {
        const lessonStep   = stepByDoneType('lesson')
        const homeworkStep = stepByDoneType('homework')
        prompt = buildQAPrompt(
          project as Parameters<typeof buildQAPrompt>[0],
          lessonStep?.content ?? undefined,
          homeworkStep?.content ?? undefined
        )
        stepNum  = 5
        stepType = 'qa'
        break
      }
      default:
        return NextResponse.json({ error: `Invalid type: ${type}` }, { status: 400 })
    }

    // Upsert step as running
    const existingStep = project.steps.find(s => s.stepType === stepType)
    const step = existingStep
      ? await prisma.aIProjectStep.update({
          where: { id: existingStep.id },
          data: { status: 'running', startedAt: new Date(), error: null, content: null, doneAt: null },
        })
      : await prisma.aIProjectStep.create({
          data: { projectId, stepNum, stepType, status: 'running', startedAt: new Date() },
        })

    // Update project status to in-progress
    await prisma.aIProject.update({
      where: { id: projectId },
      data: { status: 'in-progress' },
    })

    // Call OpenAI
    let content = ''
    try {
      const completion = await openai.chat.completions.create({
        model:       'gpt-4o-mini',
        max_tokens:  4096,
        temperature: 0.72,
        messages: [
          {
            role:    'system',
            content: 'Bạn là chuyên gia giáo dục của AvaB — nền tảng K12 chất lượng cao tại Việt Nam. Tạo nội dung hoàn chỉnh, đúng chuẩn, chi tiết. Trả lời bằng tiếng Việt, dùng markdown để format. Không bao giờ bỏ qua phần nào trong cấu trúc yêu cầu.',
          },
          { role: 'user', content: prompt },
        ],
      })
      content = completion.choices[0]?.message?.content ?? ''
    } catch (aiErr) {
      await prisma.aIProjectStep.update({
        where: { id: step.id },
        data: { status: 'error', error: String(aiErr) },
      })
      return NextResponse.json({ error: 'AI generation failed', details: String(aiErr) }, { status: 500 })
    }

    // Save result
    const updated = await prisma.aIProjectStep.update({
      where: { id: step.id },
      data: {
        status:  'done',
        content,
        doneAt:  new Date(),
        metadata: { wordCount: content.split(/\s+/).filter(Boolean).length, model: 'gpt-4o-mini' },
      },
    })

    return NextResponse.json({ success: true, content, stepId: updated.id, stepType, stepNum })
  } catch (err) {
    console.error('[AI Studio] Generate error:', err)
    return NextResponse.json({ error: 'Internal server error', details: String(err) }, { status: 500 })
  }
}

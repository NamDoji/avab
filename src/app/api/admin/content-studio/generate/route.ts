import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { openai } from '@/lib/openai'

// ─── Prompt builder ─────────────────────────────────────────────────────────

function buildPrompt(type: string, params: Record<string, string>): string {
  const { grade = '2', subject = 'Toán', topic = '', difficulty = 'MEDIUM', targetAge = '7', numItems = '30' } = params

  const diffLabel: Record<string, string> = { EASY: 'dễ', MEDIUM: 'trung bình', HARD: 'khó' }
  const diff = diffLabel[difficulty] ?? 'trung bình'
  const n    = Math.max(5, parseInt(numItems) || 30)
  const easy = Math.floor(n / 3)
  const med  = Math.floor(n / 3)
  const hard = n - easy - med

  switch (type) {
    // ── LESSON ─────────────────────────────────────────────────────────────
    case 'lesson':
      return `Bạn là chuyên gia giáo dục của AvaB — nền tảng giáo dục K12 thông minh tại Việt Nam, hỗ trợ đầy đủ từ Mầm non đến Lớp 12 và các chương trình quốc tế (Cambridge, IB, IELTS...).

Hãy tạo một BÀI HỌC HOÀN CHỈNH theo chuẩn AvaB Lesson Standard.

Thông tin bài học:
- Lớp: ${grade}
- Môn: ${subject}
- Chủ đề: ${topic}
- Độ khó: ${diff}
- Độ tuổi mục tiêu: ${targetAge} tuổi

Cấu trúc bắt buộc:

# 📖 Bài học: ${topic}
**Lớp:** ${grade} | **Môn:** ${subject} | **Độ khó:** ${diff}

---

## 🎯 Mục tiêu bài học
(3–5 mục tiêu cụ thể, có thể đo lường)

## 📚 Kiến thức cần chuẩn bị trước
(Liệt kê prerequisites ngắn gọn)

## 📝 Nội dung chính
(Giải thích rõ ràng, dễ hiểu, phù hợp học sinh ${targetAge} tuổi)

## 💡 Ví dụ minh họa
(5 ví dụ từ đơn giản → phức tạp, mỗi ví dụ có lời giải đầy đủ)

**Ví dụ 1** (Dễ): ...
**Ví dụ 2**: ...
**Ví dụ 3**: ...
**Ví dụ 4** (Khá): ...
**Ví dụ 5** (Khó): ...

## ✏️ Bài tập thực hành tại lớp
(5 câu bài tập có đáp án)

Câu 1: ...
Đáp án: ...

## 📌 Tổng kết
(Key takeaways, 3–5 điểm quan trọng cần nhớ)

## 👨‍👩‍👧 Hướng dẫn cho phụ huynh
(Cách hỗ trợ con học bài này tại nhà, kỹ thuật ôn tập)

---
Viết bằng tiếng Việt. Ngôn ngữ thân thiện với trẻ em. Dùng emoji phù hợp để tăng hứng thú.`

    // ── HOMEWORK ────────────────────────────────────────────────────────────
    case 'homework':
      return `Bạn là chuyên gia giáo dục của AvaB.

Hãy tạo bộ ${n} CÂU BÀI TẬP VỀ NHÀ (BTVN) theo chuẩn AvaB.

Thông tin:
- Lớp: ${grade}
- Môn: ${subject}
- Chủ đề: ${topic}
- Phân bố độ khó: ${easy} câu DỄ + ${med} câu KHÁ + ${hard} câu KHÓ

---

# 📋 BTVN: ${topic} — Lớp ${grade}
*Họ và tên: _____________________________ | Ngày: ___________ | Điểm: ______*

---

## 🟢 Phần I: Câu DỄ (${easy} câu — 1 điểm/câu)

Câu 1: [đề bài rõ ràng]
**Đáp án:** [đáp án ngắn gọn]

Câu 2: ...

(Tiếp tục đến Câu ${easy})

---

## 🟡 Phần II: Câu KHÁ (${med} câu — 2 điểm/câu)

Câu ${easy + 1}: [đề bài]
**Đáp án:** [đáp án]
**Lời giải:** [giải ngắn gọn các bước]

(Tiếp tục đến Câu ${easy + med})

---

## 🔴 Phần III: Câu KHÓ (${hard} câu — 3 điểm/câu)

Câu ${easy + med + 1}: [đề bài nâng cao]
**Đáp án:** [đáp án]
**Lời giải chi tiết:** [giải từng bước đầy đủ]

(Tiếp tục đến Câu ${n})

---
**Tổng điểm: ${easy * 1 + med * 2 + hard * 3} điểm**

Viết bằng tiếng Việt. Các câu hỏi phù hợp học sinh lớp ${grade}, môn ${subject}, chủ đề ${topic}.`

    // ── THEORY ─────────────────────────────────────────────────────────────
    case 'theory':
      return `Bạn là chuyên gia giáo dục của AvaB.

Hãy tạo TÀI LIỆU LÝ THUYẾT hoàn chỉnh cho chuyên đề học.

Thông tin:
- Lớp: ${grade}
- Môn: ${subject}
- Chủ đề: ${topic}
- Độ khó: ${diff}

---

# 📝 Lý thuyết: ${topic}
**Lớp:** ${grade} | **Môn:** ${subject}

---

## 🌟 Giới thiệu chuyên đề
(Tại sao chủ đề này quan trọng? Ứng dụng thực tế trong cuộc sống)

## 🔑 Khái niệm cốt lõi
(Định nghĩa chính xác, rõ ràng, dễ hiểu cho học sinh ${targetAge} tuổi)

## 📐 Quy tắc & Công thức
(Trình bày đầy đủ mọi quy tắc, có ký hiệu rõ ràng, giải thích ý nghĩa)

## 💡 Ví dụ điển hình

**Ví dụ 1** (Cơ bản nhất): ...
**Ví dụ 2**: ...
**Ví dụ 3**: ...
**Ví dụ 4** (Nâng cao): ...
**Ví dụ 5** (Ứng dụng thực tế): ...

## ⚠️ Lưu ý & Sai lầm thường gặp
(Common mistakes và cách tránh — ít nhất 3 lỗi phổ biến)

## 🧠 Mẹo ghi nhớ
(Memory tricks, mnemonic, tips học nhanh)

## ✅ Bài tập tự kiểm tra
(5 câu test hiểu bài — có đáp án ở cuối)

Câu 1: ...
Câu 2: ...
...

**Đáp án:**
1. ... | 2. ... | 3. ... | 4. ... | 5. ...

---
Viết bằng tiếng Việt. Dùng markdown rõ ràng. Phù hợp học sinh lớp ${grade}.`

    // ── QUIZ ────────────────────────────────────────────────────────────────
    case 'quiz':
      return `Bạn là chuyên gia giáo dục của AvaB.

Hãy tạo ĐỀ KIỂM TRA hoàn chỉnh theo chuẩn AvaB.

Thông tin:
- Lớp: ${grade}
- Môn: ${subject}
- Chủ đề: ${topic}
- Số câu: ${n}
- Độ khó: ${diff}
- Phân bố: ~40% dễ + ~40% trung bình + ~20% khó

---

# 🎯 ĐỀ KIỂM TRA: ${topic}
**Lớp:** ${grade} | **Môn:** ${subject} | **Thời gian:** ${Math.max(15, Math.ceil(n * 2))} phút | **Tổng điểm:** 10

---
*Họ và tên: _____________________________ | Ngày: ___________ | Điểm: ______*

*Lưu ý: Đọc kỹ đề trước khi làm. Trình bày rõ ràng.*

---

## PHẦN BÀI LÀM

(Tạo đủ ${n} câu hỏi, mỗi câu ghi điểm rõ ràng, phân bố theo độ khó yêu cầu)

Câu 1 (__ điểm): [đề bài]

Câu 2 (__ điểm): [đề bài]

...

Câu ${n} (__ điểm): [đề bài]

---

## ĐÁP ÁN & THANG ĐIỂM

Câu 1: [đáp án + giải thích ngắn nếu cần]
Câu 2: [đáp án]
...

*Mỗi câu đúng được điểm tương ứng. Tổng = 10 điểm.*

---
Viết bằng tiếng Việt. Nội dung phù hợp học sinh lớp ${grade}, môn ${subject}.`

    // ── COURSE ─────────────────────────────────────────────────────────────
    case 'course':
      return `Bạn là chuyên gia giáo dục của AvaB.

Hãy tạo KHUNG KHOÁ HỌC (Course Outline) hoàn chỉnh.

Thông tin:
- Lớp: ${grade}
- Môn: ${subject}
- Chủ đề tổng quát: ${topic}
- Độ khó: ${diff}
- Đối tượng: ${targetAge} tuổi

---

# 📚 KHOÁ HỌC: ${topic}
**Lớp:** ${grade} | **Môn:** ${subject} | **Đối tượng:** ${targetAge} tuổi

---

## 📋 Thông tin khoá học
- Tổng thời lượng: [X buổi × Y phút/buổi]
- Hình thức: [Trực tiếp / Online / Hybrid]
- Cấp độ đầu vào: [mô tả yêu cầu]

## 🎯 Mục tiêu khoá học
(6–8 mục tiêu học tập cụ thể, có thể đo lường)

1. ...
2. ...
...

## 📖 Chương trình học chi tiết

### Unit 1: [Tên chuyên đề]
*Số buổi: X | Mục tiêu: ...*
- Bài 1.1: [Tên bài — mô tả ngắn]
- Bài 1.2: [Tên bài — mô tả ngắn]
- Bài 1.3: [Tên bài — mô tả ngắn]
- 🧪 Bài kiểm tra Unit 1

### Unit 2: [Tên chuyên đề]
...

(Ít nhất 5 units, mỗi unit có 3–5 bài + bài kiểm tra)

## 📊 Phương pháp đánh giá
- Bài tập về nhà: X%
- Kiểm tra giữa kỳ: X%
- Kiểm tra cuối khoá: X%
- Tham gia lớp học: X%

## 📚 Tài liệu & Điều kiện
(Yêu cầu đầu vào, tài liệu cần thiết, công cụ hỗ trợ)

## 🗓️ Lịch học đề xuất
(Timeline từng tuần)

---
Viết bằng tiếng Việt. Cấu trúc chuyên nghiệp, phù hợp tiêu chuẩn AvaB.`

    // ── EXERCISE ────────────────────────────────────────────────────────────
    case 'exercise':
      return `Bạn là chuyên gia giáo dục của AvaB.

Hãy tạo ${n} CÂU BÀI TẬP LUYỆN TẬP theo chuẩn AvaB.

Thông tin:
- Lớp: ${grade}
- Môn: ${subject}
- Chủ đề: ${topic}
- Độ khó: ${diff}

---

# ❓ Bài Tập Luyện: ${topic} — Lớp ${grade}
**Môn:** ${subject} | **Số câu:** ${n} | **Độ khó:** ${diff}

---

(Tạo đủ ${n} câu bài tập có đáp án và lời giải)

**Câu 1:** [đề bài rõ ràng]
**Đáp án:** [đáp án]
**Lời giải:** [giải từng bước nếu cần]

**Câu 2:** [đề bài]
**Đáp án:** [đáp án]
**Lời giải:** ...

(Tiếp tục đến Câu ${n})

---
Viết bằng tiếng Việt. Các câu hỏi đa dạng, phù hợp học sinh lớp ${grade}.`

    default:
      return `Hãy tạo nội dung giáo dục chất lượng cao về chủ đề "${topic}" cho học sinh lớp ${grade} môn ${subject}. Viết bằng tiếng Việt, đầy đủ và chi tiết.`
  }
}

// ─── POST handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || !['ADMIN','SUPER_ADMIN'].includes((session.user as { role?: string })?.role ?? '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { type, params } = body as { type: string; params: Record<string, string> }

    if (!type || !params) {
      return NextResponse.json({ error: 'Missing type or params' }, { status: 400 })
    }

    const validTypes = ['lesson', 'homework', 'theory', 'quiz', 'course', 'exercise']
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: `Invalid type: ${type}` }, { status: 400 })
    }

    if (!params.topic?.trim()) {
      return NextResponse.json({ error: 'Thiếu chủ đề (topic)' }, { status: 400 })
    }

    const prompt = buildPrompt(type, params)

    const completion = await openai.chat.completions.create({
      model:       'gpt-4o-mini',
      max_tokens:  4096,
      temperature: 0.72,
      messages: [
        {
          role:    'system',
          content: 'Bạn là chuyên gia giáo dục của AvaB — nền tảng giáo dục K12 thông minh tại Việt Nam, hỗ trợ đầy đủ từ Mầm non đến Lớp 12 và các chương trình quốc tế (Cambridge, IB, IELTS...). Luôn tạo nội dung hoàn chỉnh, chất lượng cao, phù hợp môn học và độ tuổi trong yêu cầu. Trả lời bằng tiếng Việt, dùng markdown để format rõ ràng, không bao giờ bỏ qua phần nào trong cấu trúc yêu cầu.',
        },
        {
          role:    'user',
          content: prompt,
        },
      ],
    })

    const content   = completion.choices[0]?.message?.content ?? ''
    const wordCount = content.split(/\s+/).filter(Boolean).length

    return NextResponse.json({
      success: true,
      content,
      metadata: {
        type,
        wordCount,
        items:       parseInt(params.numItems || '0') || undefined,
        generatedAt: new Date().toISOString(),
        model:       'gpt-4o-mini',
        grade:       params.grade,
        subject:     params.subject,
        topic:       params.topic,
        difficulty:  params.difficulty,
      },
    })
  } catch (err) {
    console.error('[Content Studio] Generate error:', err)
    return NextResponse.json(
      { error: 'Internal server error', details: String(err) },
      { status: 500 }
    )
  }
}

// ─── GET — health check / status ─────────────────────────────────────────────

export async function GET() {
  return NextResponse.json({
    module:      'content-studio/generate',
    status:      'ready',
    validTypes:  ['lesson', 'homework', 'theory', 'quiz', 'course', 'exercise'],
    model:       'gpt-4o-mini',
    description: 'Sinh học liệu theo chuẩn AvaB — A đến Z',
  })
}

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { openai } from '@/lib/openai'
import * as cheerio from 'cheerio'

async function requireAdmin() {
  const session = await auth()
  return session && (session.user as any)?.role === 'ADMIN' ? session : null
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface ParsedQuestion {
  content: string
  questionType: 'MULTIPLE_CHOICE' | 'OPEN' | 'FILL_IN'
  options: Array<{ key: string; text: string }> | null
  correctAnswer: string
  explanation: string | null
  order: number
}

interface ParseResult {
  platform: 'google_forms' | 'quizizz' | 'kahoot' | 'generic'
  title: string
  total: number
  questions: ParsedQuestion[]
}

// ─── Platform Detection ───────────────────────────────────────────────────────

function detectPlatform(url: string): 'google_forms' | 'quizizz' | 'kahoot' | 'generic' {
  if (url.includes('docs.google.com/forms')) return 'google_forms'
  if (url.includes('quizizz.com')) return 'quizizz'
  if (url.includes('kahoot.it') || url.includes('create.kahoot.it')) return 'kahoot'
  return 'generic'
}

// ─── Google Forms Parser ──────────────────────────────────────────────────────

async function parseGoogleForms(url: string): Promise<ParseResult> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 10000)

  let html: string
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AvaB-Importer/1.0)',
      },
    })
    html = await res.text()
  } finally {
    clearTimeout(timer)
  }

  // Extract FB_PUBLIC_LOAD_DATA_ from script tags
  const match = html.match(/FB_PUBLIC_LOAD_DATA_\s*=\s*(\[[\s\S]*?\]);\s*<\/script>/)
  if (!match) {
    throw new Error('Form không public hoặc đã đóng. Vui lòng kiểm tra quyền chia sẻ của form.')
  }

  let formData: any
  try {
    formData = JSON.parse(match[1])
  } catch {
    throw new Error('Không thể đọc dữ liệu form. Form có thể đã thay đổi cấu trúc.')
  }

  // formData[1][1] = array of question blocks
  // formData[3] = form title
  const formTitle: string = formData[3] ?? 'Google Form'
  const rawItems: any[] = formData?.[1]?.[1] ?? []

  const questions: ParsedQuestion[] = []

  for (let i = 0; i < rawItems.length; i++) {
    const item = rawItems[i]
    if (!Array.isArray(item)) continue

    const questionTitle: string = item[1] ?? ''
    const questionType: number = item[3] ?? 0
    // 0=short text, 1=paragraph, 2=multiple choice, 3=checkbox, 4=dropdown, 5=scale, 7=grid

    if (!questionTitle.trim()) continue

    let parsedType: ParsedQuestion['questionType'] = 'OPEN'
    let options: Array<{ key: string; text: string }> | null = null
    let correctAnswer = ''

    if (questionType === 2 || questionType === 3 || questionType === 4) {
      // Multiple choice / checkbox / dropdown
      parsedType = 'MULTIPLE_CHOICE'
      const rawOptions: any[] = item?.[4]?.[0]?.[1] ?? []
      const keys = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
      options = rawOptions
        .filter((opt: any) => Array.isArray(opt) && opt[0])
        .map((opt: any, idx: number) => ({
          key: keys[idx] ?? String(idx + 1),
          text: String(opt[0]),
        }))
      correctAnswer = options[0]?.key ?? ''
    } else if (questionType === 0) {
      parsedType = 'FILL_IN'
    } else {
      parsedType = 'OPEN'
    }

    questions.push({
      content: questionTitle,
      questionType: parsedType,
      options,
      correctAnswer,
      explanation: null,
      order: i + 1,
    })
  }

  if (questions.length === 0) {
    throw new Error('Không tìm thấy câu hỏi nào trong form. Form có thể trống hoặc không đúng định dạng.')
  }

  return {
    platform: 'google_forms',
    title: formTitle,
    total: questions.length,
    questions,
  }
}

// ─── Quizizz Parser ───────────────────────────────────────────────────────────

async function parseQuizizz(url: string): Promise<ParseResult> {
  // Extract quiz ID from various Quizizz URL formats
  // https://quizizz.com/admin/quiz/{ID}
  // https://quizizz.com/join?gc={PIN}
  // https://quizizz.com/admin/presentation/{ID}/...
  const idMatch = url.match(/\/quiz\/([a-f0-9]{24})/i) ??
    url.match(/\/presentation\/([a-f0-9]{24})/i) ??
    url.match(/quizizz\.com\/admin\/([a-f0-9]{24})/i)

  if (!idMatch) {
    throw new Error('Không thể xác định Quiz ID từ URL Quizizz. Vui lòng dùng link dạng /admin/quiz/{ID}')
  }

  const quizId = idMatch[1]
  const apiUrl = `https://quizizz.com/api/main/quiz/${quizId}?sanitize=false`

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 10000)

  let data: any
  try {
    const res = await fetch(apiUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AvaB-Importer/1.0)',
        'Accept': 'application/json',
      },
    })
    if (!res.ok) throw new Error(`Quizizz API trả về lỗi: ${res.status}`)
    data = await res.json()
  } finally {
    clearTimeout(timer)
  }

  const quizInfo = data?.data?.quiz?.info
  if (!quizInfo) throw new Error('Không thể đọc dữ liệu quiz từ Quizizz. Quiz có thể đã bị xóa hoặc private.')

  const rawQuestions: any[] = quizInfo.questions ?? []
  const title: string = quizInfo.name ?? 'Quizizz Quiz'

  const questions: ParsedQuestion[] = rawQuestions
    .filter((q: any) => q?.type && q?.structure)
    .map((q: any, idx: number) => {
      const text: string = q.structure?.query?.text ?? ''
      const rawOptions: any[] = q.structure?.options ?? []
      const keys = ['A', 'B', 'C', 'D', 'E', 'F']

      let parsedType: ParsedQuestion['questionType'] = 'OPEN'
      let options: Array<{ key: string; text: string }> | null = null
      let correctAnswer = ''

      if (q.type === 'MCQ' || q.type === 'MSQ') {
        parsedType = 'MULTIPLE_CHOICE'
        options = rawOptions
          .filter((opt: any) => opt?.text != null)
          .map((opt: any, i: number) => ({
            key: keys[i] ?? String(i + 1),
            text: String(opt.text),
          }))
        // Find correct answer
        const correctIdx = rawOptions.findIndex((opt: any) => opt?.isCorrect === true)
        correctAnswer = correctIdx >= 0 ? (keys[correctIdx] ?? String(correctIdx + 1)) : (keys[0] ?? 'A')
      } else if (q.type === 'BLANK') {
        parsedType = 'FILL_IN'
        correctAnswer = q.structure?.answer ?? ''
      } else {
        parsedType = 'OPEN'
      }

      return {
        content: text,
        questionType: parsedType,
        options,
        correctAnswer,
        explanation: q.structure?.explain ?? null,
        order: idx + 1,
      }
    })
    .filter((q: ParsedQuestion) => q.content.trim())

  if (questions.length === 0) {
    throw new Error('Không tìm thấy câu hỏi nào trong quiz Quizizz.')
  }

  return {
    platform: 'quizizz',
    title,
    total: questions.length,
    questions,
  }
}

// ─── Kahoot Parser ────────────────────────────────────────────────────────────

async function parseKahoot(url: string): Promise<ParseResult> {
  // Support two formats:
  // https://create.kahoot.it/share/{UUID}
  // https://kahoot.it/challenge/{PIN}  ← need UUID from challenge API

  let kahootId: string | null = null

  const uuidMatch = url.match(/share\/([0-9a-f-]{36})/i)
  if (uuidMatch) {
    kahootId = uuidMatch[1]
  }

  if (!kahootId) {
    throw new Error('Không thể xác định Kahoot ID. Vui lòng dùng link dạng create.kahoot.it/share/{UUID}')
  }

  const apiUrl = `https://create.kahoot.it/rest/kahoots/${kahootId}`

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 10000)

  let data: any
  try {
    const res = await fetch(apiUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AvaB-Importer/1.0)',
        'Accept': 'application/json',
      },
    })
    if (!res.ok) throw new Error(`Kahoot API trả về lỗi: ${res.status}. Quiz có thể đã private hoặc không tồn tại.`)
    data = await res.json()
  } finally {
    clearTimeout(timer)
  }

  const title: string = data?.title ?? 'Kahoot Quiz'
  const rawQuestions: any[] = data?.questions ?? []

  const questions: ParsedQuestion[] = rawQuestions
    .filter((q: any) => q?.question)
    .map((q: any, idx: number) => {
      const rawAnswers: any[] = q.answers ?? []
      const keys = ['A', 'B', 'C', 'D']

      let parsedType: ParsedQuestion['questionType'] = 'OPEN'
      let options: Array<{ key: string; text: string }> | null = null
      let correctAnswer = ''

      if (rawAnswers.length > 0) {
        parsedType = 'MULTIPLE_CHOICE'
        options = rawAnswers
          .filter((a: any) => a?.answer != null)
          .map((a: any, i: number) => ({
            key: keys[i] ?? String(i + 1),
            text: String(a.answer),
          }))
        const correctIdx = rawAnswers.findIndex((a: any) => a?.correct === true)
        correctAnswer = correctIdx >= 0 ? (keys[correctIdx] ?? String(correctIdx + 1)) : (keys[0] ?? 'A')
      }

      return {
        content: String(q.question),
        questionType: parsedType,
        options,
        correctAnswer,
        explanation: null,
        order: idx + 1,
      }
    })
    .filter((q: ParsedQuestion) => q.content.trim())

  if (questions.length === 0) {
    throw new Error('Không tìm thấy câu hỏi nào trong Kahoot này.')
  }

  return {
    platform: 'kahoot',
    title,
    total: questions.length,
    questions,
  }
}

// ─── Generic Web Scraper (AI fallback) ───────────────────────────────────────

async function parseGeneric(url: string): Promise<ParseResult> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 10000)

  let html: string
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AvaB-Importer/1.0)' },
    })
    if (!res.ok) throw new Error(`Không thể tải trang: ${res.status}`)
    html = await res.text()
  } finally {
    clearTimeout(timer)
  }

  // Extract readable text using cheerio
  const $ = cheerio.load(html)
  $('script, style, nav, footer, header, aside, [class*="ad"], [id*="ad"]').remove()
  const pageTitle = $('title').text().trim() || $('h1').first().text().trim() || 'Nội dung web'
  const textContent = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 12000)

  if (!textContent) {
    throw new Error('Không thể đọc nội dung từ trang web. Trang có thể yêu cầu đăng nhập hoặc chặn bot.')
  }

  // Use AI to extract questions
  const aiResponse = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: 'Bạn là AI chuyên trích xuất câu hỏi từ nội dung web giáo dục. Chỉ trả về JSON array hợp lệ, không có markdown.',
      },
      {
        role: 'user',
        content: `Trích xuất toàn bộ câu hỏi từ nội dung web sau:

URL: ${url}
Nội dung: ${textContent}

Trả về JSON array:
[
  {
    "content": "nội dung câu hỏi",
    "questionType": "MULTIPLE_CHOICE|OPEN|FILL_IN",
    "options": [{"key":"A","text":"..."},...] hoặc null,
    "correctAnswer": "đáp án đúng hoặc key đúng",
    "explanation": "lời giải hoặc null",
    "order": số thứ tự
  }
]

Nếu không có câu hỏi, trả về [].`,
      },
    ],
    temperature: 0.1,
    max_tokens: 4000,
  })

  const rawJson = aiResponse.choices[0].message.content ?? '[]'
  let questions: ParsedQuestion[] = []
  try {
    const cleaned = rawJson.replace(/```json\n?|\n?```/g, '').trim()
    questions = JSON.parse(cleaned)
    if (!Array.isArray(questions)) questions = []
  } catch {
    questions = []
  }

  return {
    platform: 'generic',
    title: pageTitle,
    total: questions.length,
    questions,
  }
}

// ─── Main Handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json() as { url: string; subjectId?: string; courseId?: string }
    const { url } = body

    if (!url?.trim()) {
      return NextResponse.json({ success: false, error: 'URL không được để trống' }, { status: 400 })
    }

    // Validate URL format
    let parsedUrl: URL
    try {
      parsedUrl = new URL(url)
    } catch {
      return NextResponse.json({ success: false, error: 'URL không hợp lệ. Vui lòng kiểm tra lại.' }, { status: 400 })
    }

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return NextResponse.json({ success: false, error: 'Chỉ hỗ trợ HTTP/HTTPS URL.' }, { status: 400 })
    }

    const platform = detectPlatform(url)

    let result: ParseResult
    switch (platform) {
      case 'google_forms':
        result = await parseGoogleForms(url)
        break
      case 'quizizz':
        result = await parseQuizizz(url)
        break
      case 'kahoot':
        result = await parseKahoot(url)
        break
      default:
        result = await parseGeneric(url)
    }

    return NextResponse.json({ success: true, ...result })
  } catch (err: unknown) {
    console.error('[material-import/url-import]', err)
    const message = err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

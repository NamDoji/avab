import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// ─────────────────────────────────────────────────────────────────────────────
// smartMatch — so sánh đáp án thông minh
//
// Hỗ trợ:
//   • Đáp án 1 biến:  "5" = "5 cái kẹo" = "5.0"
//   • Đáp án nhiều biến: "x = 4; y = 7"
//       ✓ full form:  "x = 4; y = 7"
//       ✓ short form: "4; 7"  hoặc  "4 7"  hoặc  "4,7"
//       ✓ đảo thứ tự: "y = 7; x = 4"
//       ✓ ký hiệu Unicode: "■ = 7; ● = 6" → "7;6" ✓
// ─────────────────────────────────────────────────────────────────────────────
export function smartMatch(student: string, correct: string): boolean {
  if (!student.trim()) return false

  // Normalize: lowercase, bỏ khoảng trắng thừa
  const norm = (s: string) =>
    s.trim().toLowerCase().replace(/\s+/g, ' ')

  const a = norm(student)
  const b = norm(correct)

  // ── 1. So sánh sau khi strip dấu câu ────────────────────────────────────
  const strip = (s: string) => s.replace(/[\s.,;:!?()\[\]{}]/g, '')
  if (strip(a) === strip(b)) return true

  // ── 2. Trích xuất key-value pairs "key = value" ──────────────────────────
  //    Hỗ trợ: "x = 4", "■ = 7", "x=4", v.v.
  const extractKV = (s: string): Map<string, string> | null => {
    // Chuẩn hoá: thay "và" (tiếng Việt) → ";"
    const normalized = s.replace(/\bvà\b/gi, ';')
    // Pattern: <key> = <value> ngăn cách bởi ; hoặc ,
    // Key không được chứa dấu =, ;, , để tránh parse sai
    const pairs = normalized.split(/[;,]/).map(p => p.trim()).filter(Boolean)
    const map = new Map<string, string>()
    for (const p of pairs) {
      const m = p.match(/^([^=;,]+?)\s*=\s*([\d.,]+)$/)
      if (!m) return null // không phải tất cả đều dạng key=value → bail
      map.set(m[1].trim(), m[2].replace(',', '.'))
    }
    return map.size > 0 ? map : null
  }

  // ── 3. Trích xuất danh sách số ───────────────────────────────────────────
  const extractNums = (s: string): string[] =>
    (s.match(/\d+([.,]\d+)?/g) ?? []).map(n => n.replace(',', '.'))

  const kvCorrect = extractKV(b)
  const numsCorrect = extractNums(b)

  // Không có số trong đáp án đúng → chỉ dùng exact match (đã check ở trên)
  if (numsCorrect.length === 0) {
    // "đúng" / "sai" / chữ → so sánh bỏ dấu câu
    return strip(a) === strip(b)
  }

  // ── 3a. Đáp án 1 biến ────────────────────────────────────────────────────
  if (numsCorrect.length === 1) {
    const numsA = extractNums(a)
    if (numsA.length >= 1 && numsA[0] === numsCorrect[0]) return true
    // Học sinh viết dài hơn/ngắn hơn: "5" ↔ "5 cái kẹo"
    if (b.startsWith(a) || a.startsWith(b)) return true
    return false
  }

  // ── 3b. Đáp án nhiều biến: thử match theo key ────────────────────────────
  const kvStudent = extractKV(a)
  if (kvCorrect && kvStudent) {
    // Cả hai đều dạng key=value → check từng key (không phụ thuộc thứ tự)
    if (kvStudent.size !== kvCorrect.size) return false
    for (const [k, v] of kvCorrect) {
      // Tìm key trong student map (so sánh strip)
      const studentVal = [...kvStudent.entries()].find(
        ([sk]) => strip(sk) === strip(k)
      )?.[1]
      if (studentVal !== v) return false
    }
    return true
  }

  // ── 3c. Học sinh chỉ nhập số (short form): "4;7" → match [4,7] ──────────
  // Thử nhiều cách tách số khỏi chuỗi student
  // (hỗ trợ: "4,7", "4 và 7", "x=4 và y=7" = 2 số riêng)
  const aNorm = a.replace(/\bvà\b/gi, ';') // "và" → ngăn cách
  const candidateLists: string[][] = [
    extractNums(aNorm),
    aNorm.split(/[;,\s]+/).flatMap(p => extractNums(p.trim())),
  ]

  for (const numsA of candidateLists) {
    if (numsA.length === numsCorrect.length) {
      if (numsA.every((n, i) => n === numsCorrect[i])) return true
      const sortedA = [...numsA].sort()
      const sortedB = [...numsCorrect].sort()
      if (sortedA.every((n, i) => n === sortedB[i])) return true
    }
  }

  return false
}

// POST: Submit answers for a subject
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ success: false, error: 'Chưa đăng nhập.' }, { status: 401 })
  }

  try {
    const { subjectId, answers } = await req.json()
    // answers: [{ questionId, answer }]

    if (!subjectId || !Array.isArray(answers)) {
      return NextResponse.json({ success: false, error: 'Dữ liệu không hợp lệ.' }, { status: 400 })
    }

    const questions = await prisma.question.findMany({
      where: { id: { in: answers.map((a: any) => a.questionId) } },
    })

    const userId = (session.user as any).id

    const results = await Promise.all(
      answers.map(async (a: { questionId: string; answer: string; hintPenalty?: number }) => {
        const question = questions.find((q: typeof questions[0]) => q.id === a.questionId)
        if (!question) return null

        const qType = ((question as any).questionType ?? 'OPEN').toUpperCase()
        let isCorrect: boolean

        if (qType === 'OPEN') {
          isCorrect = smartMatch(a.answer, question.correctAnswer)

        } else if (qType === 'MATCHING') {
          // So sánh từng cặp left=right bất kể format (key=value hay JSON)
          const parseMatchingPairs = (s: string): Record<string,string> => {
            const map: Record<string,string> = {}
            // Format: "Hello=Xin chào,Goodbye=Tạm biệt"
            if (s.includes('=') && !s.startsWith('[')) {
              s.split(',').forEach(pair => {
                const idx = pair.indexOf('=')
                if (idx > 0) map[pair.slice(0,idx).trim().toLowerCase()] = pair.slice(idx+1).trim().toLowerCase()
              })
              return map
            }
            // Format JSON: [{"left":"Hello","right":"Xin chào"},...]
            try {
              const arr = JSON.parse(s)
              if (Array.isArray(arr)) arr.forEach((p: any) => {
                if (p.left && p.right) map[String(p.left).trim().toLowerCase()] = String(p.right).trim().toLowerCase()
              })
            } catch {}
            return map
          }
          const studentMap = parseMatchingPairs(a.answer)
          const correctMap = parseMatchingPairs(question.correctAnswer)
          // Chỉ check các cặp student đã điền (không penalty câu bỏ trống)
          const filled = Object.entries(studentMap).filter(([,v]) => v)
          isCorrect = filled.length > 0 && filled.every(([k,v]) => correctMap[k] === v)

        } else {
          // MC, TRUE_FALSE, ORDERING: exact match
          isCorrect = a.answer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase()
        }
        const penalty = isCorrect ? (a.hintPenalty ?? 0) : 0
        const score = Math.max(0, isCorrect ? question.points - penalty : 0)

        return prisma.studentAnswer.upsert({
          where: { userId_questionId: { userId, questionId: a.questionId } },
          update: { answer: a.answer, isCorrect, score },
          create: {
            userId,
            questionId: a.questionId,
            subjectId,
            answer: a.answer,
            isCorrect,
            score,
          },
        })
      })
    )

    const totalScore = results.reduce((sum: number, r: any) => sum + (r?.score || 0), 0)
    const correctCount = results.filter((r: any) => r?.isCorrect).length

    return NextResponse.json({
      success: true,
      data: { totalScore, correctCount, total: answers.length },
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

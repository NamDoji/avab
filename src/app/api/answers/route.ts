import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// So sánh đáp án thông minh: tích số, bỏ đơn vị, chấp nhận viết tắt
export function smartMatch(student: string, correct: string): boolean {
  const norm = (s: string) => s.trim().toLowerCase()
    .replace(/[()\[\]{}]/g, ' ')
    .replace(/[.,;:!?]/g, '')
    .replace(/\s+/g, ' ').trim()

  const a = norm(student)
  const b = norm(correct)
  if (!a) return false
  if (a === b) return true

  // So sánh chỉ phần số đầu tiên
  const numA = a.match(/^(\d+([.,]\d+)?)/)?.[0]?.replace(',', '.')
  const numB = b.match(/^(\d+([.,]\d+)?)/)?.[0]?.replace(',', '.')
  if (numA && numB && numA === numB) return true

  // Học sinh viết ngắn hơn (“5” vs “5 cái kẹo”)
  if (b.startsWith(a) || a.startsWith(b)) return true

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

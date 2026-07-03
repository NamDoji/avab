import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

async function requireAdmin() {
  const session = await auth()
  return session && (session.user as any)?.role === 'ADMIN' ? session : null
}

interface ExtractedQuestion {
  content: string
  questionType: string
  options: Array<{ key: string; text: string }> | null
  correctAnswer: string
  explanation: string | null
  order: number
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json() as {
      importId: string
      subjectId?: string
      contentType?: string
      questions?: ExtractedQuestion[]
      importMode: 'material' | 'questions' | 'both'
      title?: string
      summary?: string
    }

    const { importId, subjectId, contentType, questions = [], importMode, title, summary } = body

    if (!importId) {
      return NextResponse.json({ success: false, error: 'importId required' }, { status: 400 })
    }

    const importLog = await prisma.materialImportLog.findUnique({
      where: { id: importId },
    })
    if (!importLog) {
      return NextResponse.json({ success: false, error: 'Import log not found' }, { status: 404 })
    }

    const targetSubjectId = subjectId ?? importLog.subjectId
    if (!targetSubjectId && (importMode === 'material' || importMode === 'both' || importMode === 'questions')) {
      return NextResponse.json({ success: false, error: 'subjectId required for import' }, { status: 400 })
    }

    let materialId: string | undefined
    let questionsCreated = 0

    // Create SubjectMaterial if needed
    if ((importMode === 'material' || importMode === 'both') && targetSubjectId) {
      const material = await prisma.subjectMaterial.create({
        data: {
          subjectId: targetSubjectId,
          type: contentType ?? 'THEORY',
          title: title ?? importLog.sourceName,
          content: summary ?? (importLog.aiAnalysis ? JSON.parse(importLog.aiAnalysis)?.summary ?? '' : ''),
          fileName: importLog.sourceName,
        },
      })
      materialId = material.id
    }

    // Create Questions if needed
    if ((importMode === 'questions' || importMode === 'both') && targetSubjectId && questions.length > 0) {
      await prisma.question.createMany({
        data: questions.map((q, idx) => ({
          subjectId: targetSubjectId,
          order: q.order ?? idx + 1,
          questionType: q.questionType ?? 'OPEN',
          content: q.content,
          options: (q.options && q.options.length > 0) ? q.options : undefined,
          correctAnswer: q.correctAnswer ?? '',
          explanation: q.explanation ?? null,
          points: 1,
        })),
      })
      questionsCreated = questions.length
    }

    // Update import log
    await prisma.materialImportLog.update({
      where: { id: importId },
      data: {
        status: 'done',
        targetId: materialId ?? null,
        questionsImported: questionsCreated,
        completedAt: new Date(),
        targetModule: importMode === 'questions' ? 'question_bank' : importMode === 'both' ? 'both' : 'subject_material',
      },
    })

    return NextResponse.json({
      success: true,
      materialId: materialId ?? null,
      questionsCreated,
      importMode,
    })
  } catch (err: unknown) {
    console.error('[material-import/import]', err)
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getCurrentOrgFromSession } from '@/lib/organization'
import { getCurrentOrgFromRequest } from '@/lib/current-org'

async function requireAdmin(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return { error: 'Vui lòng đăng nhập', status: 401 as const }
  const role = (session.user as { role?: string }).role
  if (role !== 'ADMIN' && role !== 'SUPER_ADMIN')
    return { error: 'Không có quyền truy cập', status: 403 as const }
  const userId = (session.user as { id?: string })?.id ?? ''
  const cookieOrgId = getCurrentOrgFromRequest(req)
  const orgCtx = await getCurrentOrgFromSession(userId, cookieOrgId)
  return { session, userId, orgCtx }
}

// POST /api/admin/courses/[id]/clone - Nhân bản khoá học
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const check = await requireAdmin(request)
  if ('error' in check) {
    return NextResponse.json({ success: false, error: check.error }, { status: check.status })
  }
  const { orgCtx } = check

  try {
    const { id: courseId } = await params
    const body = await request.json()
    const { name, grade } = body

    if (!name) {
      return NextResponse.json({ success: false, error: 'Vui lòng nhập tên khoá mới' }, { status: 400 })
    }

    // Lấy khoá học gốc cùng toàn bộ nội dung
    const original = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        subjects: {
          include: {
            materials: true,
            homeworkSets: {
              include: {
                questions: true,
              },
            },
            questions: {
              where: { homeworkSetId: null }, // Questions không thuộc set nào
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    })

    if (!original) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy khoá học' }, { status: 404 })
    }

    // Org-scope: ADMIN chỉ clone khoá học thuộc org của mình
    if (orgCtx && original.organizationId !== orgCtx.id) {
      return NextResponse.json({ success: false, error: 'Không có quyền truy cập khoá học này' }, { status: 403 })
    }

    const timestamp = Date.now()
    const newCode = `${original.code}_clone_${timestamp}`

    // Tạo khoá học mới
    const newCourse = await prisma.course.create({
      data: {
        code: newCode,
        name,
        description: original.description,
        thumbnail: original.thumbnail,
        price: original.price,
        pricePerSession: original.pricePerSession,
        paymentType: original.paymentType,
        courseDurationMonths: original.courseDurationMonths,
        grade: grade || null,
        courseType: original.courseType,
        // K12 generic fields
        subjectCode: original.subjectCode ?? 'GENERAL',
        subjectName: original.subjectName,
        gradeMin: original.gradeMin,
        gradeMax: original.gradeMax,
        curriculumId: original.curriculumId,
        isActive: false, // Ẩn cho đến khi admin kích hoạt
        organizationId: orgCtx?.id ?? null,
      },
    })

    // Clone từng Subject
    for (const subject of original.subjects) {
      const newSubject = await prisma.subject.create({
        data: {
          courseId: newCourse.id,
          order: subject.order,
          name: subject.name,
          icon: subject.icon,
          description: subject.description,
          isActive: subject.isActive,
          isPreview: subject.isPreview,
        },
      })

      // Clone Materials
      if (subject.materials.length > 0) {
        await prisma.subjectMaterial.createMany({
          data: subject.materials.map((m) => ({
            subjectId: newSubject.id,
            type: m.type,
            title: m.title,
            content: m.content,
            fileUrl: m.fileUrl,
            fileName: m.fileName,
          })),
        })
      }

      // Clone HomeworkSets + Questions trong set
      for (const hset of subject.homeworkSets) {
        const newSet = await prisma.homeworkSet.create({
          data: {
            subjectId: newSubject.id,
            title: hset.title,
            order: hset.order,
            fileUrl: hset.fileUrl,
          },
        })

        if (hset.questions.length > 0) {
          await prisma.question.createMany({
            data: hset.questions.map((q) => ({
              subjectId: newSubject.id,
              homeworkSetId: newSet.id,
              order: q.order,
              questionType: q.questionType,
              content: q.content,
              imageUrl: q.imageUrl,
              audioUrl: q.audioUrl,
              options: q.options as object,
              correctAnswer: q.correctAnswer,
              explanation: q.explanation,
              points: q.points,
              metadata: q.metadata as object,
            })),
          })
        }
      }

      // Clone Questions không thuộc set nào
      if (subject.questions.length > 0) {
        await prisma.question.createMany({
          data: subject.questions.map((q) => ({
            subjectId: newSubject.id,
            homeworkSetId: null,
            order: q.order,
            questionType: q.questionType,
            content: q.content,
            imageUrl: q.imageUrl,
            audioUrl: q.audioUrl,
            options: q.options as object,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            points: q.points,
            metadata: q.metadata as object,
          })),
        })
      }
    }

    return NextResponse.json({ success: true, data: { id: newCourse.id, code: newCode, name } }, { status: 201 })
  } catch (error) {
    console.error('Clone course error:', error)
    return NextResponse.json({ success: false, error: 'Không thể nhân bản khoá học' }, { status: 500 })
  }
}

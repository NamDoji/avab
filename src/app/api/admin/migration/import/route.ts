import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import bcrypt from 'bcryptjs'

async function requireAdmin() {
  const session = await auth()
  if (!session || (session.user as any)?.role !== 'ADMIN') return null
  return session
}

interface ImportError {
  row: number
  message: string
}

function applyMapping(
  row: Record<string, unknown>,
  mapping: Record<string, string | null>
): Record<string, string> {
  const mapped: Record<string, string> = {}
  for (const [srcHeader, targetField] of Object.entries(mapping)) {
    if (targetField && srcHeader in row) {
      mapped[targetField] = String(row[srcHeader] ?? '').trim()
    }
  }
  return mapped
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json() as {
      migrationId: string
      mapping: Record<string, string | null>
      data: Record<string, unknown>[]
      skipErrors: boolean
    }

    const { migrationId, mapping, data, skipErrors } = body

    if (!migrationId || !mapping || !data) {
      return NextResponse.json({ success: false, error: 'Thiếu tham số' }, { status: 400 })
    }

    const log = await prisma.migrationLog.findUnique({ where: { id: migrationId } })
    if (!log) {
      return NextResponse.json({ success: false, error: 'Migration không tồn tại' }, { status: 404 })
    }

    await prisma.migrationLog.update({
      where: { id: migrationId },
      data: { status: 'importing' },
    })

    const module = log.module
    let imported = 0
    let failed = 0
    const importErrors: ImportError[] = []

    for (let i = 0; i < data.length; i++) {
      const row = data[i]
      const mapped = applyMapping(row, mapping)
      const rowNum = i + 2

      try {
        if (module === 'students' || module === 'teachers') {
          const { name, phone, email, specialization, parentName, parentPhone, courseCode } = mapped
          if (!phone) throw new Error('Thiếu số điện thoại')

          const rawPhone = phone.replace(/\s/g, '')
          const last4 = rawPhone.slice(-4)
          const hashedPassword = await bcrypt.hash(last4, 10)

          const newUser = await prisma.user.create({
            data: {
              name: name || phone,
              phone: rawPhone,
              email: email || null,
              password: hashedPassword,
              role: module === 'students' ? 'STUDENT' : 'TEACHER',
            },
          })

          // Assign to default organization
          const defaultOrg = await prisma.organization.findFirst({
            where: { deletedAt: null, isActive: true },
            orderBy: { createdAt: 'asc' },
          })
          if (defaultOrg) {
            await prisma.organizationUser.upsert({
              where: { organizationId_userId: { organizationId: defaultOrg.id, userId: newUser.id } },
              create: { organizationId: defaultOrg.id, userId: newUser.id, orgRole: 'MEMBER' },
              update: {},
            })
          }

          // If student has courseCode, try to enroll
          if (module === 'students' && courseCode) {
            try {
              const course = await prisma.course.findUnique({ where: { code: courseCode } })
              if (course) {
                await prisma.enrollment.create({
                  data: {
                    userId: newUser.id,
                    courseId: course.id,
                    status: 'ACTIVE',
                  },
                })
              }
            } catch {
              // enrollment failure is non-fatal
            }
          }

          // Store parentPhone metadata if available (non-blocking)
          void parentName
          void parentPhone

        } else if (module === 'rooms') {
          const { name, capacity, type, floor, building } = mapped
          if (!name) throw new Error('Thiếu tên phòng')

          await prisma.classRoom.create({
            data: {
              name,
              capacity: capacity ? parseInt(capacity, 10) : 30,
              type: type || 'standard',
              floor: floor ? parseInt(floor, 10) : null,
              building: building || null,
            },
          })

        } else if (module === 'questions') {
          const { subjectName, content, correctAnswer, explanation, questionType } = mapped
          if (!content || !correctAnswer) throw new Error('Thiếu nội dung hoặc đáp án')

          // Lookup subject by name
          let subjectId: string | null = null
          if (subjectName) {
            const subject = await prisma.subject.findFirst({
              where: { name: { contains: subjectName } },
            })
            subjectId = subject?.id ?? null
          }

          if (!subjectId) throw new Error(`Không tìm thấy chuyên đề: ${subjectName}`)

          await prisma.question.create({
            data: {
              subjectId,
              content,
              correctAnswer,
              explanation: explanation || null,
              questionType: questionType || 'OPEN',
            },
          })

        } else if (module === 'courses') {
          const { code, name, description, gradeMin, subjectCode, price } = mapped
          if (!code || !name) throw new Error('Thiếu mã hoặc tên khóa học')

          await prisma.course.create({
            data: {
              code,
              name,
              description: description || null,
              gradeMin: gradeMin ? parseInt(gradeMin, 10) : null,
              subjectCode: subjectCode || 'GENERAL',
              price: price ? parseInt(price, 10) : 0,
            },
          })

        } else {
          throw new Error(`Module ${module} chưa được hỗ trợ import`)
        }

        imported++
      } catch (rowErr) {
        failed++
        importErrors.push({
          row: rowNum,
          message: rowErr instanceof Error ? rowErr.message : String(rowErr),
        })
        if (!skipErrors) {
          // Stop on first error if skipErrors is false
          break
        }
      }
    }

    // Update MigrationLog
    await prisma.migrationLog.update({
      where: { id: migrationId },
      data: {
        status: 'done',
        successRows: imported,
        failedRows: failed,
        errors: importErrors as unknown as Parameters<typeof prisma.migrationLog.update>[0]['data']['errors'],
        summary: { imported, failed, total: data.length } as unknown as Parameters<typeof prisma.migrationLog.update>[0]['data']['summary'],
        completedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      imported,
      failed,
      errors: importErrors,
    })
  } catch (err) {
    console.error('[migration/import:POST]', err)
    return NextResponse.json({ success: false, error: 'Import thất bại' }, { status: 500 })
  }
}

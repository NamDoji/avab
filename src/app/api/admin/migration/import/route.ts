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

// Pre-computed password hash for "Ob@12345" — used as default for bulk import
const DEFAULT_PWD_HASH = '$2b$10$HzkdhQU1fPmNGycBbpHisOQ58XefkBmcUwLDQp2OVYDUph.HaDl.2'

/**
 * Direct import mode — POST with { type, rows }
 * Lightweight path for ImportExcelButton component (no MigrationLog overhead).
 */
async function handleDirectImport(
  type: string,
  rows: Record<string, string>[],
  skipErrors: boolean,
) {
  let imported = 0
  let failed = 0
  const importErrors: ImportError[] = []

  // Get default org once
  const defaultOrg = await prisma.organization.findFirst({
    where: { deletedAt: null, isActive: true },
    orderBy: { createdAt: 'asc' },
  })

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const rowNum = i + 2 // Excel row (1-indexed header + 1)

    try {
      if (type === 'students') {
        const name = row['Họ và tên (*)'] ?? ''
        const phone = (row['Số điện thoại (*)'] ?? '').replace(/\s/g, '')
        const email = row['Email'] || null
        const courseCode = row['Lớp học (Course Code)'] || null

        if (!phone) throw new Error('Thiếu số điện thoại')
        if (!name) throw new Error('Thiếu họ và tên')

        const user = await prisma.user.upsert({
          where: { phone },
          create: {
            name,
            phone,
            email,
            password: DEFAULT_PWD_HASH,
            role: 'STUDENT',
          },
          update: { name },
        })

        if (defaultOrg) {
          await prisma.organizationUser.upsert({
            where: { organizationId_userId: { organizationId: defaultOrg.id, userId: user.id } },
            create: { organizationId: defaultOrg.id, userId: user.id, orgRole: 'MEMBER' },
            update: {},
          })
        }

        if (courseCode) {
          try {
            const course = await prisma.course.findUnique({ where: { code: courseCode } })
            if (course) {
              await prisma.enrollment.upsert({
                where: { userId_courseId: { userId: user.id, courseId: course.id } },
                create: { userId: user.id, courseId: course.id, status: 'ACTIVE' },
                update: { status: 'ACTIVE' },
              })
            }
          } catch {
            // enrollment failure is non-fatal
          }
        }

      } else if (type === 'teachers') {
        const name = row['Họ và tên (*)'] ?? ''
        const phone = (row['Số điện thoại (*)'] ?? '').replace(/\s/g, '')
        const email = row['Email'] || null
        const campusCode = row['Cơ sở (Campus Code)'] || null

        if (!phone) throw new Error('Thiếu số điện thoại')
        if (!name) throw new Error('Thiếu họ và tên')

        const user = await prisma.user.upsert({
          where: { phone },
          create: {
            name,
            phone,
            email,
            password: DEFAULT_PWD_HASH,
            role: 'TEACHER',
          },
          update: { name },
        })

        if (defaultOrg) {
          await prisma.organizationUser.upsert({
            where: { organizationId_userId: { organizationId: defaultOrg.id, userId: user.id } },
            create: { organizationId: defaultOrg.id, userId: user.id, orgRole: 'MEMBER' },
            update: {},
          })
        }

        if (campusCode) {
          try {
            const campus = await prisma.campus.findFirst({ where: { code: campusCode } })
            if (campus) {
              await prisma.campusUser.upsert({
                where: { campusId_userId: { campusId: campus.id, userId: user.id } },
                create: { campusId: campus.id, userId: user.id, isPrimary: true },
                update: {},
              })
            }
          } catch {
            // campus assign failure is non-fatal
          }
        }

      } else if (type === 'leads') {
        const name = row['Họ tên PH/HS (*)'] ?? ''
        const phone = (row['Số điện thoại (*)'] ?? '').replace(/\s/g, '')
        const note = row['Ghi chú'] || null
        const typeVal = row['Loại (CONTACT/ENROLLMENT)'] || 'CONTACT'

        if (!phone) throw new Error('Thiếu số điện thoại')
        if (!name) throw new Error('Thiếu họ và tên')

        // Registration.phone is not @unique — use findFirst + create/update
        const existing = await prisma.registration.findFirst({ where: { phone } })
        if (existing) {
          await prisma.registration.update({
            where: { id: existing.id },
            data: { name, note },
          })
        } else {
          await prisma.registration.create({
            data: {
              name,
              phone,
              note,
              status: 'NEW',
              type: typeVal === 'ENROLLMENT' ? 'ENROLLMENT' : 'CONTACT',
            },
          })
        }

      } else if (type === 'staff') {
        const name = row['Họ và tên (*)'] ?? ''
        const phone = (row['Số điện thoại (*)'] ?? '').replace(/\s/g, '')
        const email = row['Email'] || null
        const roleVal = row['Chức vụ (ADMIN/TEACHER)'] || 'TEACHER'
        const campusCode = row['Cơ sở (Campus Code)'] || null

        if (!phone) throw new Error('Thiếu số điện thoại')
        if (!name) throw new Error('Thiếu họ và tên')

        const validRole = roleVal === 'ADMIN' ? 'ADMIN' : 'TEACHER'

        const user = await prisma.user.upsert({
          where: { phone },
          create: {
            name,
            phone,
            email,
            password: DEFAULT_PWD_HASH,
            role: validRole,
          },
          update: { name, role: validRole },
        })

        if (defaultOrg) {
          await prisma.organizationUser.upsert({
            where: { organizationId_userId: { organizationId: defaultOrg.id, userId: user.id } },
            create: { organizationId: defaultOrg.id, userId: user.id, orgRole: validRole === 'ADMIN' ? 'ADMIN' : 'MEMBER' },
            update: {},
          })
        }

        if (campusCode) {
          try {
            const campus = await prisma.campus.findFirst({ where: { code: campusCode } })
            if (campus) {
              await prisma.campusUser.upsert({
                where: { campusId_userId: { campusId: campus.id, userId: user.id } },
                create: { campusId: campus.id, userId: user.id, isPrimary: true },
                update: {},
              })
            }
          } catch {
            // campus assign failure is non-fatal
          }
        }

      } else {
        throw new Error(`Type "${type}" chưa được hỗ trợ trong direct import`)
      }

      imported++
    } catch (rowErr) {
      failed++
      importErrors.push({
        row: rowNum,
        message: rowErr instanceof Error ? rowErr.message : String(rowErr),
      })
      if (!skipErrors) break
    }
  }

  return { imported, failed, errors: importErrors }
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json() as {
      // Direct import mode (from ImportExcelButton)
      type?: string
      rows?: Record<string, string>[]
      skipErrors?: boolean
      // Legacy migration mode
      migrationId?: string
      mapping?: Record<string, string | null>
      data?: Record<string, unknown>[]
    }

    // ── Direct import mode ────────────────────────────────────────────
    if (body.type && body.rows) {
      const { type, rows, skipErrors = true } = body
      if (!Array.isArray(rows) || rows.length === 0) {
        return NextResponse.json({ success: false, error: 'Không có dữ liệu để import' }, { status: 400 })
      }

      const result = await handleDirectImport(type, rows, skipErrors)

      return NextResponse.json({
        success: true,
        imported: result.imported,
        failed: result.failed,
        errors: result.errors,
      })
    }

    // ── Legacy migration mode (migrationId + mapping + data) ─────────
    const { migrationId, mapping, data, skipErrors = true } = body

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

    const defaultOrg = await prisma.organization.findFirst({
      where: { deletedAt: null, isActive: true },
      orderBy: { createdAt: 'asc' },
    })

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

          if (defaultOrg) {
            await prisma.organizationUser.upsert({
              where: { organizationId_userId: { organizationId: defaultOrg.id, userId: newUser.id } },
              create: { organizationId: defaultOrg.id, userId: newUser.id, orgRole: 'MEMBER' },
              update: {},
            })
          }

          if (module === 'students' && courseCode) {
            try {
              const course = await prisma.course.findUnique({ where: { code: courseCode } })
              if (course) {
                await prisma.enrollment.create({
                  data: { userId: newUser.id, courseId: course.id, status: 'ACTIVE' },
                })
              }
            } catch { /* non-fatal */ }
          }

          void specialization
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
        if (!skipErrors) break
      }
    }

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

    return NextResponse.json({ success: true, imported, failed, errors: importErrors })
  } catch (err) {
    console.error('[migration/import:POST]', err)
    return NextResponse.json({ success: false, error: 'Import thất bại' }, { status: 500 })
  }
}

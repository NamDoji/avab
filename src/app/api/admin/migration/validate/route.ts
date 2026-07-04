import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

async function requireAdmin() {
  const session = await auth()
  if (!session || !['ADMIN','SUPER_ADMIN'].includes((session.user as any)?.role ?? '')) return null
  return session
}

interface ValidationError {
  row: number
  field: string
  value: string
  message: string
}

const REQUIRED_FIELDS: Record<string, string[]> = {
  students: ['name', 'phone'],
  teachers: ['name', 'phone'],
  courses: ['code', 'name'],
  classes: ['courseName', 'studentPhone'],
  rooms: ['name'],
  questions: ['content', 'correctAnswer'],
}

function isValidPhone(v: string): boolean {
  return /^\d{10}$/.test(v.replace(/\s/g, ''))
}

function isValidEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
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
    }

    const { migrationId, mapping, data } = body

    if (!migrationId || !mapping || !data) {
      return NextResponse.json({ success: false, error: 'Thiếu tham số' }, { status: 400 })
    }

    // Get migration log for module info
    const log = await prisma.migrationLog.findUnique({ where: { id: migrationId } })
    if (!log) {
      return NextResponse.json({ success: false, error: 'Migration không tồn tại' }, { status: 404 })
    }

    // Update status
    await prisma.migrationLog.update({
      where: { id: migrationId },
      data: { status: 'validating', mapping },
    })

    const module = log.module
    const required = REQUIRED_FIELDS[module] ?? []
    const validRows: Record<string, unknown>[] = []
    const errors: ValidationError[] = []

    // Build reverse mapping: targetField → value from source row
    const applyMapping = (row: Record<string, unknown>): Record<string, string> => {
      const mapped: Record<string, string> = {}
      for (const [srcHeader, targetField] of Object.entries(mapping)) {
        if (targetField && srcHeader in row) {
          mapped[targetField] = String(row[srcHeader] ?? '').trim()
        }
      }
      return mapped
    }

    for (let i = 0; i < data.length; i++) {
      const row = data[i]
      const mapped = applyMapping(row)
      const rowErrors: ValidationError[] = []

      // Required fields
      for (const field of required) {
        const val = mapped[field] ?? ''
        if (!val) {
          rowErrors.push({ row: i + 2, field, value: val, message: `${field} là bắt buộc` })
        }
      }

      // Phone validation
      const phoneFields = ['phone', 'parentPhone', 'studentPhone']
      for (const field of phoneFields) {
        const val = mapped[field]
        if (val && !isValidPhone(val)) {
          rowErrors.push({ row: i + 2, field, value: val, message: 'Số điện thoại phải có 10 chữ số' })
        }
      }

      // Email validation
      if (mapped.email && !isValidEmail(mapped.email)) {
        rowErrors.push({ row: i + 2, field: 'email', value: mapped.email, message: 'Email không hợp lệ' })
      }

      // Phone uniqueness in DB
      const phoneFieldsInModule = ['phone', 'studentPhone']
      for (const field of phoneFieldsInModule) {
        const phone = mapped[field]
        if (phone && isValidPhone(phone) && (module === 'students' || module === 'teachers')) {
          try {
            const existing = await prisma.user.findFirst({ where: { phone } })
            if (existing) {
              rowErrors.push({ row: i + 2, field, value: phone, message: `Số điện thoại ${phone} đã tồn tại trong hệ thống` })
            }
          } catch {
            // skip DB check if fails
          }
        }
      }

      if (rowErrors.length === 0) {
        validRows.push(row)
      } else {
        errors.push(...rowErrors)
      }
    }

    return NextResponse.json({
      success: true,
      valid: validRows,
      errors,
      stats: {
        total: data.length,
        validCount: validRows.length,
        errorCount: data.length - validRows.length,
      },
    })
  } catch (err) {
    console.error('[migration/validate:POST]', err)
    return NextResponse.json({ success: false, error: 'Validation thất bại' }, { status: 500 })
  }
}

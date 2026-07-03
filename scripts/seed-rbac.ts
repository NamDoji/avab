import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ── Permission definitions ────────────────────────────────────────────────────
const PERMISSIONS: { key: string; module: string; action: string; name: string }[] = [
  // Course
  { key: 'course.view',    module: 'course',    action: 'view',    name: 'Xem khóa học' },
  { key: 'course.create',  module: 'course',    action: 'create',  name: 'Tạo khóa học' },
  { key: 'course.edit',    module: 'course',    action: 'edit',    name: 'Sửa khóa học' },
  { key: 'course.delete',  module: 'course',    action: 'delete',  name: 'Xóa khóa học' },
  { key: 'course.publish', module: 'course',    action: 'publish', name: 'Đăng khóa học' },

  // Lesson / Subject
  { key: 'lesson.view',    module: 'lesson',    action: 'view',    name: 'Xem bài học' },
  { key: 'lesson.create',  module: 'lesson',    action: 'create',  name: 'Tạo bài học' },
  { key: 'lesson.edit',    module: 'lesson',    action: 'edit',    name: 'Sửa bài học' },
  { key: 'lesson.delete',  module: 'lesson',    action: 'delete',  name: 'Xóa bài học' },
  { key: 'lesson.generate',module: 'lesson',    action: 'generate',name: 'AI Generate bài học' },
  { key: 'lesson.publish', module: 'lesson',    action: 'publish', name: 'Đăng bài học' },

  // Homework
  { key: 'homework.view',     module: 'homework', action: 'view',    name: 'Xem bài tập' },
  { key: 'homework.create',   module: 'homework', action: 'create',  name: 'Tạo bài tập' },
  { key: 'homework.edit',     module: 'homework', action: 'edit',    name: 'Sửa bài tập' },
  { key: 'homework.generate', module: 'homework', action: 'generate',name: 'AI Generate bài tập' },

  // Question
  { key: 'question.view',    module: 'question', action: 'view',    name: 'Xem câu hỏi' },
  { key: 'question.create',  module: 'question', action: 'create',  name: 'Tạo câu hỏi' },
  { key: 'question.edit',    module: 'question', action: 'edit',    name: 'Sửa câu hỏi' },
  { key: 'question.delete',  module: 'question', action: 'delete',  name: 'Xóa câu hỏi' },
  { key: 'question.approve', module: 'question', action: 'approve', name: 'Duyệt câu hỏi' },

  // Student
  { key: 'student.view',   module: 'student', action: 'view',   name: 'Xem học sinh' },
  { key: 'student.edit',   module: 'student', action: 'edit',   name: 'Sửa học sinh' },
  { key: 'student.enroll', module: 'student', action: 'enroll', name: 'Đăng ký học sinh' },

  // Teacher
  { key: 'teacher.view',   module: 'teacher', action: 'view',   name: 'Xem giáo viên' },
  { key: 'teacher.edit',   module: 'teacher', action: 'edit',   name: 'Sửa giáo viên' },
  { key: 'teacher.assign', module: 'teacher', action: 'assign', name: 'Phân công giáo viên' },

  // Class
  { key: 'class.view',   module: 'class', action: 'view',   name: 'Xem lớp học' },
  { key: 'class.create', module: 'class', action: 'create', name: 'Tạo lớp học' },
  { key: 'class.edit',   module: 'class', action: 'edit',   name: 'Sửa lớp học' },
  { key: 'class.delete', module: 'class', action: 'delete', name: 'Xóa lớp học' },

  // Finance
  { key: 'finance.view',   module: 'finance', action: 'view',   name: 'Xem tài chính' },
  { key: 'finance.edit',   module: 'finance', action: 'edit',   name: 'Sửa tài chính' },
  { key: 'finance.export', module: 'finance', action: 'export', name: 'Xuất tài chính' },

  // Report / Analytics
  { key: 'report.view',   module: 'report',    action: 'view',   name: 'Xem báo cáo' },
  { key: 'report.export', module: 'report',    action: 'export', name: 'Xuất báo cáo' },
  { key: 'analytics.view',module: 'analytics', action: 'view',   name: 'Xem analytics' },

  // AI
  { key: 'ai.generate',  module: 'ai', action: 'generate', name: 'AI Generate' },
  { key: 'ai.config',    module: 'ai', action: 'config',   name: 'Cấu hình AI' },
  { key: 'ai.cost.view', module: 'ai', action: 'view',     name: 'Xem chi phí AI' },

  // Content / Curriculum
  { key: 'content.view',    module: 'content',    action: 'view',    name: 'Xem nội dung' },
  { key: 'content.create',  module: 'content',    action: 'create',  name: 'Tạo nội dung' },
  { key: 'content.edit',    module: 'content',    action: 'edit',    name: 'Sửa nội dung' },
  { key: 'content.delete',  module: 'content',    action: 'delete',  name: 'Xóa nội dung' },
  { key: 'content.publish', module: 'content',    action: 'publish', name: 'Đăng nội dung' },
  { key: 'curriculum.view', module: 'curriculum', action: 'view',    name: 'Xem chương trình' },
  { key: 'curriculum.create',module:'curriculum', action: 'create',  name: 'Tạo chương trình' },
  { key: 'curriculum.edit', module: 'curriculum', action: 'edit',    name: 'Sửa chương trình' },

  // Approval
  { key: 'approval.submit',  module: 'approval', action: 'submit',  name: 'Gửi duyệt' },
  { key: 'approval.approve', module: 'approval', action: 'approve', name: 'Phê duyệt' },
  { key: 'approval.reject',  module: 'approval', action: 'reject',  name: 'Từ chối duyệt' },

  // News
  { key: 'news.view',    module: 'news', action: 'view',    name: 'Xem tin tức' },
  { key: 'news.create',  module: 'news', action: 'create',  name: 'Tạo tin tức' },
  { key: 'news.edit',    module: 'news', action: 'edit',    name: 'Sửa tin tức' },
  { key: 'news.delete',  module: 'news', action: 'delete',  name: 'Xóa tin tức' },
  { key: 'news.publish', module: 'news', action: 'publish', name: 'Đăng tin tức' },

  // Meeting
  { key: 'meeting.view',   module: 'meeting', action: 'view',   name: 'Xem cuộc họp' },
  { key: 'meeting.create', module: 'meeting', action: 'create', name: 'Tạo cuộc họp' },
  { key: 'meeting.edit',   module: 'meeting', action: 'edit',   name: 'Sửa cuộc họp' },

  // User management
  { key: 'user.view',   module: 'user', action: 'view',   name: 'Xem người dùng' },
  { key: 'user.create', module: 'user', action: 'create', name: 'Tạo người dùng' },
  { key: 'user.edit',   module: 'user', action: 'edit',   name: 'Sửa người dùng' },
  { key: 'user.delete', module: 'user', action: 'delete', name: 'Xóa người dùng' },

  // Role management
  { key: 'role.view',   module: 'role', action: 'view',   name: 'Xem vai trò' },
  { key: 'role.create', module: 'role', action: 'create', name: 'Tạo vai trò' },
  { key: 'role.edit',   module: 'role', action: 'edit',   name: 'Sửa vai trò' },
  { key: 'role.delete', module: 'role', action: 'delete', name: 'Xóa vai trò' },

  // Audit
  { key: 'audit.view', module: 'audit', action: 'view', name: 'Xem audit log' },

  // Settings
  { key: 'settings.view', module: 'settings', action: 'view', name: 'Xem cài đặt' },
  { key: 'settings.edit', module: 'settings', action: 'edit', name: 'Sửa cài đặt' },

  // Publishing
  { key: 'publishing.export', module: 'publishing', action: 'export', name: 'Xuất bản' },
]

// ── Role definitions ──────────────────────────────────────────────────────────
type RoleDef = {
  slug: string
  name: string
  level: string
  color: string
  isSystem: boolean
  permissions: string[] | 'ALL'
}

const ROLES: RoleDef[] = [
  {
    slug: 'super-admin', name: 'Super Admin', level: 'SYSTEM', color: 'red', isSystem: true,
    permissions: 'ALL',
  },
  {
    slug: 'platform-admin', name: 'Platform Admin', level: 'SYSTEM', color: 'orange', isSystem: true,
    permissions: ['course.*', 'lesson.*', 'homework.*', 'question.*', 'student.*', 'teacher.*',
                  'class.*', 'finance.*', 'report.*', 'analytics.view', 'ai.*', 'content.*',
                  'curriculum.*', 'approval.*', 'news.*', 'user.*', 'audit.view', 'publishing.*'],
  },
  {
    slug: 'org-owner', name: 'Chủ trường / Owner', level: 'ORGANIZATION', color: 'purple', isSystem: true,
    permissions: ['course.*', 'lesson.*', 'homework.*', 'question.*', 'student.*', 'teacher.*',
                  'class.*', 'finance.*', 'report.*', 'analytics.view', 'ai.generate', 'ai.cost.view',
                  'content.*', 'curriculum.*', 'approval.*', 'news.*', 'user.view', 'publishing.*'],
  },
  {
    slug: 'principal', name: 'Hiệu trưởng', level: 'ORGANIZATION', color: 'indigo', isSystem: true,
    permissions: ['course.*', 'lesson.view', 'student.view', 'teacher.*', 'class.*',
                  'finance.view', 'report.*', 'analytics.view', 'approval.*', 'news.view'],
  },
  {
    slug: 'academic-director', name: 'Academic Director', level: 'ORGANIZATION', color: 'blue', isSystem: true,
    permissions: ['course.*', 'lesson.*', 'homework.*', 'question.*', 'student.view', 'teacher.view',
                  'class.view', 'report.view', 'analytics.view', 'ai.generate', 'content.*',
                  'curriculum.*', 'approval.*', 'publishing.*'],
  },
  {
    slug: 'dept-head', name: 'Trưởng bộ môn', level: 'ORGANIZATION', color: 'cyan', isSystem: true,
    permissions: ['course.view', 'course.edit', 'lesson.*', 'homework.*', 'question.*',
                  'student.view', 'class.view', 'report.view', 'ai.generate', 'content.*',
                  'approval.submit', 'approval.approve'],
  },
  {
    slug: 'content-manager', name: 'Content Manager', level: 'ACADEMIC', color: 'teal', isSystem: true,
    permissions: ['course.view', 'course.edit', 'lesson.*', 'homework.*', 'question.*',
                  'ai.generate', 'content.*', 'curriculum.view', 'approval.submit', 'publishing.*'],
  },
  {
    slug: 'reviewer', name: 'Reviewer', level: 'ACADEMIC', color: 'green', isSystem: true,
    permissions: ['course.view', 'lesson.view', 'lesson.edit', 'homework.view',
                  'question.view', 'question.approve', 'content.view', 'approval.approve', 'approval.reject'],
  },
  {
    slug: 'qa', name: 'QA', level: 'ACADEMIC', color: 'lime', isSystem: true,
    permissions: ['course.view', 'lesson.view', 'homework.view', 'question.view',
                  'content.view', 'approval.approve', 'approval.reject', 'audit.view'],
  },
  {
    slug: 'teacher', name: 'Giáo viên', level: 'ACADEMIC', color: 'emerald', isSystem: true,
    permissions: ['course.view', 'lesson.view', 'lesson.create', 'lesson.edit', 'lesson.generate',
                  'homework.view', 'homework.create', 'homework.edit', 'homework.generate',
                  'question.view', 'question.create', 'question.edit',
                  'student.view', 'class.view', 'report.view', 'ai.generate', 'meeting.view', 'meeting.create'],
  },
  {
    slug: 'teaching-assistant', name: 'Trợ giảng', level: 'ACADEMIC', color: 'yellow', isSystem: true,
    permissions: ['course.view', 'lesson.view', 'homework.view', 'question.view',
                  'student.view', 'class.view', 'meeting.view'],
  },
  {
    slug: 'finance', name: 'Kế toán / Finance', level: 'OPERATION', color: 'amber', isSystem: true,
    permissions: ['finance.view', 'finance.edit', 'finance.export', 'report.view', 'report.export',
                  'student.view', 'analytics.view'],
  },
  {
    slug: 'sales', name: 'Sales', level: 'OPERATION', color: 'orange', isSystem: true,
    permissions: ['student.view', 'student.enroll', 'class.view', 'course.view',
                  'report.view', 'meeting.view', 'meeting.create', 'meeting.edit', 'news.view'],
  },
  {
    slug: 'customer-care', name: 'Chăm sóc khách hàng', level: 'OPERATION', color: 'rose', isSystem: true,
    permissions: ['student.view', 'class.view', 'course.view', 'report.view', 'meeting.view', 'meeting.create'],
  },
  {
    slug: 'class-manager', name: 'Quản lý lớp', level: 'OPERATION', color: 'pink', isSystem: true,
    permissions: ['class.view', 'class.create', 'class.edit', 'student.view',
                  'teacher.view', 'report.view', 'meeting.view', 'meeting.create'],
  },
  {
    slug: 'parent', name: 'Phụ huynh', level: 'END_USER', color: 'sky', isSystem: true,
    permissions: ['student.view', 'report.view', 'course.view', 'lesson.view', 'meeting.view'],
  },
  {
    slug: 'student', name: 'Học sinh', level: 'END_USER', color: 'blue', isSystem: true,
    permissions: ['course.view', 'lesson.view', 'homework.view', 'question.view', 'report.view'],
  },
  {
    slug: 'guest', name: 'Khách / Guest', level: 'END_USER', color: 'gray', isSystem: true,
    permissions: ['course.view', 'news.view'],
  },
]

// ── Helper: expand wildcard patterns ────────────────────────────────────────
function expandPermissions(patterns: string[], allKeys: string[]): string[] {
  const result = new Set<string>()
  for (const pattern of patterns) {
    if (pattern.endsWith('.*')) {
      const prefix = pattern.slice(0, -2) // remove '.*'
      for (const key of allKeys) {
        if (key.startsWith(prefix + '.') || key === prefix) {
          result.add(key)
        }
      }
    } else {
      result.add(pattern)
    }
  }
  return Array.from(result)
}

// ── Main seed ─────────────────────────────────────────────────────────────────
async function main() {
  console.log('🌱 Seeding RBAC: permissions + roles...\n')

  // 1. Upsert all permissions
  console.log(`📋 Upserting ${PERMISSIONS.length} permissions...`)
  for (const perm of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { key: perm.key },
      update: { module: perm.module, action: perm.action, name: perm.name },
      create: { key: perm.key, module: perm.module, action: perm.action, name: perm.name },
    })
  }
  console.log(`   ✅ ${PERMISSIONS.length} permissions upserted\n`)

  // Fetch all permission keys for wildcard expansion
  const allPerms = await prisma.permission.findMany({ select: { id: true, key: true } })
  const keyToId = new Map(allPerms.map(p => [p.key, p.id]))
  const allKeys = Array.from(keyToId.keys())

  // 2. Upsert roles + rebuild RolePermissions
  console.log(`🛡️  Processing ${ROLES.length} roles...`)
  for (const roleDef of ROLES) {
    // Upsert role
    const role = await prisma.role.upsert({
      where: { slug: roleDef.slug },
      update: {
        name: roleDef.name,
        level: roleDef.level,
        color: roleDef.color,
        isSystem: roleDef.isSystem,
      },
      create: {
        slug: roleDef.slug,
        name: roleDef.name,
        level: roleDef.level,
        color: roleDef.color,
        isSystem: roleDef.isSystem,
      },
    })

    // Resolve permission IDs
    const permKeys =
      roleDef.permissions === 'ALL'
        ? allKeys
        : expandPermissions(roleDef.permissions, allKeys)

    const permIds = permKeys
      .map(k => keyToId.get(k))
      .filter((id): id is string => id !== undefined)

    // Delete existing role permissions, then recreate
    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } })
    if (permIds.length > 0) {
      await prisma.rolePermission.createMany({
        data: permIds.map(permissionId => ({ roleId: role.id, permissionId })),
        skipDuplicates: true,
      })
    }

    console.log(`   ✅ ${roleDef.slug} (${roleDef.level}) — ${permIds.length} permissions`)
  }

  console.log('\n🎉 RBAC seed complete!')
}

main()
  .catch(e => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())

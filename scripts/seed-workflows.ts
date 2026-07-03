import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ── Workflow step type ────────────────────────────────────────────────────────
interface WorkflowStep {
  id: string
  type: 'form_input' | 'review' | 'approval' | 'auto' | 'payment' | 'notification'
  name: string
  assigneeRole?: string
  nextSteps?: string[]
  autoAction?: string
}

interface WorkflowTemplate {
  slug: string
  name: string
  module: string
  description: string
  isTemplate: boolean
  steps: WorkflowStep[]
}

// ── Templates ─────────────────────────────────────────────────────────────────
const TEMPLATES: WorkflowTemplate[] = [
  {
    slug: 'course-creation',
    name: 'Tạo khóa học mới',
    module: 'content',
    description: 'Quy trình tạo và phê duyệt khóa học mới',
    isTemplate: true,
    steps: [
      { id: 's1', type: 'form_input', name: 'Điền thông tin khóa học', assigneeRole: 'teacher' },
      { id: 's2', type: 'review', name: 'Review nội dung', assigneeRole: 'academic_director', nextSteps: ['s3', 'reject'] },
      { id: 's3', type: 'approval', name: 'Phê duyệt cuối', assigneeRole: 'principal', nextSteps: ['s4', 'reject'] },
      { id: 's4', type: 'auto', name: 'Xuất bản', autoAction: 'publish_course' },
    ],
  },
  {
    slug: 'content-qa',
    name: 'QA học liệu',
    module: 'content',
    description: 'Kiểm định chất lượng nội dung trước khi xuất bản',
    isTemplate: true,
    steps: [
      { id: 's1', type: 'review', name: 'QA Review', assigneeRole: 'qa' },
      { id: 's2', type: 'approval', name: 'Final Approval', assigneeRole: 'academic_director' },
      { id: 's3', type: 'auto', name: 'Publish', autoAction: 'publish_content' },
    ],
  },
  {
    slug: 'student-enrollment',
    name: 'Đăng ký học',
    module: 'enrollment',
    description: 'Quy trình đăng ký khóa học của học sinh',
    isTemplate: true,
    steps: [
      { id: 's1', type: 'form_input', name: 'Điền thông tin đăng ký' },
      { id: 's2', type: 'approval', name: 'Duyệt đăng ký', assigneeRole: 'class_manager' },
      { id: 's3', type: 'payment', name: 'Đóng học phí' },
      { id: 's4', type: 'auto', name: 'Kích hoạt tài khoản', autoAction: 'activate_enrollment' },
    ],
  },
  {
    slug: 'leave-request',
    name: 'Xin nghỉ phép',
    module: 'hr',
    description: 'Quy trình xin nghỉ phép cho nhân viên',
    isTemplate: true,
    steps: [
      { id: 's1', type: 'form_input', name: 'Điền đơn xin nghỉ' },
      { id: 's2', type: 'approval', name: 'Duyệt', assigneeRole: 'dept_head' },
    ],
  },
  {
    slug: 'tuition-refund',
    name: 'Hoàn học phí',
    module: 'finance',
    description: 'Quy trình xử lý yêu cầu hoàn học phí',
    isTemplate: true,
    steps: [
      { id: 's1', type: 'form_input', name: 'Yêu cầu hoàn tiền' },
      { id: 's2', type: 'review', name: 'Kiểm tra hồ sơ', assigneeRole: 'finance' },
      { id: 's3', type: 'approval', name: 'Phê duyệt hoàn tiền', assigneeRole: 'principal' },
      { id: 's4', type: 'auto', name: 'Xử lý hoàn tiền', autoAction: 'process_refund' },
    ],
  },
  {
    slug: 'scholarship-application',
    name: 'Xét học bổng',
    module: 'finance',
    description: 'Quy trình xét duyệt học bổng',
    isTemplate: true,
    steps: [
      { id: 's1', type: 'form_input', name: 'Nộp hồ sơ xin học bổng' },
      { id: 's2', type: 'review', name: 'Xem xét hồ sơ', assigneeRole: 'academic_director' },
      { id: 's3', type: 'approval', name: 'Quyết định', assigneeRole: 'principal' },
    ],
  },
  {
    slug: 'teacher-evaluation',
    name: 'Đánh giá giáo viên',
    module: 'hr',
    description: 'Quy trình đánh giá định kỳ giáo viên',
    isTemplate: true,
    steps: [
      { id: 's1', type: 'form_input', name: 'Tự đánh giá', assigneeRole: 'teacher' },
      { id: 's2', type: 'review', name: 'Đánh giá của Trưởng bộ môn', assigneeRole: 'dept_head' },
      { id: 's3', type: 'approval', name: 'Xác nhận', assigneeRole: 'principal' },
    ],
  },
  {
    slug: 'meeting-approval',
    name: 'Phê duyệt họp',
    module: 'general',
    description: 'Quy trình tổ chức cuộc họp',
    isTemplate: true,
    steps: [
      { id: 's1', type: 'form_input', name: 'Đề xuất họp' },
      { id: 's2', type: 'approval', name: 'Duyệt lịch họp', assigneeRole: 'principal' },
      { id: 's3', type: 'notification', name: 'Thông báo cho người tham dự' },
    ],
  },
  {
    slug: 'purchase-request',
    name: 'Đề xuất mua sắm',
    module: 'general',
    description: 'Quy trình duyệt mua sắm thiết bị vật tư',
    isTemplate: true,
    steps: [
      { id: 's1', type: 'form_input', name: 'Điền phiếu đề xuất' },
      { id: 's2', type: 'approval', name: 'Duyệt cấp Trưởng bộ phận', assigneeRole: 'dept_head' },
      { id: 's3', type: 'approval', name: 'Duyệt cấp BGH', assigneeRole: 'principal' },
      { id: 's4', type: 'auto', name: 'Ghi nhận ngân sách', autoAction: 'log_expense' },
    ],
  },
  {
    slug: 'exam-organization',
    name: 'Tổ chức kỳ thi',
    module: 'content',
    description: 'Quy trình chuẩn bị và tổ chức kỳ kiểm tra',
    isTemplate: true,
    steps: [
      { id: 's1', type: 'form_input', name: 'Lên kế hoạch thi' },
      { id: 's2', type: 'review', name: 'Review đề thi', assigneeRole: 'qa' },
      { id: 's3', type: 'approval', name: 'Phê duyệt đề thi', assigneeRole: 'academic_director' },
      { id: 's4', type: 'notification', name: 'Thông báo lịch thi' },
    ],
  },
]

// ── Main ───────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🌱 Seeding workflow templates...\n')

  let created = 0
  let updated = 0

  for (const tpl of TEMPLATES) {
    const existing = await prisma.workflowDef.findUnique({ where: { slug: tpl.slug } })

    if (existing) {
      await prisma.workflowDef.update({
        where: { slug: tpl.slug },
        data: {
          name: tpl.name,
          module: tpl.module,
          description: tpl.description,
          isTemplate: tpl.isTemplate,
          steps: tpl.steps as any,
          isActive: true,
        },
      })
      console.log(`  ✏️  Updated: ${tpl.name} (${tpl.slug})`)
      updated++
    } else {
      await prisma.workflowDef.create({
        data: {
          slug: tpl.slug,
          name: tpl.name,
          module: tpl.module,
          description: tpl.description,
          isTemplate: tpl.isTemplate,
          steps: tpl.steps as any,
          isActive: true,
        },
      })
      console.log(`  ✅ Created: ${tpl.name} (${tpl.slug})`)
      created++
    }
  }

  console.log(`\n🎉 Done! Created: ${created}, Updated: ${updated}`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

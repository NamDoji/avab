/**
 * Seed lesson plan materials for all programming courses + fix English
 */
const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')
const p = new PrismaClient()

const COURSES = [
  {
    code: 'ENGLISH-STARTER',
    folder: 'content/english',
    pattern: /^topic-(\d+)-(.+)\.md$/,
  },
  {
    code: 'CODING-KIDS-ALGO',
    folder: 'content/algorithm',
    pattern: /^topic-(\d+)-(.+)\.md$/,
  },
  {
    code: 'SCRATCH-KIDS',
    folder: 'content/scratch',
    pattern: /^topic-(\d+)-(.+)\.md$/,
  },
  {
    code: 'PYTHON-BASIC',
    folder: 'content/python',
    pattern: /^topic-(\d+)-(.+)\.md$/,
  },
  {
    code: 'CPP-ALGO',
    folder: 'content/cpp',
    pattern: /^topic-(\d+)-(.+)\.md$/,
  },
]

async function main() {
  const ROOT = path.resolve(__dirname, '..')
  console.log('🌱 Seeding lesson plan materials...\n')

  for (const courseConf of COURSES) {
    const course = await p.course.findUnique({
      where: { code: courseConf.code },
      include: { subjects: { orderBy: { order: 'asc' } } },
    })
    if (!course) { console.log(`❌ Not found: ${courseConf.code}`); continue }

    const folder = path.join(ROOT, courseConf.folder)
    if (!fs.existsSync(folder)) { console.log(`⚠️  Folder missing: ${folder}`); continue }

    const files = fs.readdirSync(folder)
      .filter(f => courseConf.pattern.test(f))
      .sort()

    let added = 0
    for (const file of files) {
      const match = file.match(courseConf.pattern)
      if (!match) continue
      const order = parseInt(match[1])
      const subject = course.subjects.find(s => s.order === order)
      if (!subject) continue

      // Skip if already has THEORY material
      const existing = await p.subjectMaterial.findFirst({
        where: { subjectId: subject.id, type: 'THEORY' },
      })
      if (existing) continue

      const content = fs.readFileSync(path.join(folder, file), 'utf8')
      const docxPath = path.join(courseConf.folder, 'docx', file.replace('.md', '.docx'))

      await p.subjectMaterial.create({
        data: {
          subjectId: subject.id,
          type: 'THEORY',
          title: `📚 Bài giảng — ${subject.name}`,
          fileUrl: `/${docxPath}`,
          content: content.slice(0, 5000), // Lưu 5000 ký tự đầu
          fileName: file.replace('.md', '.docx'),
        },
      })
      added++
    }
    console.log(`✅ ${courseConf.code}: +${added} materials (${course.subjects.length} subjects)`)
  }

  console.log('\n✅ All done!')
}

main()
  .catch(e => { console.error(e.message); process.exit(1) })
  .finally(() => p.$disconnect())

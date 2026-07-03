/**
 * Seed Khóa học Toán Tư Duy Lớp 2 — 35 chuyên đề
 * Đọc từ /workspace/teaching/toan-tu-duy-lop2/ và import vào avab DB
 */

import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

const CONTENT_DIR = path.join(__dirname, '../../../teaching/toan-tu-duy-lop2')

// 35 chuyên đề mapping
const CHUYEN_DE = [
  { n: 1,  name: 'Số - Chữ số',                    icon: '🔢', file: 'btvn-CD1-so-chu-so.md' },
  { n: 2,  name: 'Phép cộng nâng cao',              icon: '➕', file: 'btvn-CD2-phep-cong-nang-cao.md' },
  { n: 3,  name: 'Phép trừ nâng cao',               icon: '➖', file: 'btvn-CD3-phep-tru-nang-cao.md' },
  { n: 4,  name: 'Phép nhân',                        icon: '✖️', file: 'btvn-CD4-phep-nhan.md' },
  { n: 5,  name: 'Quy luật dãy số',                 icon: '📈', file: 'btvn-CD5-quy-luat-day-so.md' },
  { n: 6,  name: 'Vẽ sơ đồ đoạn thẳng',            icon: '📊', file: 'btvn-CD6-ve-so-do-doan-thang.md' },
  { n: 7,  name: 'Bài toán Trồng cây',              icon: '🌳', file: 'btvn-CD7-trong-cay-hang-cay.md' },
  { n: 8,  name: 'Bài toán Tuổi',                   icon: '🎂', file: 'btvn-CD8-bai-toan-tuoi.md' },
  { n: 9,  name: 'Tính ngược',                      icon: '🔄', file: 'btvn-CD9-tinh-nguoc-tim-so-ban-dau.md' },
  { n: 10, name: 'Có lời văn tổng hợp',             icon: '📝', file: 'btvn-CD10-bai-toan-co-loi-van-tong-hop.md' },
  { n: 11, name: 'So sánh - Thay thế',              icon: '⚖️', file: 'btvn-CD11-so-sanh-thay-the.md' },
  { n: 12, name: 'Nhiều hơn - Ít hơn',              icon: '📏', file: 'btvn-CD12-nhieu-hon-it-hon.md' },
  { n: 13, name: 'Lập danh sách - Kẻ bảng',        icon: '📋', file: 'btvn-CD13-lap-danh-sach-ke-bang.md' },
  { n: 14, name: 'Bài toán Logic',                  icon: '🧠', file: 'btvn-CD14-bai-toan-logic.md' },
  { n: 15, name: 'Tìm chuỗi (Dãy hình, màu, chữ)', icon: '🔍', file: 'btvn-CD15-tim-chuoi.md' },
  { n: 16, name: 'Bài toán Gà - Thỏ',              icon: '🐔', file: 'btvn-CD16-ga-tho.md' },
  { n: 17, name: 'Số chẵn - Số lẻ',                icon: '🔀', file: 'btvn-CD17-so-chan-so-le.md' },
  { n: 18, name: 'Xếp hàng',                       icon: '👥', file: 'btvn-CD18-xep-hang.md' },
  { n: 19, name: 'Đếm hình có quy luật',           icon: '🔷', file: 'btvn-CD19-dem-hinh.md' },
  { n: 20, name: 'Nguyên lý chim bồ câu',          icon: '🕊️', file: 'btvn-CD20-nguyen-ly-chim-bo-cau.md' },
  { n: 21, name: 'Hình học tư duy (IQ)',            icon: '🧩', file: 'btvn-CD21-hinh-hoc-tu-duy.md' },
  { n: 22, name: 'Bài toán Trang sách',             icon: '📖', file: 'btvn-CD22-trang-sach.md' },
  { n: 23, name: 'Đếm cách đi',                    icon: '🗺️', file: 'btvn-CD23-dem-cach-di.md' },
  { n: 24, name: 'Biểu đồ Venn',                   icon: '⭕', file: 'btvn-CD24-bieu-do-venn.md' },
  { n: 25, name: 'Phép chia có dư',                icon: '➗', file: 'btvn-CD25-phep-chia-co-du.md' },
  { n: 26, name: 'Thứ trong tuần - Lịch',          icon: '📅', file: 'btvn-CD26-thu-trong-tuan-lich.md' },
  { n: 27, name: 'Chữ số tận cùng',                icon: '0️⃣', file: 'btvn-CD27-chu-so-tan-cung.md' },
  { n: 28, name: 'Sắp xếp - Hoán vị',             icon: '🔃', file: 'btvn-CD28-sap-xep-hoan-vi.md' },
  { n: 29, name: 'Chu vi - Diện tích hình học',   icon: '📐', file: 'btvn-CD29-chu-vi-dien-tich.md' },
  { n: 30, name: 'Đồng hồ - Thời gian',            icon: '🕐', file: 'btvn-CD30-dong-ho-thoi-gian.md' },
  { n: 31, name: 'Chuyển động đơn giản',           icon: '🚀', file: 'btvn-CD31-chuyen-dong-don-gian.md' },
  { n: 32, name: 'Bảng số - Ma trận số',           icon: '🔲', file: 'btvn-CD32-bang-so-ma-tran.md' },
  { n: 33, name: 'Tam giác số - Hình số',          icon: '🔺', file: 'btvn-CD33-tam-giac-so-hinh-so.md' },
  { n: 34, name: 'Mã hóa (Chữ = Số)',              icon: '🔐', file: 'btvn-CD34-ma-hoa-chu-so.md' },
  { n: 35, name: 'Tổng hợp HSG - Toán tư duy đỉnh', icon: '🏆', file: 'btvn-CD35-tong-hop-hsg-dinh.md' },
]

interface ParsedQuestion {
  order: number
  questionType: string
  content: string
  options: any
  correctAnswer: string
  explanation: string
  points: number
}

function parseQuestions(markdown: string): ParsedQuestion[] {
  const questions: ParsedQuestion[] = []
  
  // Split by câu hỏi pattern
  const blocks = markdown.split(/(?=\*\*Câu \d+\.?\*\*)/)
  
  for (const block of blocks) {
    const numMatch = block.match(/\*\*Câu (\d+)\.?\*\*/)
    if (!numMatch) continue
    
    const order = parseInt(numMatch[1])
    
    // Detect type
    let questionType = 'OPEN'
    if (/\*Trắc nghiệm\*/i.test(block)) questionType = 'MULTIPLE_CHOICE'
    else if (/\*Điền số\*|\*Điền vào\*|\*Tính\*|\*Tìm\*/i.test(block)) questionType = 'SHORT_ANSWER'
    else if (/\*Đúng\/Sai\*|\*Đúng - Sai\*/i.test(block)) questionType = 'TRUE_FALSE'
    else if (/\*Tự luận\*/i.test(block)) questionType = 'OPEN'
    else if (/\*Nối\*|\*Ghép\*/i.test(block)) questionType = 'MATCHING'
    
    // Extract question content (before options/answer)
    const contentMatch = block.match(/\*\*Câu \d+\.?\*\*[^\n]*\n([\s\S]*?)(?=\*\*A\.\*\*|>\s*✅|\n\n---)/i)
    let content = contentMatch ? contentMatch[1].trim() : block.split('\n').slice(1, 4).join('\n').trim()
    // Clean up markdown
    content = content.replace(/\*\(.*?\)\*/g, '').replace(/^\s+|\s+$/g, '').trim()
    if (!content) continue

    // Full block for content (include type line)  
    const typeLineMatch = block.match(/\*\*Câu \d+\.?\*\* \*\(.*?\)\* ([\s\S]*?)(?=\n\*\*A\.\*\*|>\s*✅|\n\n---)/i)
    if (typeLineMatch) content = typeLineMatch[1].trim()

    // Extract options for MC
    let options: any = null
    if (questionType === 'MULTIPLE_CHOICE') {
      const optMatches = [...block.matchAll(/\*\*([A-D])\.\*\*\s*([^\n*]+)/g)]
      if (optMatches.length >= 2) {
        options = optMatches.map(m => ({ key: m[1], text: m[2].trim().replace(/&nbsp;/g, ' ').trim() }))
      }
    }

    // Extract correct answer
    let correctAnswer = ''
    let explanation = ''
    
    const answerMatch = block.match(/>\s*✅\s*\*\*Đáp án:?\s*(.*?)\*\*/i)
    if (answerMatch) {
      correctAnswer = answerMatch[1].trim()
      // For MC, extract just the letter
      const letterMatch = correctAnswer.match(/^([A-D])\./i)
      if (letterMatch && questionType === 'MULTIPLE_CHOICE') {
        correctAnswer = letterMatch[1]
      }
    }
    
    const explMatch = block.match(/>\s*\*Giải:?\*\s*([\s\S]*?)(?=\n---|\n\*\*Câu|\n##|$)/i)
    if (explMatch) explanation = explMatch[1].trim().replace(/\n>/g, '\n').trim()

    // Points based on difficulty
    let points = 1
    if (order >= 11 && order <= 20) points = 2
    if (order >= 21) points = 3

    questions.push({
      order,
      questionType,
      content: content.slice(0, 1000),
      options,
      correctAnswer: correctAnswer.slice(0, 500) || 'Xem đáp án',
      explanation: explanation.slice(0, 1000),
      points,
    })
  }
  
  return questions.filter(q => q.content.length > 5).slice(0, 30)
}

async function main() {
  console.log('🚀 Bắt đầu seed Toán Tư Duy Lớp 2...\n')

  // Tạo hoặc lấy course
  let course = await prisma.course.findFirst({ where: { code: 'TOAN-TD-LOP2' } })
  if (!course) {
    course = await prisma.course.create({
      data: {
        code: 'TOAN-TD-LOP2',
        name: 'Toán Tư Duy Lớp 2 — 35 Chuyên đề (Dành cho HSG)',
        description: 'Khóa học Toán Tư Duy toàn diện cho học sinh lớp 2. Từ cơ bản đến nâng cao, bao gồm 35 chuyên đề đa dạng, bài tập phong phú, chuẩn bị cho các kỳ thi IMC, MIMO, IMAS, SASMO.',
        courseType: 'TOAN',
        grade: '2',
        isActive: true,
        price: 0,
      }
    })
    console.log(`✅ Tạo course: ${course.name}`)
  } else {
    console.log(`ℹ️  Course đã tồn tại: ${course.name}`)
  }

  let totalSubjects = 0, totalQuestions = 0

  for (const cd of CHUYEN_DE) {
    const filePath = path.join(CONTENT_DIR, cd.file)
    if (!fs.existsSync(filePath)) {
      // Try alternative names
      const files = fs.readdirSync(CONTENT_DIR).filter(f => f.includes(`CD${cd.n}-`) && f.startsWith('btvn'))
      if (files.length === 0) {
        console.log(`⚠️  Không tìm thấy file: ${cd.file}`)
        continue
      }
      cd.file = files[0]
    }

    const actualPath = path.join(CONTENT_DIR, cd.file)
    if (!fs.existsSync(actualPath)) {
      console.log(`⚠️  Bỏ qua: ${cd.file}`)
      continue
    }

    // Tạo subject
    let subject = await prisma.subject.findFirst({
      where: { courseId: course.id, name: `CD${cd.n}: ${cd.name}` }
    })
    if (!subject) {
      subject = await prisma.subject.create({
        data: {
          courseId: course.id,
          name: `CD${cd.n}: ${cd.name}`,
          icon: cd.icon,
          order: cd.n,
          isActive: true,
          description: `Chuyên đề ${cd.n}: ${cd.name} — 30 bài tập (10 dễ + 10 khá + 10 khó HSG)`,
        }
      })
    }

    // Parse questions
    const markdown = fs.readFileSync(actualPath, 'utf-8')
    const questions = parseQuestions(markdown)
    
    // Xoá câu hỏi cũ nếu có
    await prisma.question.deleteMany({ where: { subjectId: subject.id } })

    // Tạo câu hỏi
    let qCount = 0
    for (const q of questions) {
      await prisma.question.create({
        data: {
          subjectId: subject.id,
          order: q.order,
          questionType: q.questionType,
          content: q.content,
          options: q.options ?? undefined,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation || undefined,
          points: q.points,
        }
      })
      qCount++
    }

    totalSubjects++
    totalQuestions += qCount
    console.log(`  CD${cd.n.toString().padStart(2,'0')} ${cd.icon} ${cd.name}: ${qCount} câu hỏi`)
  }

  console.log(`\n✅ Hoàn thành!`)
  console.log(`   📚 ${totalSubjects} chuyên đề`)
  console.log(`   ❓ ${totalQuestions} câu hỏi`)
  console.log(`   🌐 Khóa học ID: ${course.id}`)

  await prisma.$disconnect()
}

main().catch(e => { console.error(e); prisma.$disconnect(); process.exit(1) })

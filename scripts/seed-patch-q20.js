const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()

// One extra question per topic (order 2-12) to reach 20
const EXTRA = [
  {
    order: 2,
    topicName: 'Thứ Tự Thực Hiện',
    q: {
      type: 'MULTIPLE_CHOICE',
      content: '🌟 Điều gì xảy ra nếu bạn làm các bước theo đúng thứ tự trong lập trình?',
      options: [{ key: 'A', text: 'Không có gì thay đổi' }, { key: 'B', text: 'Chương trình chạy đúng và cho kết quả mong muốn' }, { key: 'C', text: 'Chương trình chạy nhanh hơn' }, { key: 'D', text: 'Máy tính tự sửa lỗi' }],
      answer: 'B',
      explanation: 'Thứ tự đúng → kết quả đúng! Đây là lý do Sequence (thứ tự) là nền tảng của mọi chương trình.'
    }
  },
  {
    order: 3,
    topicName: 'Đi Trong Mê Cung',
    q: {
      type: 'MULTIPLE_CHOICE',
      content: '🧠 Kỹ năng giải mê cung giúp bạn trở thành gì trong lập trình?',
      options: [{ key: 'A', text: 'Người vẽ đẹp' }, { key: 'B', text: 'Người tư duy thuật toán tìm đường' }, { key: 'C', text: 'Người chơi game giỏi' }, { key: 'D', text: 'Người học giỏi văn' }],
      answer: 'B',
      explanation: 'Giải mê cung rèn luyện tư duy thuật toán tìm đường — kỹ năng quan trọng trong lập trình!'
    }
  },
  {
    order: 4,
    topicName: 'Lặp Lại',
    q: {
      type: 'MULTIPLE_CHOICE',
      content: '🌟 Ứng dụng thực tế nào trong điện thoại dùng vòng lặp?',
      options: [{ key: 'A', text: 'Danh bạ điện thoại' }, { key: 'B', text: 'Nhạc chuông lặp lại cho đến khi bắt máy' }, { key: 'C', text: 'Màu sắc màn hình' }, { key: 'D', text: 'Tên điện thoại' }],
      answer: 'B',
      explanation: 'Nhạc chuông lặp lại mãi cho đến khi có người bắt máy là ví dụ vòng lặp thực tế trong điện thoại!'
    }
  },
  {
    order: 5,
    topicName: 'Điều Kiện',
    q: {
      type: 'MULTIPLE_CHOICE',
      content: '🌟 Câu lệnh điều kiện trong cuộc sống thực tế nào hay nhất?',
      options: [{ key: 'A', text: 'Luôn luôn ăn kẹo' }, { key: 'B', text: 'Nếu đèn đỏ thì dừng xe, nếu đèn xanh thì đi' }, { key: 'C', text: 'Luôn ngủ' }, { key: 'D', text: 'Chạy mọi lúc' }],
      answer: 'B',
      explanation: 'Đèn giao thông là ví dụ điều kiện If/Else hoàn hảo và rất quen thuộc trong cuộc sống!'
    }
  },
  {
    order: 6,
    topicName: 'So Sánh',
    q: {
      type: 'MULTIPLE_CHOICE',
      content: '🌟 Khi mua hàng online, website so sánh giá như thế nào?',
      options: [{ key: 'A', text: 'Đoán giá ngẫu nhiên' }, { key: 'B', text: 'So sánh giá từ nhiều shop và hiển thị giá thấp nhất' }, { key: 'C', text: 'Không so sánh' }, { key: 'D', text: 'Hỏi người bán' }],
      answer: 'B',
      explanation: 'Website so sánh giá dùng thuật toán so sánh để tìm và hiển thị giá tốt nhất cho bạn!'
    }
  },
  {
    order: 7,
    topicName: 'Quy Luật',
    q: {
      type: 'MULTIPLE_CHOICE',
      content: '🌟 Máy tính học AI nhận ra khuôn mặt nhờ điều gì?',
      options: [{ key: 'A', text: 'Màu da ngẫu nhiên' }, { key: 'B', text: 'Tìm quy luật về đặc điểm khuôn mặt từ hàng triệu ảnh' }, { key: 'C', text: 'Đoán mò' }, { key: 'D', text: 'Hỏi người dùng' }],
      answer: 'B',
      explanation: 'AI nhận diện khuôn mặt bằng cách tìm ra quy luật chung từ hàng triệu bức ảnh học. Quy luật là nền tảng của AI!'
    }
  },
  {
    order: 8,
    topicName: 'Phân Loại',
    q: {
      type: 'MULTIPLE_CHOICE',
      content: '🌟 Khi bạn lưu ảnh vào "Album Gia Đình" và "Album Du Lịch", bạn đang làm gì?',
      options: [{ key: 'A', text: 'Xóa ảnh' }, { key: 'B', text: 'Phân loại ảnh theo chủ đề' }, { key: 'C', text: 'Chụp thêm ảnh' }, { key: 'D', text: 'Chia sẻ ảnh' }],
      answer: 'B',
      explanation: 'Bạn đang phân loại ảnh theo chủ đề giúp tìm lại dễ hơn về sau. Phân loại trong cuộc sống thực!'
    }
  },
  {
    order: 9,
    topicName: 'Tối Ưu',
    q: {
      type: 'MULTIPLE_CHOICE',
      content: '🌟 Khi học bài, cách nào TỐI ƯU thời gian nhất?',
      options: [{ key: 'A', text: 'Đọc lướt nhanh rồi quên' }, { key: 'B', text: 'Học có kế hoạch: đọc hiểu → làm bài tập → ôn lại' }, { key: 'C', text: 'Chép nguyên xi không hiểu' }, { key: 'D', text: 'Học ngay trước khi thi' }],
      answer: 'B',
      explanation: 'Học có kế hoạch và phương pháp rõ ràng giúp hiểu và nhớ lâu hơn — đây là tối ưu việc học!'
    }
  },
  {
    order: 10,
    topicName: 'Gỡ Lỗi',
    q: {
      type: 'MULTIPLE_CHOICE',
      content: '🌟 Khi nấu ăn bị mặn quá, bạn gỡ lỗi bằng cách nào?',
      options: [{ key: 'A', text: 'Đổ thức ăn đi và làm lại' }, { key: 'B', text: 'Thêm nước hoặc nguyên liệu khác để cân bằng vị' }, { key: 'C', text: 'Ăn nguyên như vậy' }, { key: 'D', text: 'Không ăn nữa' }],
      answer: 'B',
      explanation: 'Thêm nước để giảm độ mặn là gỡ lỗi trong nấu ăn! Tìm nguyên nhân và sửa — tư duy debug áp dụng được mọi nơi!'
    }
  },
  {
    order: 11,
    topicName: 'Chia Bài Toán',
    q: {
      type: 'MULTIPLE_CHOICE',
      content: '🌟 Khi viết một câu chuyện dài, bạn nên bắt đầu như thế nào?',
      options: [{ key: 'A', text: 'Viết ngay từ đầu đến cuối' }, { key: 'B', text: 'Chia thành: dàn ý → từng đoạn → chi tiết → chỉnh sửa' }, { key: 'C', text: 'Chỉ viết kết thúc' }, { key: 'D', text: 'Không cần kế hoạch' }],
      answer: 'B',
      explanation: 'Chia câu chuyện thành phần nhỏ giúp viết có cấu trúc và không bị lạc đề — Decomposition trong viết văn!'
    }
  },
  {
    order: 12,
    topicName: 'Dự Án Tổng Kết',
    q: {
      type: 'MULTIPLE_CHOICE',
      content: '🚀 Bước tiếp theo sau khóa học này là gì?',
      options: [{ key: 'A', text: 'Quên tất cả những gì đã học' }, { key: 'B', text: 'Áp dụng tư duy thuật toán vào thực tế và tiếp tục học lập trình' }, { key: 'C', text: 'Chỉ ôn lại bài cũ' }, { key: 'D', text: 'Không làm gì' }],
      answer: 'B',
      explanation: 'Bước tiếp theo: áp dụng những gì đã học vào cuộc sống và tiếp tục khám phá thế giới lập trình! 🌟'
    }
  },
]

async function main() {
  const course = await p.course.findUnique({
    where: { code: 'CODING-KIDS-ALGO' },
    include: { subjects: { orderBy: { order: 'asc' } } }
  })

  for (const extra of EXTRA) {
    const subject = course.subjects.find(s => s.order === extra.order)
    if (!subject) continue

    const existing = await p.question.count({ where: { subjectId: subject.id } })
    if (existing >= 20) {
      console.log(`⏭️  ${extra.order}. ${extra.topicName}: already has ${existing} questions`)
      continue
    }

    await p.question.create({
      data: {
        subjectId: subject.id,
        order: existing + 1,
        questionType: extra.q.type,
        content: extra.q.content,
        options: extra.q.options,
        correctAnswer: extra.q.answer,
        explanation: extra.q.explanation,
        points: 1,
      }
    })
    console.log(`✅  ${extra.order}. ${extra.topicName}: added Q${existing + 1} → now ${existing + 1} questions`)
  }

  console.log('\n🎉 Patch done!')
}

main().catch(e => { console.error(e.message); process.exit(1) }).finally(() => p.$disconnect())

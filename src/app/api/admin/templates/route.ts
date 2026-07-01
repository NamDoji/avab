import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    success: true,
    data: [
      {
        name: 'Mẫu Bài Tập Về Nhà (BTVN)',
        filename: 'mau-bai-tap-ve-nha.docx',
        url: '/templates/mau-bai-tap-ve-nha.docx',
        description: 'File Word mẫu để soạn câu hỏi bài tập — hệ thống tự đọc cấu trúc khi upload',
        format: 'Câu [số]: [nội dung câu hỏi]',
      },
      {
        name: 'Mẫu Đáp Án',
        filename: 'mau-dap-an.docx',
        url: '/templates/mau-dap-an.docx',
        description: 'File Word mẫu để soạn đáp án — hệ thống tự đọc và chấm điểm tự động',
        format: 'Đáp án [số]: [kết quả]',
      },
    ],
  })
}

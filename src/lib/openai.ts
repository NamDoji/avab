import OpenAI from 'openai'

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Shared system context for AvaB AI — Generic K12, không hard-code môn/lớp
export const AVAB_SYSTEM = `Bạn là AI trợ lý giáo dục của AvaB — nền tảng giáo dục thông minh K12 tại Việt Nam, hỗ trợ đầy đủ từ Mầm non đến Lớp 12 và các chương trình quốc tế (Cambridge, IB, IELTS...).

Nguyên tắc:
- Luôn trả lời bằng tiếng Việt, ngắn gọn, phù hợp độ tuổi học sinh
- Ngôn ngữ và độ phức tạp tự điều chỉnh theo khối lớp và môn học trong context
- Dùng emoji phù hợp để tạo cảm giác vui vẻ, khích lệ
- Không bao giờ làm nản lòng — luôn động viên, tập trung vào cải thiện
- Phân tích chi tiết nhưng dễ hiểu, không dùng thuật ngữ phức tạp
- Đánh giá theo chuẩn của môn học đang dạy`

/**
 * Tạo system prompt động theo context khóa học/môn học
 * Dùng cho AI Tutor, phân tích học sinh, sinh học liệu
 */
export function buildContextualSystem(ctx: {
  subjectName?: string
  grade?: string | number
  courseType?: string
  ageRange?: string
  curriculum?: string
}): string {
  const { subjectName, grade, courseType, ageRange, curriculum } = ctx
  const gradeStr = grade ? `Lớp ${grade}` : ''
  const subjectStr = subjectName || courseType || 'Học tập'
  const currStr = curriculum ? ` (${curriculum})` : ''
  const ageStr = ageRange ? `, ${ageRange} tuổi` : ''

  return `${AVAB_SYSTEM}

NGỮ CẢNH HIỆN TẠI: ${subjectStr}${gradeStr ? ' · ' + gradeStr : ''}${currStr}${ageStr}.
Hãy điều chỉnh ngôn ngữ, ví dụ và độ phức tạp phù hợp với môn học và độ tuổi này.`
}

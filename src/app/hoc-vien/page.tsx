import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { BookOpen, Trophy, CheckCircle, XCircle, AlertCircle, Zap } from 'lucide-react'
import Link from 'next/link'
import { AIDashboard } from '@/components/ai/AIDashboard'

type CourseType = 'TOAN' | 'TIENG_ANH' | 'LAP_TRINH_THUAT_TOAN' | 'LAP_TRINH_SCRATCH' | 'LAP_TRINH_PYTHON' | 'LAP_TRINH_CPP'

const COURSE_TYPE_META: Record<string, { emoji: string; label: string; gradient: string }> = {
  // Legacy
  TOAN:                 { emoji: '📐', label: 'Toán',             gradient: 'from-purple-500 to-indigo-600' },
  TIENG_ANH:            { emoji: '🇬🇧', label: 'Tiếng Anh',       gradient: 'from-green-400 to-teal-600' },
  LAP_TRINH_THUAT_TOAN: { emoji: '🤖', label: 'Lập trình tư duy', gradient: 'from-yellow-400 to-orange-500' },
  LAP_TRINH_SCRATCH:    { emoji: '🐱', label: 'Scratch',          gradient: 'from-orange-400 to-pink-500' },
  LAP_TRINH_PYTHON:     { emoji: '🐍', label: 'Python',           gradient: 'from-teal-400 to-cyan-600' },
  LAP_TRINH_CPP:        { emoji: '⚡', label: 'C++',              gradient: 'from-violet-500 to-purple-700' },
  // K12 generic
  THINKING_MATH: { emoji: '🧠', label: 'Toán Tư Duy',  gradient: 'from-purple-500 to-indigo-600' },
  MATH:          { emoji: '📐', label: 'Toán',          gradient: 'from-blue-500 to-indigo-600' },
  VIETNAMESE:    { emoji: '📖', label: 'Tiếng Việt',   gradient: 'from-red-500 to-orange-500' },
  ENGLISH:       { emoji: '🇬🇧', label: 'Tiếng Anh',   gradient: 'from-green-400 to-teal-600' },
  SCIENCE:       { emoji: '🔬', label: 'Khoa học',     gradient: 'from-cyan-500 to-teal-600' },
  PHYSICS:       { emoji: '⚛️', label: 'Vật lý',       gradient: 'from-violet-500 to-indigo-700' },
  CHEMISTRY:     { emoji: '🧪', label: 'Hóa học',      gradient: 'from-lime-500 to-green-600' },
  BIOLOGY:       { emoji: '🧬', label: 'Sinh học',     gradient: 'from-emerald-500 to-teal-600' },
  HISTORY:       { emoji: '🏰', label: 'Lịch sử',      gradient: 'from-amber-500 to-orange-600' },
  GEOGRAPHY:     { emoji: '🌍', label: 'Địa lý',       gradient: 'from-emerald-400 to-cyan-600' },
  INFORMATICS:   { emoji: '💻', label: 'Tin học',      gradient: 'from-sky-500 to-blue-600' },
  CIVIC:         { emoji: '⚖️', label: 'GDCD',         gradient: 'from-indigo-500 to-blue-600' },
  ALGO:          { emoji: '🤖', label: 'Thuật toán',   gradient: 'from-yellow-400 to-orange-500' },
  SCRATCH:       { emoji: '🐱', label: 'Scratch',      gradient: 'from-orange-400 to-pink-500' },
  PYTHON:        { emoji: '🐍', label: 'Python',       gradient: 'from-teal-400 to-cyan-600' },
  CPP:           { emoji: '⚡', label: 'C++',           gradient: 'from-violet-500 to-purple-700' },
  IELTS:         { emoji: '📝', label: 'IELTS',        gradient: 'from-sky-500 to-blue-600' },
  CAMBRIDGE:     { emoji: '🎓', label: 'Cambridge',    gradient: 'from-rose-500 to-pink-600' },
  GENERAL:       { emoji: '📚', label: 'Tổng hợp',     gradient: 'from-gray-500 to-slate-600' },
}

async function getStudentData(userId: string) {
  const [enrollments, answers, sessionRecords] = await Promise.all([
    prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            code: true,
            courseType: true,
            subjectCode: true,
            thumbnail: true,
            _count: { select: { subjects: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.studentAnswer.findMany({
      where: { userId },
      select: { score: true, isCorrect: true, subjectId: true },
    }),
    // Nhận xét buổi học từ giáo viên
    prisma.studentSessionRecord.findMany({
      where: { userId, aiComment: { not: null } },
      include: {
        feedback: {
          include: {
            subject: {
              select: {
                id: true,
                name: true,
                icon: true,
                course: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
      orderBy: { feedback: { sessionDate: 'desc' } },
      take: 20,
    }),
  ])

  const totalScore = answers.reduce((sum, a) => sum + a.score, 0)
  const correctAnswers = answers.filter((a) => a.isCorrect).length
  const totalAnswers = answers.length

  return { enrollments, totalScore, correctAnswers, totalAnswers, sessionRecords }
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { icon: any; label: string; classes: string }> = {
    ACTIVE:   { icon: CheckCircle,   label: 'Đang học',   classes: 'bg-green-50 text-green-700 border-green-200' },
    APPROVED: { icon: CheckCircle,   label: 'Đang học',   classes: 'bg-green-50 text-green-700 border-green-200' },
    PENDING:  { icon: AlertCircle,   label: 'Chờ duyệt', classes: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    PAUSED:   { icon: AlertCircle,   label: 'Tạm nghỉ',  classes: 'bg-orange-50 text-orange-600 border-orange-200' },
    EXPIRED:  { icon: XCircle,       label: 'Hết hạn',   classes: 'bg-gray-100 text-gray-500 border-gray-200' },
    REJECTED: { icon: XCircle,       label: 'Từ chối',   classes: 'bg-red-50 text-red-700 border-red-200' },
    REMOVED:  { icon: XCircle,       label: 'Đã xóa',     classes: 'bg-gray-100 text-gray-400 border-gray-200' },
  }
  const cfg = config[status] ?? config.PENDING
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.classes}`}>
      <Icon className="w-3.5 h-3.5" />
      {cfg.label}
    </span>
  )
}

// Star rating based on score percentage
function ScoreStars({ pct }: { pct: number }) {
  const stars = pct >= 90 ? 3 : pct >= 70 ? 2 : pct >= 50 ? 1 : 0
  return (
    <div className="flex gap-0.5">
      {[1,2,3].map(s => (
        <span key={s} className={`text-sm ${s <= stars ? 'text-yellow-400' : 'text-gray-200'}`}>⭐</span>
      ))}
    </div>
  )
}

export default async function HocVienPage() {
  const session = await auth()
  if (!session?.user) redirect('/dang-nhap')

  const userId = (session.user as any).id as string
  const { enrollments, totalScore, correctAnswers, totalAnswers, sessionRecords } = await getStudentData(userId)

  const approvedEnrollments = enrollments.filter((e) => ['ACTIVE', 'APPROVED'].includes(e.status))
  const accuracy = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0

  // Star rating for overall accuracy
  const globalStars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : accuracy >= 50 ? 1 : 0

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-50 to-gray-50 pt-20">
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Hero welcome card */}
        <div className="relative bg-gradient-to-br from-purple-600 via-indigo-600 to-teal-600 rounded-3xl p-7 text-white mb-8 overflow-hidden">
          {/* Decorative background circles */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
          <div className="absolute bottom-0 left-20 w-24 h-24 bg-white/10 rounded-full translate-y-8" />

          <div className="relative flex items-start justify-between gap-4">
            <div>
              <p className="text-white/70 text-sm font-semibold mb-1">Bảng điều khiển học viên</p>
              <h1 className="text-2xl md:text-3xl font-black mb-3">
                Xin chào, {session.user.name ?? 'Học viên'}! 👋
              </h1>
              <p className="text-white/80">
                {approvedEnrollments.length > 0
                  ? `Bạn đang học ${approvedEnrollments.length} khoá học. Cố lên nào! 💪`
                  : 'Đăng ký khoá học để bắt đầu hành trình học tập nhé!'}
              </p>
            </div>
            {/* Big emoji based on accuracy */}
            <div className="text-5xl shrink-0 hidden md:block">
              {accuracy >= 90 ? '🏆' : accuracy >= 70 ? '🌟' : accuracy >= 50 ? '📚' : '🎯'}
            </div>
          </div>

          {/* Overall stats inline */}
          {totalAnswers > 0 && (
            <div className="relative mt-5 flex flex-wrap gap-4">
              <div className="bg-white/20 backdrop-blur rounded-2xl px-4 py-2.5 text-center min-w-[80px]">
                <div className="text-2xl font-black">{totalScore}</div>
                <div className="text-white/70 text-xs">Tổng điểm</div>
              </div>
              <div className="bg-white/20 backdrop-blur rounded-2xl px-4 py-2.5 text-center min-w-[80px]">
                <div className="text-2xl font-black">{accuracy}%</div>
                <div className="text-white/70 text-xs">Chính xác</div>
              </div>
              <div className="bg-white/20 backdrop-blur rounded-2xl px-4 py-2.5 text-center min-w-[80px]">
                <div className="text-2xl font-black">{correctAnswers}</div>
                <div className="text-white/70 text-xs">Câu đúng</div>
              </div>
              <div className="bg-white/20 backdrop-blur rounded-2xl px-4 py-2.5 flex items-center gap-1.5">
                {[1,2,3].map(s => (
                  <span key={s} className={`text-xl ${s <= globalStars ? 'text-yellow-300' : 'text-white/20'}`}>⭐</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Enrolled courses */}
        <div className="bg-white rounded-3xl shadow-sm p-6 mb-6 border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-600" />
              Khoá học của tôi
            </h2>
            <Link href="/khoa-hoc" className="text-sm font-semibold text-purple-600 hover:text-purple-700">
              + Thêm khoá học
            </Link>
          </div>

          {enrollments.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎓</div>
              <p className="text-gray-500 font-semibold mb-2">Chưa có khoá học nào</p>
              <p className="text-gray-400 text-sm mb-5">Đăng ký khoá học để bắt đầu học tập!</p>
              <Link href="/khoa-hoc" className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-2xl font-black text-sm transition">
                📚 Xem khoá học ngay
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {enrollments.map((enrollment) => {
                const subjectCode = (enrollment.course as any).subjectCode as string | null
                const cType = ((enrollment.course as any).courseType as CourseType) ?? 'TOAN'
                const meta = (subjectCode && COURSE_TYPE_META[subjectCode]) ? COURSE_TYPE_META[subjectCode] : (COURSE_TYPE_META[cType] ?? COURSE_TYPE_META.TOAN)
                return (
                  <div key={enrollment.id} className="relative rounded-2xl border-2 border-gray-100 overflow-hidden hover:border-purple-200 transition group">
                    {/* Color strip top */}
                    <div className={`h-1.5 bg-gradient-to-r ${meta.gradient}`} />
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center text-xl shadow-sm shrink-0`}>
                            {meta.emoji}
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400 font-mono">{enrollment.course.code}</p>
                            <h3 className="font-black text-gray-800 text-sm leading-snug line-clamp-2">
                              {enrollment.course.name}
                            </h3>
                          </div>
                        </div>
                        <StatusBadge status={enrollment.status} />
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">{enrollment.course._count.subjects} chuyên đề</span>
                        {['ACTIVE', 'APPROVED'].includes(enrollment.status) ? (
                          <Link href={`/khoa-hoc/${enrollment.course.id}`}
                            className={`text-xs font-black px-3 py-1.5 rounded-full bg-gradient-to-r ${meta.gradient} text-white hover:opacity-90 transition`}>
                            Vào học →
                          </Link>
                        ) : enrollment.status === 'PENDING' ? (
                          <span className="text-xs text-amber-600 font-semibold">⏳ Chờ duyệt</span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Nhận xét của giáo viên theo từng buổi học */}
        {sessionRecords.length > 0 && (
          <div className="bg-white rounded-3xl shadow-sm p-6 mb-6 border border-gray-100">
            <div className="flex items-center gap-2 mb-5">
              <span className="text-2xl">📋</span>
              <div>
                <h2 className="text-xl font-black text-gray-900">Nhận xét của giáo viên</h2>
                <p className="text-xs text-gray-400">Cập nhật sau mỗi buổi học — {sessionRecords.length} nhận xét</p>
              </div>
            </div>

            <div className="space-y-4">
              {sessionRecords.map((record) => {
                const sessionDate = new Date(record.feedback.sessionDate)
                const subject = record.feedback.subject
                // Parse aiComment sections
                const lines = (record.aiComment ?? '').split('\n\n').filter(Boolean)
                const overview = lines.find(l => l.includes('Tổng quan'))?.replace(/\*\*/g, '').replace('📋 Tổng quan:', '').trim()
                const strengths = lines.find(l => l.includes('Điểm mạnh'))?.replace(/\*\*/g, '').replace('✨ Điểm mạnh:', '').trim()
                const parentNote = lines.find(l => l.includes('Gửi phụ huynh'))?.replace(/\*\*/g, '').replace('👨‍👩‍👧 Gửi phụ huynh:', '').trim()

                return (
                  <div key={record.id} className="border border-gray-100 rounded-2xl overflow-hidden">
                    {/* Session header */}
                    <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-gray-100">
                      <span className="text-xl shrink-0">{subject.icon ?? '📚'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-800 text-sm truncate">{subject.name}</p>
                        <p className="text-xs text-gray-400">{subject.course.name}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-semibold text-purple-600">
                          {sessionDate.toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric', month: 'numeric' })}
                        </p>
                        {record.hwScore !== null && (
                          <p className="text-xs text-gray-400">BTVN: {record.hwScore}%</p>
                        )}
                      </div>
                    </div>

                    {/* Comment content */}
                    <div className="px-4 py-4 space-y-3">
                      {/* Có mặt + Điểm nhanh */}
                      <div className="flex flex-wrap gap-2">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          record.attendance ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                        }`}>
                          {record.attendance ? '✅ Có mặt' : '❌ Vắng'}
                        </span>
                        {record.comprehension && (
                          <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-semibold">
                            📚 Hiểu bài: {['', '🔴', '🟠', '🟡', '🟢', '🌟'][record.comprehension]}/5
                          </span>
                        )}
                        {record.focusLevel && (
                          <span className="text-xs bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full font-semibold">
                            🧠 Tập trung: {record.focusLevel}/5
                          </span>
                        )}
                        {record.emotionState && (
                          <span className="text-xs bg-yellow-50 text-yellow-700 px-2.5 py-1 rounded-full font-semibold">
                            {record.emotionState === 'great' ? '🤩' : record.emotionState === 'good' ? '😊' : record.emotionState === 'neutral' ? '😐' : record.emotionState === 'tired' ? '😴' : '😤'}
                            {record.emotionState === 'great' ? ' Hứng khởi' : record.emotionState === 'good' ? ' Vui vẻ' : record.emotionState === 'neutral' ? ' Bình thường' : record.emotionState === 'tired' ? ' Mệt mỏi' : ' Chán'}
                          </span>
                        )}
                      </div>

                      {/* AI comment sections */}
                      {overview && (
                        <div className="bg-gray-50 rounded-xl px-3 py-2.5">
                          <p className="text-xs font-bold text-gray-500 mb-0.5">📋 Tổng quan</p>
                          <p className="text-sm text-gray-700 leading-relaxed">{overview}</p>
                        </div>
                      )}
                      {strengths && (
                        <div className="bg-teal-50 rounded-xl px-3 py-2.5">
                          <p className="text-xs font-bold text-teal-600 mb-0.5">✨ Điểm mạnh</p>
                          <p className="text-sm text-gray-700 leading-relaxed">{strengths}</p>
                        </div>
                      )}
                      {parentNote && (
                        <div className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5">
                          <p className="text-xs font-bold text-amber-600 mb-0.5">👨‍👩‍👧 Giáo viên gửi phụ huynh</p>
                          <p className="text-sm text-gray-700 leading-relaxed">{parentNote}</p>
                        </div>
                      )}
                      {/* Link xem đầy đủ */}
                      <details className="group">
                        <summary className="text-xs text-purple-600 font-semibold cursor-pointer hover:text-purple-700 list-none flex items-center gap-1">
                          <span className="group-open:hidden">▶ Xem nhận xét đầy đủ</span>
                          <span className="hidden group-open:inline">▼ Ẩn bớt</span>
                        </summary>
                        <div className="mt-2 bg-purple-50 rounded-xl px-3 py-3 text-xs text-gray-700 leading-relaxed whitespace-pre-line">
                          {record.aiComment}
                        </div>
                      </details>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* AI Dashboard */}
        <AIDashboard userId={userId} />

        {/* Quick Links — child-friendly big buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          {[
            { href: '/khoa-hoc',       label: 'Khám phá khoá học', emoji: '📚', gradient: 'from-purple-500 to-indigo-600' },
            { href: '/bang-vang',      label: 'Bảng xếp hạng',     emoji: '🏆', gradient: 'from-yellow-400 to-orange-500' },
            { href: '/tin-tuc',        label: 'Tin tức',            emoji: '📰', gradient: 'from-teal-400 to-cyan-600' },
            { href: '/doi-mat-khau',   label: 'Đổi mật khẩu',      emoji: '🔑', gradient: 'from-gray-500 to-gray-700' },
          ].map(({ href, label, emoji, gradient }) => (
            <Link key={href} href={href}
              className={`bg-gradient-to-br ${gradient} text-white rounded-2xl p-4 flex flex-col items-center gap-2 text-center hover:opacity-90 active:scale-95 transition`}>
              <span className="text-3xl">{emoji}</span>
              <span className="text-xs font-black leading-snug">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}

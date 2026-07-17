import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return new NextResponse('Unauthorized', { status: 401 })
  if ((session.user as any).role !== 'ADMIN') return new NextResponse('Forbidden', { status: 403 })

  const { id: quizSetId } = await params

  const quizSet = await prisma.quizSet.findUnique({
    where: { id: quizSetId },
    include: {
      subject: {
        include: { course: { select: { name: true } } },
      },
    },
  })
  if (!quizSet) return new NextResponse('Not found', { status: 404 })

  const subject = quizSet.subject
  if (!subject) return new NextResponse('Subject not found', { status: 404 })

  const enrollments = await prisma.enrollment.findMany({
    where: { courseId: subject.courseId, status: 'ACTIVE' },
    select: { userId: true },
  })
  const enrolledUserIds = enrollments.map(e => e.userId)

  const enrolledUsers = await prisma.user.findMany({
    where: { id: { in: enrolledUserIds } },
    select: { id: true, name: true },
  })

  const attempts = await prisma.quizAttempt.findMany({
    where: { quizSetId },
    select: { userId: true, score: true, maxScore: true, submittedAt: true },
    orderBy: [{ score: 'desc' }, { submittedAt: 'asc' }],
  })

  const attemptMap = new Map(attempts.map(a => [a.userId, a]))
  const maxScore = attempts[0]?.maxScore ?? 100

  const submitted = attempts
    .filter(a => enrolledUserIds.includes(a.userId))
    .map((a, idx) => {
      const user = enrolledUsers.find(u => u.id === a.userId)
      return {
        rank: idx + 1,
        name: user?.name ?? 'Học viên',
        score: a.score,
        maxScore: a.maxScore || maxScore,
        submittedAt: a.submittedAt
          ? new Date(a.submittedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
          : null,
        status: 'submitted' as const,
      }
    })

  const absent = enrolledUsers
    .filter(u => !attemptMap.has(u.id))
    .map(u => ({
      rank: 0,
      name: u.name ?? 'Học viên',
      score: null,
      maxScore,
      submittedAt: null,
      status: 'absent' as const,
    }))

  const leaderboard = [...submitted, ...absent]

  const medalIcon = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return String(rank)
  }

  const rankStyle = (rank: number, status: string) => {
    if (status === 'absent') return 'background:#fee2e2;color:#dc2626;'
    if (rank === 1) return 'background:#fbbf24;color:#78350f;font-size:20px;'
    if (rank === 2) return 'background:#d1d5db;color:#374151;font-size:20px;'
    if (rank === 3) return 'background:#b45309;color:#fff;font-size:20px;'
    return 'background:#f3f4f6;color:#6b7280;'
  }

  const rowStyle = (rank: number, status: string) => {
    if (status === 'absent') return 'opacity:0.55;'
    if (rank === 1) return 'background:#fffbeb;'
    if (rank === 2) return 'background:#f9fafb;'
    if (rank === 3) return 'background:#fef3c7;'
    return ''
  }

  const dateStr = quizSet.closedAt
    ? new Date(quizSet.closedAt).toLocaleDateString('vi-VN')
    : new Date().toLocaleDateString('vi-VN')

  const rows = leaderboard.map(entry => `
    <tr style="${rowStyle(entry.rank, entry.status)}">
      <td style="text-align:center;padding:10px 8px;">
        <span style="display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:50%;${rankStyle(entry.rank, entry.status)}font-weight:900;">
          ${entry.status === 'absent' ? '—' : medalIcon(entry.rank)}
        </span>
      </td>
      <td style="padding:10px 12px;font-weight:600;color:#29050F;">${entry.name}</td>
      <td style="text-align:center;padding:10px 8px;color:#6b7280;font-size:13px;">
        ${entry.status === 'absent' ? '<span style="color:#dc2626;font-weight:700;">Vắng</span>' : entry.submittedAt ?? '—'}
      </td>
      <td style="text-align:center;padding:10px 8px;">
        ${entry.status === 'absent'
          ? '<span style="color:#dc2626;font-weight:700;">—</span>'
          : `<span style="font-size:20px;font-weight:900;color:${entry.rank <= 3 ? '#951F3D' : '#374151'};">${entry.score}</span><span style="color:#9ca3af;font-size:12px;">/${entry.maxScore}đ</span>`
        }
      </td>
    </tr>
  `).join('')

  const html = `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Bảng xếp hạng — ${quizSet.title}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff; color: #111827; }
  .page { max-width: 720px; margin: 0 auto; padding: 32px 24px; }
  .header { background: linear-gradient(135deg, #BE3659, #7B1933); border-radius: 16px; padding: 24px 28px; margin-bottom: 28px; color: #fff; }
  .header h1 { font-size: 22px; font-weight: 900; margin-bottom: 4px; }
  .header .sub { font-size: 13px; opacity: 0.75; }
  .header .date { font-size: 12px; opacity: 0.6; margin-top: 8px; }
  .podium { display: flex; justify-content: center; align-items: flex-end; gap: 16px; margin-bottom: 28px; }
  .podium-item { text-align: center; }
  .podium-item .avatar { width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 28px; margin: 0 auto 6px; border: 3px solid #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
  .podium-item.p1 .avatar { background: #fbbf24; width: 72px; height: 72px; font-size: 36px; }
  .podium-item.p2 .avatar { background: #d1d5db; }
  .podium-item.p3 .avatar { background: #b45309; }
  .podium-item .pname { font-size: 12px; font-weight: 700; color: #374151; max-width: 90px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .podium-item.p1 .pname { font-size: 14px; color: #111827; }
  .podium-item .pscore { font-size: 18px; font-weight: 900; color: #951F3D; }
  .podium-item.p1 .pscore { font-size: 24px; }
  .podium-block { display: flex; align-items: flex-end; }
  .block { border-radius: 8px 8px 0 0; width: 80px; }
  .block.b1 { height: 70px; background: linear-gradient(180deg, #fbbf24, #f59e0b); width: 90px; }
  .block.b2 { height: 50px; background: linear-gradient(180deg, #d1d5db, #9ca3af); }
  .block.b3 { height: 36px; background: linear-gradient(180deg, #b45309, #92400e); }
  table { width: 100%; border-collapse: collapse; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
  thead { background: linear-gradient(90deg, #BE3659, #7B1933); color: #fff; }
  thead th { padding: 12px 10px; font-size: 13px; font-weight: 700; text-align: center; }
  thead th:nth-child(2) { text-align: left; }
  tbody tr { border-bottom: 1px solid #e5e7eb; }
  tbody tr:last-child { border-bottom: none; }
  .footer { margin-top: 20px; text-align: center; font-size: 11px; color: #9ca3af; }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .page { padding: 16px; }
    @page { margin: 12mm; }
  }
</style>
</head>
<body onload="window.print()">
<div class="page">
  <div class="header">
    <h1>🏆 Bảng xếp hạng</h1>
    <div class="sub">${quizSet.title}</div>
    <div class="sub" style="margin-top:3px;">${subject.course?.name ?? ''} · ${subject.name ?? ''}</div>
    <div class="date">Ngày: ${dateStr}</div>
  </div>

  ${submitted.length >= 1 ? `
  <div class="podium" style="margin-bottom:32px;">
    ${submitted[1] ? `
    <div class="podium-item p2" style="margin-bottom:0;">
      <div class="avatar">🥈</div>
      <div class="pname">${submitted[1].name}</div>
      <div class="pscore">${submitted[1].score}đ</div>
      <div class="block b2" style="margin:6px auto 0;"></div>
    </div>` : '<div style="width:80px;"></div>'}
    <div class="podium-item p1" style="margin-bottom:0;">
      <div class="avatar">🥇</div>
      <div class="pname">${submitted[0].name}</div>
      <div class="pscore">${submitted[0].score}đ</div>
      <div class="block b1" style="margin:6px auto 0;"></div>
    </div>
    ${submitted[2] ? `
    <div class="podium-item p3" style="margin-bottom:0;">
      <div class="avatar">🥉</div>
      <div class="pname">${submitted[2].name}</div>
      <div class="pscore">${submitted[2].score}đ</div>
      <div class="block b3" style="margin:6px auto 0;"></div>
    </div>` : '<div style="width:80px;"></div>'}
  </div>` : ''}

  <table>
    <thead>
      <tr>
        <th style="width:56px;">Hạng</th>
        <th>Họ tên</th>
        <th style="width:100px;">Nộp lúc</th>
        <th style="width:90px;">Điểm</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>

  <div class="footer">Tổng ${submitted.length} học sinh nộp bài · ${absent.length} vắng mặt · avab.vn</div>
</div>
</body>
</html>`

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}

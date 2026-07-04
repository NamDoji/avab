import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const metadata = { title: 'Thanh toán học phí — AvaB Phụ huynh' }

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatVND(amount: number): string {
  return amount.toLocaleString('vi-VN') + 'đ'
}

function StudentAvatar({ name, size = 36 }: { name: string | null; size?: number }) {
  const letter = (name ?? '?')[0]?.toUpperCase() ?? '?'
  const bgs = ['#0f766e', '#0369a1', '#7c3aed', '#db2777', '#ea580c']
  const bg = bgs[(letter.charCodeAt(0) ?? 0) % bgs.length]
  return (
    <div
      style={{
        width: size, height: size, borderRadius: '50%',
        background: bg, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: size * 0.42,
        fontWeight: 900, color: '#fff', flexShrink: 0,
      }}
    >
      {letter}
    </div>
  )
}

// ─── PaymentRow ────────────────────────────────────────────────────────────────

function PaymentRow({
  title,
  courseName,
  studentName,
  amount,
  createdAt,
  paidAt,
  isPaid,
}: {
  title: string
  courseName: string
  studentName: string | null
  amount: number
  createdAt: Date
  paidAt?: Date | null
  isPaid: boolean
}) {
  return (
    <div
      style={{
        display: 'flex', alignItems: 'flex-start',
        gap: 14, padding: '16px 0',
        borderBottom: '1px solid #1e293b',
      }}
    >
      <StudentAvatar name={studentName} size={40} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', margin: 0, lineHeight: 1.3 }}>
          {title}
        </p>
        <p style={{ fontSize: 12, color: '#64748b', margin: '3px 0 0' }}>
          {studentName ?? 'Học sinh'} · {courseName}
        </p>
        <p style={{ fontSize: 11, color: '#475569', margin: '2px 0 0' }}>
          {isPaid
            ? `Đã đóng: ${paidAt ? new Date(paidAt).toLocaleDateString('vi-VN') : '—'}`
            : `Tạo ngày: ${new Date(createdAt).toLocaleDateString('vi-VN')}`
          }
        </p>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <p
          style={{
            fontSize: 15, fontWeight: 800, margin: 0,
            color: isPaid ? '#4ade80' : '#f87171',
          }}
        >
          {formatVND(amount)}
        </p>
        <span
          style={{
            display: 'inline-block', marginTop: 4,
            padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700,
            background: isPaid ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
            color: isPaid ? '#4ade80' : '#f87171',
          }}
        >
          {isPaid ? '✓ Đã đóng' : '⚠ Chưa đóng'}
        </span>
      </div>
    </div>
  )
}

// ─── Payment Gateway Button ────────────────────────────────────────────────────

function PaymentButton({
  provider,
  icon,
  color,
  disabled,
}: {
  provider: string
  icon: string
  color: string
  disabled?: boolean
}) {
  return (
    <button
      disabled={disabled}
      title={disabled ? 'Tính năng đang phát triển' : undefined}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 8, padding: '12px 20px', borderRadius: 14, border: 'none',
        background: disabled ? 'rgba(255,255,255,0.08)' : color,
        color: disabled ? '#475569' : '#fff',
        fontWeight: 700, fontSize: 13, cursor: disabled ? 'not-allowed' : 'pointer',
        flex: 1, minHeight: 44, transition: 'opacity 0.2s',
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <span style={{ fontSize: 18 }}>{icon}</span>
      {provider}
      {disabled && (
        <span
          style={{
            fontSize: 10, fontWeight: 700, padding: '1px 5px',
            borderRadius: 4, background: 'rgba(255,255,255,0.15)', marginLeft: 2,
          }}
        >
          Sắp có
        </span>
      )}
    </button>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function PhuHuynhThanhToanPage() {
  const session = await auth()
  if (!session?.user) redirect('/dang-nhap')

  const parentId = (session.user as { id: string }).id
  const role = (session.user as { role?: string }).role
  if (role !== 'PARENT' && role !== 'ADMIN') redirect('/dang-nhap')

  // Get linked children
  const links = await prisma.parentStudentLink.findMany({
    where: { parentId },
    select: { studentId: true },
  })

  const childrenIds = links.map(l => l.studentId)

  if (childrenIds.length === 0) {
    return (
      <div style={{ minHeight: '100vh', background: '#030712', paddingTop: 0 }}>
        <div
          style={{
            background: 'linear-gradient(135deg,#1e3a5f 0%,#0f172a 100%)',
            padding: '36px 24px',
          }}
        >
          <div style={{ maxWidth: 860, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Link href="/phu-huynh" style={{ color: '#64748b', fontSize: 13, textDecoration: 'none' }}>
                ← Tổng quan
              </Link>
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: '#f1f5f9', margin: 0 }}>
              💳 Thanh toán học phí
            </h1>
          </div>
        </div>
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>👨‍👩‍👧‍👦</div>
          <p style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 17, margin: '0 0 8px' }}>
            Chưa có học sinh nào được liên kết
          </p>
          <p style={{ color: '#475569', fontSize: 13, margin: '0 0 24px' }}>
            Liên kết tài khoản con để theo dõi và thanh toán học phí
          </p>
          <Link
            href="/phu-huynh/lien-ket"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#6366f1', color: '#fff', padding: '12px 24px',
              borderRadius: 14, fontWeight: 700, fontSize: 14, textDecoration: 'none',
            }}
          >
            🔗 Liên kết con ngay
          </Link>
        </div>
      </div>
    )
  }

  // Fetch unpaid + paid payments in parallel
  const [unpaidPayments, paidPayments] = await Promise.all([
    prisma.tuitionPayment.findMany({
      where: {
        isPaid: false,
        isFree: false,
        userId: { in: childrenIds },
      },
      include: {
        enrollment: {
          include: {
            user: { select: { name: true } },
            course: { select: { name: true } },
          },
        },
        collection: { select: { title: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.tuitionPayment.findMany({
      where: {
        isPaid: true,
        userId: { in: childrenIds },
      },
      include: {
        enrollment: {
          include: {
            user: { select: { name: true } },
            course: { select: { name: true } },
          },
        },
        collection: { select: { title: true } },
      },
      orderBy: { paidAt: 'desc' },
      take: 20,
    }),
  ])

  const totalUnpaid = unpaidPayments.reduce((sum, p) => sum + p.amount, 0)
  const totalPaid = paidPayments.reduce((sum, p) => sum + p.amount, 0)

  // Group unpaid by student
  const unpaidByStudent = new Map<string, { name: string | null; payments: typeof unpaidPayments }>()
  for (const p of unpaidPayments) {
    const userId = p.enrollment.userId
    const studentName = p.enrollment.user.name
    const existing = unpaidByStudent.get(userId) ?? { name: studentName, payments: [] }
    existing.payments.push(p)
    unpaidByStudent.set(userId, existing)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#030712' }}>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <div
        style={{
          background: 'linear-gradient(135deg,#1e3a5f 0%,#1a1a4e 50%,#0f172a 100%)',
          padding: '32px 24px',
        }}
      >
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ marginBottom: 12 }}>
            <Link
              href="/phu-huynh"
              style={{ color: '#64748b', fontSize: 13, textDecoration: 'none', fontWeight: 600 }}
            >
              ← Tổng quan phụ huynh
            </Link>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#f1f5f9', margin: '0 0 6px' }}>
            💳 Thanh toán học phí
          </h1>
          <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>
            Quản lý học phí cho {childrenIds.length} học sinh
          </p>

          {/* Summary cards */}
          <div
            className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5"
          >
            <div
              style={{
                background: unpaidPayments.length > 0
                  ? 'rgba(239,68,68,0.12)'
                  : 'rgba(34,197,94,0.10)',
                borderRadius: 16, padding: '16px 20px',
                border: `1px solid ${unpaidPayments.length > 0
                  ? 'rgba(239,68,68,0.3)'
                  : 'rgba(34,197,94,0.3)'}`,
              }}
            >
              <p
                style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  color: unpaidPayments.length > 0 ? '#f87171' : '#4ade80',
                  margin: '0 0 6px',
                }}
              >
                {unpaidPayments.length > 0 ? '⚠️ Cần thanh toán' : '✅ Đã thanh toán hết'}
              </p>
              <p
                style={{
                  fontSize: 22, fontWeight: 900, margin: 0,
                  color: unpaidPayments.length > 0 ? '#f87171' : '#4ade80',
                }}
              >
                {formatVND(totalUnpaid)}
              </p>
              <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 0' }}>
                {unpaidPayments.length} khoản chưa đóng
              </p>
            </div>

            <div
              style={{
                background: 'rgba(99,102,241,0.10)',
                borderRadius: 16, padding: '16px 20px',
                border: '1px solid rgba(99,102,241,0.25)',
              }}
            >
              <p
                style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: '0.05em',
                  textTransform: 'uppercase', color: '#a5b4fc', margin: '0 0 6px',
                }}
              >
                📊 Đã đóng (gần đây)
              </p>
              <p style={{ fontSize: 22, fontWeight: 900, color: '#a5b4fc', margin: 0 }}>
                {formatVND(totalPaid)}
              </p>
              <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 0' }}>
                {paidPayments.length} khoản đã hoàn tất
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '28px 24px' }}>

        {/* ── Unpaid Payments ─────────────────────────────────── */}
        {unpaidPayments.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <h2
              style={{
                fontSize: 16, fontWeight: 900, color: '#f1f5f9',
                margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              ⚠️ Học phí chưa đóng ({unpaidPayments.length})
            </h2>

            {/* Per student group */}
            {[...unpaidByStudent.entries()].map(([studentId, { name, payments }]) => {
              const subtotal = payments.reduce((sum, p) => sum + p.amount, 0)
              return (
                <div
                  key={studentId}
                  style={{
                    background: 'linear-gradient(160deg,#1e293b 0%,#0f172a 100%)',
                    borderRadius: 20, border: '1px solid #334155',
                    marginBottom: 16, overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                  }}
                >
                  {/* Student header */}
                  <div
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '14px 20px',
                      background: 'rgba(239,68,68,0.08)',
                      borderBottom: '1px solid #1e293b',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <StudentAvatar name={name} size={36} />
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 800, color: '#f1f5f9', margin: 0 }}>
                          {name ?? 'Học sinh'}
                        </p>
                        <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0' }}>
                          {payments.length} khoản phí
                        </p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: 16, fontWeight: 900, color: '#f87171', margin: 0 }}>
                        {formatVND(subtotal)}
                      </p>
                      <p style={{ fontSize: 11, color: '#64748b', margin: '2px 0 0' }}>Tổng cần đóng</p>
                    </div>
                  </div>

                  {/* Payment items */}
                  <div style={{ padding: '0 20px' }}>
                    {payments.map(p => (
                      <PaymentRow
                        key={p.id}
                        title={p.collection.title}
                        courseName={p.enrollment.course.name}
                        studentName={p.enrollment.user.name}
                        amount={p.amount}
                        createdAt={p.createdAt}
                        isPaid={false}
                      />
                    ))}
                  </div>

                  {/* Payment Gateways */}
                  <div
                    style={{
                      padding: '16px 20px',
                      background: 'rgba(0,0,0,0.2)',
                      borderTop: '1px solid #1e293b',
                    }}
                  >
                    <p
                      style={{
                        fontSize: 11, fontWeight: 700, color: '#475569',
                        margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.05em',
                      }}
                    >
                      Chọn phương thức thanh toán
                    </p>
                    {/* VietQR Bank Transfer */}
                    <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: '14px 16px', marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <span style={{ fontSize: 18 }}>🏦</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>Chuyển khoản ngân hàng</span>
                        <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, background: '#22c55e33', color: '#4ade80', padding: '2px 8px', borderRadius: 6 }}>Đang mở</span>
                      </div>
                      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                        <div style={{ flex: 1, minWidth: 180 }}>
                          {[['Ngân hàng','MB Bank (MB)'],['Số tài khoản','1234567890'],['Chủ tài khoản','CONG TY ITSOL'],['Nội dung',`HP ${name ?? 'Hoc sinh'} - Thang ${new Date().getMonth()+1}`]].map(([k,v]) => (
                            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                              <span style={{ fontSize: 11, color: '#64748b' }}>{k}</span>
                              <span style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0', textAlign: 'right' }}>{v}</span>
                            </div>
                          ))}
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                            <span style={{ fontSize: 11, color: '#64748b' }}>Số tiền</span>
                            <span style={{ fontSize: 13, fontWeight: 900, color: '#f59e0b' }}>{subtotal.toLocaleString('vi-VN')}đ</span>
                          </div>
                        </div>
                        {/* VietQR */}
                        <div style={{ textAlign: 'center', flexShrink: 0 }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={`https://img.vietqr.io/image/MB-1234567890-compact2.png?amount=${subtotal}&addInfo=${encodeURIComponent(`HP ${name ?? 'Hoc sinh'} T${new Date().getMonth()+1}`)}&accountName=CONG%20TY%20ITSOL`}
                            alt="VietQR"
                            width={110}
                            height={110}
                            style={{ borderRadius: 10, border: '2px solid #1e293b' }}
                          />
                          <p style={{ fontSize: 10, color: '#475569', marginTop: 4 }}>Scan QR để chuyển khoản</p>
                        </div>
                      </div>
                    </div>
                    {/* Online gateway coming soon */}
                    <div style={{ display: 'flex', gap: 8 }}>
                      <PaymentButton provider="VNPay" icon="🏦" color="linear-gradient(135deg,#005BAC,#0070C9)" disabled />
                      <PaymentButton provider="MoMo" icon="💜" color="linear-gradient(135deg,#A50064,#D8006B)" disabled />
                    </div>
                    <p style={{ fontSize: 10, color: '#334155', marginTop: 6, textAlign: 'center' }}>VNPay &amp; MoMo sẽ được kích hoạt sớm</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── No Unpaid ────────────────────────────────────────── */}
        {unpaidPayments.length === 0 && (
          <div
            style={{
              background: 'rgba(34,197,94,0.08)',
              border: '1px solid rgba(34,197,94,0.25)',
              borderRadius: 20, padding: '32px 24px',
              textAlign: 'center', marginBottom: 32,
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <p style={{ fontSize: 18, fontWeight: 900, color: '#4ade80', margin: '0 0 8px' }}>
              Đã thanh toán đầy đủ!
            </p>
            <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>
              Tất cả học phí của con đã được đóng đầy đủ
            </p>
          </div>
        )}

        {/* ── Paid History ────────────────────────────────────── */}
        {paidPayments.length > 0 && (
          <div>
            <h2
              style={{
                fontSize: 16, fontWeight: 900, color: '#f1f5f9',
                margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              ✅ Lịch sử đã đóng ({paidPayments.length})
            </h2>

            <div
              style={{
                background: 'linear-gradient(160deg,#1e293b 0%,#0f172a 100%)',
                borderRadius: 20, border: '1px solid #334155',
                padding: '4px 20px 4px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
              }}
            >
              {paidPayments.map(p => (
                <PaymentRow
                  key={p.id}
                  title={p.collection.title}
                  courseName={p.enrollment.course.name}
                  studentName={p.enrollment.user.name}
                  amount={p.amount}
                  createdAt={p.createdAt}
                  paidAt={p.paidAt}
                  isPaid
                />
              ))}
            </div>
          </div>
        )}

        {/* ── No history ────────────────────────────────────────── */}
        {paidPayments.length === 0 && unpaidPayments.length === 0 && (
          <div style={{ textAlign: 'center', paddingTop: 40 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
            <p style={{ color: '#475569', fontSize: 14 }}>Chưa có lịch sử thanh toán</p>
          </div>
        )}

        {/* ── Help Section ─────────────────────────────────────── */}
        <div
          style={{
            marginTop: 32, background: '#0f172a', borderRadius: 16,
            padding: '20px 24px', border: '1px solid #1e293b',
          }}
        >
          <p style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', margin: '0 0 10px' }}>
            💡 Hướng dẫn thanh toán
          </p>
          <ul style={{ margin: 0, padding: '0 0 0 18px', color: '#64748b', fontSize: 12, lineHeight: 1.8 }}>
            <li>Thanh toán online qua VNPay và MoMo sẽ được kích hoạt trong thời gian tới</li>
            <li>Hiện tại, phụ huynh có thể đóng học phí trực tiếp tại trung tâm</li>
            <li>Hóa đơn sẽ được cập nhật trong vòng 24 giờ sau khi đóng tiền</li>
            <li>Mọi thắc mắc liên hệ: <span style={{ color: '#a5b4fc' }}>admin@avab.vn</span></li>
          </ul>
        </div>

      </div>
    </div>
  )
}

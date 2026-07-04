import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export const metadata = { title: 'In phiếu thu học phí — AvaB' }

const fmtVND = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)

/** Convert a number to Vietnamese text (simplified for VND amounts) */
function numberToVietnamese(num: number): string {
  if (num === 0) return 'không đồng'

  const units = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín']
  const teens = ['mười', 'mười một', 'mười hai', 'mười ba', 'mười bốn', 'mười lăm',
    'mười sáu', 'mười bảy', 'mười tám', 'mười chín']
  const tens = ['', 'mười', 'hai mươi', 'ba mươi', 'bốn mươi', 'năm mươi',
    'sáu mươi', 'bảy mươi', 'tám mươi', 'chín mươi']

  function readThree(n: number): string {
    const h = Math.floor(n / 100)
    const rest = n % 100
    const t = Math.floor(rest / 10)
    const u = rest % 10
    let result = ''
    if (h > 0) result += units[h] + ' trăm '
    if (rest === 0) return result.trim()
    if (rest < 10) {
      result += (h > 0 ? 'lẻ ' : '') + units[u]
    } else if (rest < 20) {
      result += teens[rest - 10]
    } else {
      result += tens[t]
      if (u > 0) result += ' ' + (u === 5 ? 'lăm' : units[u])
    }
    return result.trim()
  }

  const billion = Math.floor(num / 1_000_000_000)
  const million = Math.floor((num % 1_000_000_000) / 1_000_000)
  const thousand = Math.floor((num % 1_000_000) / 1_000)
  const remainder = num % 1_000

  let result = ''
  if (billion > 0) result += readThree(billion) + ' tỷ '
  if (million > 0) result += readThree(million) + ' triệu '
  if (thousand > 0) result += readThree(thousand) + ' nghìn '
  if (remainder > 0) result += readThree(remainder)

  return result.trim() + ' đồng'
}

export default async function InvoicePrintPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session || (session.user as { role?: string })?.role !== 'ADMIN')
    redirect('/dang-nhap')

  const { id } = await params

  const collection = await prisma.tuitionCollection.findUnique({
    where: { id },
    include: {
      course: {
        select: {
          name: true,
          grade: true,
          campusId: true,
        },
      },
      payments: {
        include: {
          enrollment: {
            include: { user: { select: { name: true, phone: true } } },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  if (!collection) notFound()

  // Look up campus name if campusId is set
  const campus = collection.course.campusId
    ? await prisma.campus.findUnique({
        where: { id: collection.course.campusId },
        select: { name: true },
      })
    : null
  const campusName: string = campus?.name ?? 'Trung tâm Anh ngữ AvaB'

  const paidPayments = collection.payments.filter((p) => p.isPaid && !p.isFree)
  const totalCollected = paidPayments.reduce((s, p) => s + p.amount, 0)
  const printDate = new Date().toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  return (
    <>
      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          .print-page {
            margin: 0;
            padding: 20mm 15mm;
            max-width: 210mm;
          }
        }
        @page {
          size: A4;
          margin: 15mm;
        }
        body {
          font-family: 'Times New Roman', Times, serif;
          background: #f9f9f9;
        }
      `}</style>

      {/* Print Button — hidden on print */}
      <div className="no-print fixed top-4 right-4 z-50 flex gap-3">
        <button
          onClick={() => window.print()}
          className="px-5 py-2.5 rounded-xl font-bold text-sm text-white shadow-lg hover:opacity-90 transition"
          style={{ background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)' }}
        >
          🖨️ In phiếu
        </button>
        <a
          href={`/admin/finance/invoices/${id}`}
          className="px-5 py-2.5 rounded-xl font-bold text-sm text-white shadow-lg hover:opacity-90 transition"
          style={{ background: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)' }}
        >
          ← Quay lại
        </a>
      </div>

      {/* A4 Print Page */}
      <div
        className="print-page"
        style={{
          width: '210mm',
          minHeight: '297mm',
          margin: '0 auto',
          background: '#ffffff',
          padding: '20mm 18mm',
          boxShadow: '0 0 30px rgba(0,0,0,0.12)',
        }}
      >
        {/* ── Header ────────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '3px solid #059669', paddingBottom: '12px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Logo placeholder */}
            <div style={{
              width: '56px', height: '56px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #065f46 0%, #059669 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 900, fontSize: '20px',
            }}>
              A
            </div>
            <div>
              <div style={{ fontWeight: 900, fontSize: '18px', color: '#065f46', letterSpacing: '-0.5px' }}>
                AvaB Education
              </div>
              <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
                {campusName}
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: '#6b7280' }}>Ngày in: {printDate}</div>
            <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
              Mã đợt thu: <span style={{ fontWeight: 700, color: '#111' }}>{id.slice(-8).toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* ── Title ─────────────────────────────────────────────────────── */}
        <div style={{ textAlign: 'center', margin: '20px 0 24px' }}>
          <div style={{ fontSize: '22px', fontWeight: 900, letterSpacing: '2px', color: '#111', textTransform: 'uppercase' }}>
            PHIẾU THU HỌC PHÍ
          </div>
          <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
            {collection.title}
          </div>
        </div>

        {/* ── Course Info ────────────────────────────────────────────────── */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '13px' }}>
          <tbody>
            <tr>
              <td style={{ padding: '4px 0', color: '#6b7280', width: '40%' }}>Khoá học:</td>
              <td style={{ padding: '4px 0', fontWeight: 700, color: '#111' }}>
                {collection.course.name}
                {collection.course.grade ? ` — Lớp ${collection.course.grade}` : ''}
              </td>
              <td style={{ padding: '4px 0', color: '#6b7280', width: '20%' }}>Cơ sở:</td>
              <td style={{ padding: '4px 0', fontWeight: 700, color: '#111' }}>
                {campusName}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '4px 0', color: '#6b7280' }}>Đợt thu:</td>
              <td style={{ padding: '4px 0', fontWeight: 700, color: '#111' }}>{collection.title}</td>
              <td style={{ padding: '4px 0', color: '#6b7280' }}>Số buổi:</td>
              <td style={{ padding: '4px 0', fontWeight: 700, color: '#111' }}>
                {collection.sessions > 0 ? collection.sessions + ' buổi' : '—'}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '4px 0', color: '#6b7280' }}>Ngày lập phiếu:</td>
              <td style={{ padding: '4px 0', fontWeight: 700, color: '#111' }}>{printDate}</td>
              <td style={{ padding: '4px 0', color: '#6b7280' }}>Số học viên:</td>
              <td style={{ padding: '4px 0', fontWeight: 700, color: '#111' }}>
                {paidPayments.length} / {collection.payments.length} người
              </td>
            </tr>
          </tbody>
        </table>

        {/* ── Payments Table ─────────────────────────────────────────────── */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginBottom: '20px' }}>
          <thead>
            <tr style={{ background: '#065f46', color: '#fff' }}>
              <th style={{ padding: '8px 10px', textAlign: 'center', border: '1px solid #047857', fontWeight: 700, width: '6%' }}>STT</th>
              <th style={{ padding: '8px 10px', textAlign: 'left', border: '1px solid #047857', fontWeight: 700, width: '30%' }}>Họ và tên</th>
              <th style={{ padding: '8px 10px', textAlign: 'left', border: '1px solid #047857', fontWeight: 700, width: '18%' }}>Số điện thoại</th>
              <th style={{ padding: '8px 10px', textAlign: 'right', border: '1px solid #047857', fontWeight: 700, width: '20%' }}>Số tiền</th>
              <th style={{ padding: '8px 10px', textAlign: 'center', border: '1px solid #047857', fontWeight: 700, width: '16%' }}>Ngày thu</th>
              <th style={{ padding: '8px 10px', textAlign: 'center', border: '1px solid #047857', fontWeight: 700, width: '10%' }}>Chữ ký</th>
            </tr>
          </thead>
          <tbody>
            {paidPayments.map((payment, idx) => (
              <tr
                key={payment.id}
                style={{ background: idx % 2 === 0 ? '#fff' : '#f0fdf4' }}
              >
                <td style={{ padding: '7px 10px', textAlign: 'center', border: '1px solid #d1d5db', color: '#374151' }}>
                  {idx + 1}
                </td>
                <td style={{ padding: '7px 10px', border: '1px solid #d1d5db', fontWeight: 600, color: '#111' }}>
                  {payment.enrollment.user.name ?? '—'}
                </td>
                <td style={{ padding: '7px 10px', border: '1px solid #d1d5db', color: '#374151' }}>
                  {payment.enrollment.user.phone ?? '—'}
                </td>
                <td style={{ padding: '7px 10px', textAlign: 'right', border: '1px solid #d1d5db', fontWeight: 700, color: '#065f46' }}>
                  {fmtVND(payment.amount)}
                </td>
                <td style={{ padding: '7px 10px', textAlign: 'center', border: '1px solid #d1d5db', color: '#374151' }}>
                  {payment.paidAt
                    ? new Date(payment.paidAt).toLocaleDateString('vi-VN')
                    : '—'}
                </td>
                <td style={{ padding: '7px 10px', border: '1px solid #d1d5db' }}>&nbsp;</td>
              </tr>
            ))}
            {/* Empty rows if < 5 paid */}
            {paidPayments.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  style={{ padding: '16px', textAlign: 'center', border: '1px solid #d1d5db', color: '#9ca3af', fontStyle: 'italic' }}
                >
                  Chưa có học viên nào đóng học phí trong đợt này
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr style={{ background: '#ecfdf5' }}>
              <td
                colSpan={3}
                style={{ padding: '9px 10px', textAlign: 'right', border: '1px solid #047857', fontWeight: 700, color: '#065f46', fontSize: '13px' }}
              >
                TỔNG CỘNG
              </td>
              <td
                style={{ padding: '9px 10px', textAlign: 'right', border: '1px solid #047857', fontWeight: 900, color: '#065f46', fontSize: '14px' }}
              >
                {fmtVND(totalCollected)}
              </td>
              <td colSpan={2} style={{ border: '1px solid #047857' }}></td>
            </tr>
          </tfoot>
        </table>

        {/* ── Total in text ──────────────────────────────────────────────── */}
        <div style={{
          border: '2px dashed #059669',
          borderRadius: '8px',
          padding: '10px 16px',
          marginBottom: '28px',
          fontSize: '13px',
        }}>
          <span style={{ color: '#6b7280' }}>Bằng chữ: </span>
          <span style={{ fontWeight: 700, color: '#065f46', fontStyle: 'italic' }}>
            {totalCollected > 0 ? numberToVietnamese(totalCollected) : 'Không đồng'}
          </span>
        </div>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', fontSize: '13px' }}>
          <div style={{ textAlign: 'center', width: '45%' }}>
            <div style={{ fontWeight: 700, color: '#111', marginBottom: '60px' }}>NGƯỜI NỘP TIỀN</div>
            <div style={{ borderTop: '1px solid #d1d5db', paddingTop: '6px', color: '#6b7280', fontSize: '11px' }}>
              (Ký, ghi rõ họ tên)
            </div>
          </div>
          <div style={{ textAlign: 'center', width: '45%' }}>
            <div style={{ fontWeight: 700, color: '#111' }}>NGƯỜI THU TIỀN</div>
            <div style={{ color: '#6b7280', fontSize: '11px', marginBottom: '40px' }}>
              AvaB Education
            </div>
            <div style={{ borderTop: '1px solid #d1d5db', paddingTop: '6px', color: '#6b7280', fontSize: '11px' }}>
              (Ký, đóng dấu)
            </div>
          </div>
        </div>

        {/* ── Notes ─────────────────────────────────────────────────────── */}
        {collection.note && (
          <div style={{ marginTop: '24px', padding: '10px 14px', background: '#fefce8', border: '1px solid #fde68a', borderRadius: '6px', fontSize: '12px', color: '#78350f' }}>
            <strong>Ghi chú:</strong> {collection.note}
          </div>
        )}

        {/* ── Watermark-style footer ─────────────────────────────────────── */}
        <div style={{ marginTop: '32px', borderTop: '1px solid #e5e7eb', paddingTop: '10px', textAlign: 'center', fontSize: '10px', color: '#9ca3af' }}>
          Phiếu thu học phí được phát hành bởi AvaB Education System · In ngày {printDate} ·
          Mã: {id.slice(-12).toUpperCase()}
        </div>
      </div>

      {/* Print trigger script */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.querySelector('[onClick]') && document.querySelector('[onClick]').addEventListener('click', () => window.print());
          `,
        }}
      />
    </>
  )
}

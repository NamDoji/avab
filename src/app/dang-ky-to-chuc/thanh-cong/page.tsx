import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Workspace đã được tạo — AvaB',
}

interface Props {
  searchParams: Promise<{ slug?: string; orgName?: string }>
}

export default async function DangKyThanhCongPage({ searchParams }: Props) {
  const params = await searchParams
  const slug = params.slug ?? ''
  const orgName = params.orgName ? decodeURIComponent(params.orgName) : 'Tổ chức của bạn'
  const workspaceUrl = slug ? `${slug}.avab.vn` : 'app.avab.vn'
  const loginUrl = slug ? `https://${slug}.avab.vn/dang-nhap` : '/dang-nhap'

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f3ff 0%, #eff6ff 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 16px',
      }}
    >
      <div style={{ maxWidth: 520, width: '100%' }}>

        {/* Card */}
        <div
          style={{
            background: '#fff',
            borderRadius: 24,
            padding: '48px 40px',
            boxShadow: '0 8px 48px rgba(0,0,0,0.1)',
            textAlign: 'center',
          }}
        >
          {/* Confetti emoji */}
          <div style={{ fontSize: 72, marginBottom: 16 }}>🎉</div>

          <h1
            style={{
              fontSize: 26,
              fontWeight: 900,
              color: '#111827',
              marginBottom: 8,
            }}
          >
            Workspace đã được tạo!
          </h1>

          <p style={{ color: '#6b7280', fontSize: 15, lineHeight: 1.7, marginBottom: 28 }}>
            Chúc mừng! <strong style={{ color: '#111827' }}>{orgName}</strong> đã có workspace
            riêng trên AvaB EOS.
          </p>

          {/* Workspace URL box */}
          <div
            style={{
              background: 'linear-gradient(135deg, #f5f3ff, #eff6ff)',
              border: '2px solid #c4b5fd',
              borderRadius: 16,
              padding: '20px 24px',
              marginBottom: 28,
            }}
          >
            <p style={{ fontSize: 12, fontWeight: 700, color: '#7c3aed', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
              🌐 Workspace URL
            </p>
            <p style={{ fontSize: 18, fontWeight: 900, color: '#4c1d95', marginBottom: 4 }}>
              {workspaceUrl}
            </p>
            <p style={{ fontSize: 12, color: '#8b5cf6' }}>Bookmark URL này để truy cập nhanh</p>
          </div>

          {/* Credentials summary */}
          <div
            style={{
              background: '#f0fdf4',
              border: '1.5px solid #bbf7d0',
              borderRadius: 14,
              padding: '16px 20px',
              marginBottom: 28,
              textAlign: 'left',
            }}
          >
            <p style={{ fontSize: 12, fontWeight: 800, color: '#166534', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              ✅ Tóm tắt
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#6b7280' }}>Tổ chức</span>
                <strong style={{ color: '#111827' }}>{orgName}</strong>
              </div>
              {slug && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: '#6b7280' }}>Workspace slug</span>
                  <strong style={{ color: '#7c3aed' }}>{slug}</strong>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#6b7280' }}>Dùng thử</span>
                <strong style={{ color: '#059669' }}>30 ngày miễn phí</strong>
              </div>
            </div>
          </div>

          {/* CTA buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <a
              href={loginUrl}
              style={{
                display: 'block',
                background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
                color: '#fff',
                fontWeight: 800,
                fontSize: 15,
                padding: '14px',
                borderRadius: 12,
                textDecoration: 'none',
                transition: 'opacity 0.2s',
              }}
            >
              🚀 Đăng nhập ngay →
            </a>

            <Link
              href="/"
              style={{
                display: 'block',
                background: '#f9fafb',
                color: '#6b7280',
                fontWeight: 700,
                fontSize: 13,
                padding: '10px',
                borderRadius: 12,
                textDecoration: 'none',
                border: '1.5px solid #e5e7eb',
              }}
            >
              ← Về trang chủ
            </Link>
          </div>
        </div>

        {/* Footer note */}
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: '#9ca3af' }}>
          Cần hỗ trợ?{' '}
          <a href="mailto:support@avab.vn" style={{ color: '#7c3aed', fontWeight: 700 }}>
            support@avab.vn
          </a>
        </p>

      </div>
    </div>
  )
}

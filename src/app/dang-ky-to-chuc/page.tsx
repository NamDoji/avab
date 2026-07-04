'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

// ─── Types ───────────────────────────────────────────────────────────────────

interface FormData {
  // Step 1
  orgName: string
  orgType: string
  orgCity: string
  orgSize: string
  // Step 2
  adminName: string
  adminEmail: string
  adminPhone: string
  adminPassword: string
  adminPasswordConfirm: string
  adminTitle: string
  // Step 3
  slug: string
  modules: string[]
}

type OrgType = { value: string; label: string; icon: string }
type ModuleDef = { key: string; label: string; icon: string; defaultOn: boolean }

// ─── Constants ───────────────────────────────────────────────────────────────

const ORG_TYPES: OrgType[] = [
  { value: 'SCHOOL',  label: 'Trường học',         icon: '🏫' },
  { value: 'CENTER',  label: 'Trung tâm',           icon: '🎓' },
  { value: 'CHAIN',   label: 'Công ty đào tạo',     icon: '🏢' },
]

const ORG_SIZES = [
  '< 100 HS', '100-500 HS', '500-2000 HS', '> 2000 HS',
]

const ADMIN_TITLES = ['Hiệu trưởng', 'Chủ trường', 'IT Admin', 'Khác']

const MODULES: ModuleDef[] = [
  { key: 'ai-studio', label: 'AI Studio',   icon: '🤖', defaultOn: true  },
  { key: 'erp',       label: 'School ERP',  icon: '🏫', defaultOn: true  },
  { key: 'finance',   label: 'Finance',     icon: '💰', defaultOn: true  },
  { key: 'crm',       label: 'CRM',         icon: '📞', defaultOn: false },
  { key: 'hrm',       label: 'HRM',         icon: '👥', defaultOn: false },
]

const SLUG_REGEX = /^[a-z0-9-]{3,50}$/

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 50)
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }}>
      {Array.from({ length: total }, (_, i) => {
        const step = i + 1
        const done = step < current
        const active = step === current
        return (
          <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 13,
              background: done ? '#10b981' : active ? '#7c3aed' : '#e5e7eb',
              color: done || active ? '#fff' : '#9ca3af',
              transition: 'all 0.2s',
            }}>
              {done ? '✓' : step}
            </div>
            {i < total - 1 && (
              <div style={{
                width: 40, height: 2,
                background: step < current ? '#10b981' : '#e5e7eb',
                transition: 'background 0.3s',
              }} />
            )}
          </div>
        )
      })}
      <span style={{ marginLeft: 8, fontSize: 13, color: '#6b7280', fontWeight: 600 }}>
        Bước {current}/{total}
      </span>
    </div>
  )
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>{msg}</p>
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function DangKyToChucPage() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormData>({
    orgName: '', orgType: '', orgCity: '', orgSize: '',
    adminName: '', adminEmail: '', adminPhone: '',
    adminPassword: '', adminPasswordConfirm: '', adminTitle: '',
    slug: '', modules: MODULES.filter(m => m.defaultOn).map(m => m.key),
  })
  const [errors, setErrors] = useState<Partial<Record<keyof FormData | 'submit', string>>>({})
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'ok' | 'taken'>('idle')
  const [slugSuggestion, setSlugSuggestion] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<{ orgName: string; slug: string; workspaceUrl: string } | null>(null)

  // Auto-generate slug from orgName
  useEffect(() => {
    if (form.orgName) {
      setForm(prev => ({ ...prev, slug: toSlug(prev.orgName) }))
    }
  }, [form.orgName])

  // Debounced slug check
  const checkSlug = useCallback(async (slug: string) => {
    if (!slug || !SLUG_REGEX.test(slug)) {
      setSlugStatus('idle')
      return
    }
    setSlugStatus('checking')
    try {
      const res = await fetch(`/api/organizations/check-slug?slug=${encodeURIComponent(slug)}`)
      const data = await res.json() as { available: boolean; suggestion?: string }
      setSlugStatus(data.available ? 'ok' : 'taken')
      setSlugSuggestion(data.suggestion ?? '')
    } catch {
      setSlugStatus('idle')
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (form.slug) checkSlug(form.slug)
    }, 500)
    return () => clearTimeout(timer)
  }, [form.slug, checkSlug])

  // ── Update field ──────────────────────────────────────────────────────────
  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
    setErrors(prev => ({ ...prev, [key]: undefined }))
  }

  function toggleModule(key: string) {
    setForm(prev => ({
      ...prev,
      modules: prev.modules.includes(key)
        ? prev.modules.filter(m => m !== key)
        : [...prev.modules, key],
    }))
  }

  // ── Validation ────────────────────────────────────────────────────────────
  function validateStep1(): boolean {
    const errs: typeof errors = {}
    if (!form.orgName.trim()) errs.orgName = 'Vui lòng nhập tên tổ chức'
    if (!form.orgType) errs.orgType = 'Vui lòng chọn loại tổ chức'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function validateStep2(): boolean {
    const errs: typeof errors = {}
    if (!form.adminName.trim()) errs.adminName = 'Vui lòng nhập họ tên'
    if (!form.adminEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.adminEmail)) {
      errs.adminEmail = 'Email không hợp lệ'
    }
    if (!form.adminPhone.trim() || !/^[0-9]{9,11}$/.test(form.adminPhone.replace(/\s/g, ''))) {
      errs.adminPhone = 'Số điện thoại không hợp lệ'
    }
    if (form.adminPassword.length < 8) errs.adminPassword = 'Mật khẩu tối thiểu 8 ký tự'
    if (form.adminPassword !== form.adminPasswordConfirm) {
      errs.adminPasswordConfirm = 'Mật khẩu xác nhận không khớp'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function validateStep3(): boolean {
    const errs: typeof errors = {}
    if (!form.slug.trim() || !SLUG_REGEX.test(form.slug)) {
      errs.slug = 'Slug chỉ được chứa chữ thường, số, dấu gạch ngang (3–50 ký tự)'
    }
    if (slugStatus === 'taken') errs.slug = 'Slug này đã được sử dụng'
    if (slugStatus === 'checking') errs.slug = 'Đang kiểm tra...'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleNext() {
    if (step === 1 && validateStep1()) setStep(2)
    else if (step === 2 && validateStep2()) setStep(3)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validateStep3()) return

    setSubmitting(true)
    setErrors({})
    try {
      const res = await fetch('/api/organizations/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgName:       form.orgName,
          orgType:       form.orgType,
          orgCity:       form.orgCity,
          orgSize:       form.orgSize,
          slug:          form.slug,
          adminName:     form.adminName,
          adminPhone:    form.adminPhone,
          adminEmail:    form.adminEmail,
          adminPassword: form.adminPassword,
          adminTitle:    form.adminTitle,
          modules:       form.modules,
        }),
      })
      const data = await res.json() as {
        success?: boolean; orgId?: string; slug?: string; workspaceUrl?: string
        orgName?: string; error?: string
      }
      if (!res.ok || !data.success) {
        setErrors({ submit: data.error ?? 'Đã có lỗi xảy ra' })
        return
      }
      setSuccess({ orgName: data.orgName!, slug: data.slug!, workspaceUrl: data.workspaceUrl! })
    } catch {
      setErrors({ submit: 'Không thể kết nối đến máy chủ' })
    } finally {
      setSubmitting(false)
    }
  }

  // ── Success screen ────────────────────────────────────────────────────────
  if (success) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ background: '#fff', borderRadius: 24, padding: 48, maxWidth: 480, width: '100%', textAlign: 'center', boxShadow: '0 8px 48px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: '#111827', marginBottom: 8 }}>
            Workspace đã được tạo!
          </h2>
          <p style={{ color: '#6b7280', fontSize: 15, marginBottom: 24, lineHeight: 1.6 }}>
            Workspace của <strong>{success.orgName}</strong> đã sẵn sàng.<br />
            Đăng nhập tại:
          </p>
          <a
            href={`https://${success.workspaceUrl}`}
            style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
              color: '#fff', fontWeight: 800, fontSize: 15,
              padding: '14px 32px', borderRadius: 12, textDecoration: 'none',
              marginBottom: 16,
            }}
          >
            🚀 Vào {success.slug}.avab.vn
          </a>
          <p style={{ fontSize: 13, color: '#9ca3af' }}>
            Hoặc{' '}
            <Link href="/dang-nhap" style={{ color: '#7c3aed', fontWeight: 700 }}>
              đăng nhập tại đây
            </Link>
          </p>
        </div>
      </div>
    )
  }

  // ── Shared input style ────────────────────────────────────────────────────
  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px',
    border: '1.5px solid #e5e7eb', borderRadius: 10,
    fontSize: 14, outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 13, fontWeight: 700,
    color: '#374151', marginBottom: 6,
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f3ff 0%, #eff6ff 100%)', padding: '40px 16px' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>

        {/* Logo + header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link href="/" style={{ fontSize: 28, fontWeight: 900, color: '#7c3aed', textDecoration: 'none' }}>
            AvaB
          </Link>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#111827', marginTop: 12, marginBottom: 4 }}>
            Đăng ký AvaB cho tổ chức của bạn
          </h1>
          <p style={{ fontSize: 13, color: '#6b7280' }}>
            🎁 Bắt đầu miễn phí 30 ngày · Không cần thẻ tín dụng
          </p>
        </div>

        {/* Card */}
        <div style={{ background: '#fff', borderRadius: 20, padding: '32px 28px', boxShadow: '0 4px 32px rgba(0,0,0,0.08)' }}>
          <StepIndicator current={step} total={3} />

          {/* ─── Step 1: Org info ─────────────────────────────────────────── */}
          {step === 1 && (
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#111827', marginBottom: 20 }}>
                🏢 Thông tin tổ chức
              </h2>

              {/* Org name */}
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Tên tổ chức *</label>
                <input
                  style={{ ...inputStyle, borderColor: errors.orgName ? '#ef4444' : '#e5e7eb' }}
                  placeholder="VD: Trường THPT Nguyễn Du"
                  value={form.orgName}
                  onChange={e => set('orgName', e.target.value)}
                />
                <FieldError msg={errors.orgName} />
              </div>

              {/* Org type */}
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Loại tổ chức *</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {ORG_TYPES.map(t => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => set('orgType', t.value)}
                      style={{
                        flex: 1, padding: '10px 8px', borderRadius: 10, cursor: 'pointer',
                        border: `2px solid ${form.orgType === t.value ? '#7c3aed' : '#e5e7eb'}`,
                        background: form.orgType === t.value ? '#f5f3ff' : '#fff',
                        fontWeight: 700, fontSize: 12, color: form.orgType === t.value ? '#7c3aed' : '#6b7280',
                        transition: 'all 0.15s',
                      }}
                    >
                      <div style={{ fontSize: 20, marginBottom: 4 }}>{t.icon}</div>
                      {t.label}
                    </button>
                  ))}
                </div>
                <FieldError msg={errors.orgType} />
              </div>

              {/* City */}
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Tỉnh/Thành phố</label>
                <input
                  style={inputStyle}
                  placeholder="VD: TP. Hồ Chí Minh"
                  value={form.orgCity}
                  onChange={e => set('orgCity', e.target.value)}
                />
              </div>

              {/* Size */}
              <div style={{ marginBottom: 24 }}>
                <label style={labelStyle}>Quy mô</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {ORG_SIZES.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => set('orgSize', s)}
                      style={{
                        padding: '8px 14px', borderRadius: 8, cursor: 'pointer',
                        border: `1.5px solid ${form.orgSize === s ? '#7c3aed' : '#e5e7eb'}`,
                        background: form.orgSize === s ? '#f5f3ff' : '#fff',
                        fontWeight: 600, fontSize: 12,
                        color: form.orgSize === s ? '#7c3aed' : '#6b7280',
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleNext}
                style={{
                  width: '100%', padding: '14px', borderRadius: 12, border: 'none',
                  background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
                  color: '#fff', fontWeight: 800, fontSize: 15, cursor: 'pointer',
                }}
              >
                Tiếp theo →
              </button>
            </div>
          )}

          {/* ─── Step 2: Admin account ────────────────────────────────────── */}
          {step === 2 && (
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#111827', marginBottom: 20 }}>
                👤 Tài khoản Admin
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={labelStyle}>Họ tên *</label>
                  <input
                    style={{ ...inputStyle, borderColor: errors.adminName ? '#ef4444' : '#e5e7eb' }}
                    placeholder="Nguyễn Văn A"
                    value={form.adminName}
                    onChange={e => set('adminName', e.target.value)}
                  />
                  <FieldError msg={errors.adminName} />
                </div>
                <div>
                  <label style={labelStyle}>Chức vụ</label>
                  <select
                    style={{ ...inputStyle, background: '#fff' }}
                    value={form.adminTitle}
                    onChange={e => set('adminTitle', e.target.value)}
                  >
                    <option value="">Chọn chức vụ</option>
                    {ADMIN_TITLES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>Email *</label>
                <input
                  type="email"
                  style={{ ...inputStyle, borderColor: errors.adminEmail ? '#ef4444' : '#e5e7eb' }}
                  placeholder="admin@truong.edu.vn"
                  value={form.adminEmail}
                  onChange={e => set('adminEmail', e.target.value)}
                />
                <FieldError msg={errors.adminEmail} />
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>Số điện thoại *</label>
                <input
                  type="tel"
                  style={{ ...inputStyle, borderColor: errors.adminPhone ? '#ef4444' : '#e5e7eb' }}
                  placeholder="0901234567"
                  value={form.adminPhone}
                  onChange={e => set('adminPhone', e.target.value)}
                />
                <FieldError msg={errors.adminPhone} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                <div>
                  <label style={labelStyle}>Mật khẩu *</label>
                  <input
                    type="password"
                    style={{ ...inputStyle, borderColor: errors.adminPassword ? '#ef4444' : '#e5e7eb' }}
                    placeholder="Tối thiểu 8 ký tự"
                    value={form.adminPassword}
                    onChange={e => set('adminPassword', e.target.value)}
                  />
                  <FieldError msg={errors.adminPassword} />
                </div>
                <div>
                  <label style={labelStyle}>Xác nhận *</label>
                  <input
                    type="password"
                    style={{ ...inputStyle, borderColor: errors.adminPasswordConfirm ? '#ef4444' : '#e5e7eb' }}
                    placeholder="Nhập lại mật khẩu"
                    value={form.adminPasswordConfirm}
                    onChange={e => set('adminPasswordConfirm', e.target.value)}
                  />
                  <FieldError msg={errors.adminPasswordConfirm} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{
                    flex: 1, padding: '14px', borderRadius: 12,
                    border: '1.5px solid #e5e7eb', background: '#fff',
                    fontWeight: 700, fontSize: 14, cursor: 'pointer', color: '#374151',
                  }}
                >
                  ← Quay lại
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  style={{
                    flex: 2, padding: '14px', borderRadius: 12, border: 'none',
                    background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
                    color: '#fff', fontWeight: 800, fontSize: 15, cursor: 'pointer',
                  }}
                >
                  Tiếp theo →
                </button>
              </div>
            </div>
          )}

          {/* ─── Step 3: Workspace ────────────────────────────────────────── */}
          {step === 3 && (
            <form onSubmit={handleSubmit}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#111827', marginBottom: 20 }}>
                🌐 Cài đặt Workspace
              </h2>

              {/* Slug */}
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Tên Workspace *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    style={{
                      ...inputStyle,
                      borderColor: errors.slug ? '#ef4444'
                        : slugStatus === 'ok' ? '#10b981'
                        : slugStatus === 'taken' ? '#f59e0b'
                        : '#e5e7eb',
                      paddingRight: 40,
                    }}
                    placeholder="ten-truong"
                    value={form.slug}
                    onChange={e => set('slug', e.target.value.toLowerCase())}
                  />
                  {slugStatus !== 'idle' && (
                    <span style={{
                      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                      fontSize: 16,
                    }}>
                      {slugStatus === 'checking' ? '⏳' : slugStatus === 'ok' ? '✅' : '⚠️'}
                    </span>
                  )}
                </div>

                {/* Preview */}
                <div style={{
                  marginTop: 8, padding: '8px 12px', borderRadius: 8,
                  background: '#f8fafc', border: '1px solid #e5e7eb',
                  fontSize: 13, color: '#6b7280',
                }}>
                  🔗 Preview: <strong style={{ color: '#7c3aed' }}>{form.slug || 'ten-truong'}.avab.vn</strong>
                </div>

                {slugStatus === 'taken' && slugSuggestion && (
                  <div style={{ marginTop: 6, fontSize: 12, color: '#f59e0b' }}>
                    Slug đã được dùng.{' '}
                    <button
                      type="button"
                      onClick={() => set('slug', slugSuggestion)}
                      style={{ color: '#7c3aed', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                      Dùng &quot;{slugSuggestion}&quot;?
                    </button>
                  </div>
                )}
                <FieldError msg={errors.slug} />
                <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
                  Chỉ chữ thường, số, dấu gạch ngang. VD: newton-school
                </p>
              </div>

              {/* Modules */}
              <div style={{ marginBottom: 24 }}>
                <label style={labelStyle}>Chọn modules muốn sử dụng</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {MODULES.map(mod => {
                    const on = form.modules.includes(mod.key)
                    return (
                      <button
                        key={mod.key}
                        type="button"
                        onClick={() => toggleModule(mod.key)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
                          border: `1.5px solid ${on ? '#7c3aed' : '#e5e7eb'}`,
                          background: on ? '#f5f3ff' : '#fafafa',
                          textAlign: 'left', width: '100%',
                          transition: 'all 0.15s',
                        }}
                      >
                        <span style={{ fontSize: 20 }}>{mod.icon}</span>
                        <span style={{ flex: 1, fontWeight: 700, fontSize: 13, color: on ? '#7c3aed' : '#374151' }}>
                          {mod.label}
                        </span>
                        <span style={{ fontSize: 16 }}>{on ? '✅' : '❌'}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {errors.submit && (
                <div style={{
                  padding: '10px 14px', borderRadius: 8,
                  background: '#fef2f2', border: '1px solid #fca5a5',
                  color: '#dc2626', fontSize: 13, marginBottom: 16,
                }}>
                  ⚠️ {errors.submit}
                </div>
              )}

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  style={{
                    flex: 1, padding: '14px', borderRadius: 12,
                    border: '1.5px solid #e5e7eb', background: '#fff',
                    fontWeight: 700, fontSize: 14, cursor: 'pointer', color: '#374151',
                  }}
                >
                  ← Quay lại
                </button>
                <button
                  type="submit"
                  disabled={submitting || slugStatus === 'taken' || slugStatus === 'checking'}
                  style={{
                    flex: 2, padding: '14px', borderRadius: 12, border: 'none',
                    background: submitting ? '#c4b5fd' : 'linear-gradient(135deg, #7c3aed, #2563eb)',
                    color: '#fff', fontWeight: 800, fontSize: 15,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    opacity: submitting ? 0.8 : 1,
                  }}
                >
                  {submitting ? '⏳ Đang tạo...' : '🚀 Tạo Workspace'}
                </button>
              </div>
            </form>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: '#9ca3af' }}>
          Đã có tài khoản?{' '}
          <Link href="/dang-nhap" style={{ color: '#7c3aed', fontWeight: 700 }}>
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  )
}

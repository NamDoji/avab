'use client'

import { useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrgMember {
  id: string
  orgRole: string
  joinedAt: string
  user: { id: string; name: string; email: string; phone: string; avatar: string }
}

interface OrgData {
  id: string
  name: string
  slug: string
  type: string
  logo: string
  domain: string
  isActive: boolean
  modules: string[]
  settings: Record<string, unknown>
  campusCount: number
  members: OrgMember[]
}

// ─── Module definitions ──────────────────────────────────────────────────────

const MODULE_DEFS = [
  { key: 'ai-studio',     label: 'AI Studio',     icon: '🤖', desc: 'Tạo nội dung, khóa học bằng AI' },
  { key: 'erp',           label: 'School ERP',     icon: '🏫', desc: 'Học vụ, điểm danh, thời khóa biểu' },
  { key: 'finance',       label: 'Finance ERP',    icon: '💰', desc: 'Học phí, hóa đơn, thu chi' },
  { key: 'crm',           label: 'CRM',            icon: '📞', desc: 'Pipeline tuyển sinh, leads' },
  { key: 'hrm',           label: 'HRM',            icon: '👥', desc: 'Quản lý nhân sự giáo viên' },
  { key: 'collaboration', label: 'Collaboration',  icon: '💬', desc: 'Chat, task, meetings' },
]

const ORG_TYPES = [
  { value: 'SCHOOL',  label: 'Trường học' },
  { value: 'CENTER',  label: 'Trung tâm' },
  { value: 'CHAIN',   label: 'Chuỗi / Công ty đào tạo' },
]

const ROLE_LABELS: Record<string, string> = {
  OWNER:  '👑 Owner',
  ADMIN:  '🛡️ Admin',
  MEMBER: '👤 Thành viên',
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px',
  border: '1.5px solid #e5e7eb', borderRadius: 10,
  fontSize: 14, outline: 'none', boxSizing: 'border-box',
}
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 6,
}
const sectionStyle: React.CSSProperties = {
  background: '#fff', borderRadius: 16,
  border: '1px solid #f1f5f9', padding: 24, marginBottom: 20,
}

// ─── Tab: Thông tin ──────────────────────────────────────────────────────────

function TabInfo({ org }: { org: OrgData }) {
  const [name, setName] = useState(org.name)
  const [type, setType] = useState(org.type)
  const [domain, setDomain] = useState(org.domain)
  const [logo, setLogo] = useState(org.logo)
  const [desc, setDesc] = useState((org.settings.description as string) ?? '')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  async function handleSave() {
    setSaving(true)
    setMsg('')
    try {
      const res = await fetch(`/api/admin/organizations/${org.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, type, domain, logo, description: desc }),
      })
      if (res.ok) { setMsg('✅ Đã lưu') } else { setMsg('❌ Lỗi khi lưu') }
    } catch { setMsg('❌ Không kết nối được') } finally { setSaving(false) }
  }

  return (
    <div style={sectionStyle}>
      <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 20, color: '#111827' }}>
        📝 Thông tin tổ chức
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ gridColumn: '1/-1' }}>
          <label style={labelStyle}>Tên tổ chức</label>
          <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Loại tổ chức</label>
          <select style={{ ...inputStyle, background: '#fff' }} value={type} onChange={e => setType(e.target.value)}>
            {ORG_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Domain riêng</label>
          <input style={inputStyle} placeholder="school.edu.vn" value={domain} onChange={e => setDomain(e.target.value)} />
        </div>
        <div style={{ gridColumn: '1/-1' }}>
          <label style={labelStyle}>Logo URL</label>
          <input style={inputStyle} placeholder="https://..." value={logo} onChange={e => setLogo(e.target.value)} />
        </div>
        <div style={{ gridColumn: '1/-1' }}>
          <label style={labelStyle}>Mô tả</label>
          <textarea
            style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
            value={desc}
            onChange={e => setDesc(e.target.value)}
          />
        </div>
      </div>
      <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: '10px 24px', borderRadius: 10, border: 'none',
            background: saving ? '#c4b5fd' : 'linear-gradient(135deg, #7c3aed, #2563eb)',
            color: '#fff', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
          }}
        >
          {saving ? 'Đang lưu...' : '💾 Lưu thay đổi'}
        </button>
        {msg && <span style={{ fontSize: 13, fontWeight: 600 }}>{msg}</span>}
      </div>
    </div>
  )
}

// ─── Tab: Modules ─────────────────────────────────────────────────────────────

function TabModules({ org }: { org: OrgData }) {
  const [modules, setModules] = useState<string[]>(org.modules)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  function toggle(key: string) {
    setModules(prev =>
      prev.includes(key) ? prev.filter(m => m !== key) : [...prev, key]
    )
    setMsg('')
  }

  async function handleSave() {
    setSaving(true)
    setMsg('')
    try {
      const res = await fetch(`/api/admin/organizations/${org.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modules }),
      })
      if (res.ok) { setMsg('✅ Đã cập nhật modules') } else { setMsg('❌ Lỗi') }
    } catch { setMsg('❌ Không kết nối được') } finally { setSaving(false) }
  }

  return (
    <div style={sectionStyle}>
      <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 4, color: '#111827' }}>🧩 Modules</h3>
      <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>
        Bật/tắt các modules cho tổ chức này. Thay đổi có hiệu lực ngay.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {MODULE_DEFS.map(mod => {
          const on = modules.includes(mod.key)
          return (
            <button
              key={mod.key}
              type="button"
              onClick={() => toggle(mod.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 16px', borderRadius: 12, cursor: 'pointer',
                border: `1.5px solid ${on ? '#7c3aed' : '#e5e7eb'}`,
                background: on ? '#f5f3ff' : '#fafafa',
                textAlign: 'left', width: '100%', transition: 'all 0.15s',
              }}
            >
              <span style={{ fontSize: 24 }}>{mod.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: on ? '#7c3aed' : '#374151' }}>
                  {mod.label}
                </div>
                <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{mod.desc}</div>
              </div>
              <div style={{
                width: 40, height: 22, borderRadius: 11,
                background: on ? '#7c3aed' : '#d1d5db',
                position: 'relative', transition: 'background 0.2s', flexShrink: 0,
              }}>
                <div style={{
                  position: 'absolute', top: 3,
                  left: on ? 21 : 3,
                  width: 16, height: 16, borderRadius: '50%',
                  background: '#fff', transition: 'left 0.2s',
                }} />
              </div>
            </button>
          )
        })}
      </div>
      <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: '10px 24px', borderRadius: 10, border: 'none',
            background: saving ? '#c4b5fd' : 'linear-gradient(135deg, #7c3aed, #2563eb)',
            color: '#fff', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
          }}
        >
          {saving ? 'Đang lưu...' : '💾 Lưu modules'}
        </button>
        {msg && <span style={{ fontSize: 13, fontWeight: 600 }}>{msg}</span>}
      </div>
    </div>
  )
}

// ─── Tab: Branding ────────────────────────────────────────────────────────────

function TabBranding({ org }: { org: OrgData }) {
  const [primaryColor, setPrimaryColor] = useState(
    (org.settings.primaryColor as string) ?? '#7c3aed'
  )
  const [logo, setLogo] = useState(org.logo)
  const [faviconUrl, setFaviconUrl] = useState((org.settings.faviconUrl as string) ?? '')
  const [welcomeMsg, setWelcomeMsg] = useState((org.settings.welcomeMessage as string) ?? '')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  async function handleSave() {
    setSaving(true)
    setMsg('')
    try {
      const res = await fetch(`/api/admin/organizations/${org.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logo,
          settings: { primaryColor, faviconUrl, welcomeMessage: welcomeMsg },
        }),
      })
      if (res.ok) { setMsg('✅ Đã lưu branding') } else { setMsg('❌ Lỗi') }
    } catch { setMsg('❌ Không kết nối được') } finally { setSaving(false) }
  }

  return (
    <div style={sectionStyle}>
      <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 20, color: '#111827' }}>🎨 Branding</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <label style={labelStyle}>Màu chủ đạo</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input
              type="color"
              value={primaryColor}
              onChange={e => setPrimaryColor(e.target.value)}
              style={{ width: 48, height: 40, borderRadius: 8, border: '1.5px solid #e5e7eb', cursor: 'pointer' }}
            />
            <input
              style={{ ...inputStyle, flex: 1 }}
              value={primaryColor}
              onChange={e => setPrimaryColor(e.target.value)}
              placeholder="#7c3aed"
            />
          </div>
        </div>
        <div>
          <label style={labelStyle}>Preview màu</label>
          <div style={{
            height: 40, borderRadius: 10,
            background: primaryColor,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: 13,
          }}>
            AvaB · {org.name}
          </div>
        </div>
        <div style={{ gridColumn: '1/-1' }}>
          <label style={labelStyle}>Logo URL</label>
          <input style={inputStyle} placeholder="https://..." value={logo} onChange={e => setLogo(e.target.value)} />
        </div>
        <div style={{ gridColumn: '1/-1' }}>
          <label style={labelStyle}>Favicon URL</label>
          <input style={inputStyle} placeholder="https://.../favicon.ico" value={faviconUrl} onChange={e => setFaviconUrl(e.target.value)} />
        </div>
        <div style={{ gridColumn: '1/-1' }}>
          <label style={labelStyle}>Welcome message (hiển thị khi login)</label>
          <textarea
            style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
            placeholder="Chào mừng bạn đến với hệ thống..."
            value={welcomeMsg}
            onChange={e => setWelcomeMsg(e.target.value)}
          />
        </div>
      </div>
      <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: '10px 24px', borderRadius: 10, border: 'none',
            background: saving ? '#c4b5fd' : 'linear-gradient(135deg, #7c3aed, #2563eb)',
            color: '#fff', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
          }}
        >
          {saving ? 'Đang lưu...' : '💾 Lưu branding'}
        </button>
        {msg && <span style={{ fontSize: 13, fontWeight: 600 }}>{msg}</span>}
      </div>
    </div>
  )
}

// ─── Tab: Thành viên ─────────────────────────────────────────────────────────

function TabMembers({ org }: { org: OrgData }) {
  const [members, setMembers] = useState<OrgMember[]>(org.members)
  const [searchPhone, setSearchPhone] = useState('')
  const [selectedRole, setSelectedRole] = useState('MEMBER')
  const [addMsg, setAddMsg] = useState('')
  const [addLoading, setAddLoading] = useState(false)

  async function handleAddMember() {
    if (!searchPhone.trim()) return
    setAddLoading(true)
    setAddMsg('')
    try {
      const res = await fetch(`/api/admin/organizations/${org.id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: searchPhone.trim(), orgRole: selectedRole }),
      })
      const data = await res.json() as { error?: string; member?: OrgMember }
      if (res.ok && data.member) {
        setMembers(prev => [...prev, data.member!])
        setSearchPhone('')
        setAddMsg('✅ Đã thêm thành viên')
      } else {
        setAddMsg(`❌ ${data.error ?? 'Lỗi'}`)
      }
    } catch { setAddMsg('❌ Không kết nối được') } finally { setAddLoading(false) }
  }

  async function handleChangeRole(memberId: string, newRole: string) {
    await fetch(`/api/admin/organizations/${org.id}/members/${memberId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orgRole: newRole }),
    })
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, orgRole: newRole } : m))
  }

  async function handleRemove(memberId: string) {
    if (!confirm('Xác nhận xóa thành viên này?')) return
    await fetch(`/api/admin/organizations/${org.id}/members/${memberId}`, { method: 'DELETE' })
    setMembers(prev => prev.filter(m => m.id !== memberId))
  }

  const ROLES = ['OWNER', 'ADMIN', 'MEMBER']

  return (
    <div style={sectionStyle}>
      <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 4, color: '#111827' }}>
        👥 Thành viên ({members.length})
      </h3>
      <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>
        Quản lý quyền truy cập vào tổ chức.
      </p>

      {/* Add member */}
      <div style={{
        display: 'flex', gap: 8, marginBottom: 24, padding: '16px',
        background: '#f8fafc', borderRadius: 12, border: '1px solid #e5e7eb',
      }}>
        <input
          style={{ ...inputStyle, flex: 1 }}
          placeholder="Tìm theo số điện thoại..."
          value={searchPhone}
          onChange={e => setSearchPhone(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAddMember()}
        />
        <select
          style={{ ...inputStyle, width: 140 }}
          value={selectedRole}
          onChange={e => setSelectedRole(e.target.value)}
        >
          {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
        </select>
        <button
          onClick={handleAddMember}
          disabled={addLoading}
          style={{
            padding: '10px 16px', borderRadius: 10, border: 'none',
            background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
            color: '#fff', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
          }}
        >
          {addLoading ? '...' : '➕ Thêm'}
        </button>
      </div>
      {addMsg && (
        <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, marginTop: -16 }}>{addMsg}</p>
      )}

      {/* Members list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {members.map(m => (
          <div
            key={m.id}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 14px', borderRadius: 10,
              border: '1px solid #f1f5f9', background: '#fff',
            }}
          >
            {/* Avatar */}
            {m.user.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={m.user.avatar} alt={m.user.name} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 800, fontSize: 14, flexShrink: 0,
              }}>
                {m.user.name.slice(0, 1).toUpperCase()}
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#111827', truncate: 'ellipsis' } as React.CSSProperties}>
                {m.user.name || '(Chưa có tên)'}
              </div>
              <div style={{ fontSize: 12, color: '#9ca3af' }}>
                {m.user.email || m.user.phone} · Tham gia {new Date(m.joinedAt).toLocaleDateString('vi-VN')}
              </div>
            </div>
            {/* Role selector */}
            <select
              value={m.orgRole}
              onChange={e => handleChangeRole(m.id, e.target.value)}
              style={{ padding: '6px 10px', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: 12, fontWeight: 700, background: '#fff' }}
            >
              {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
            </select>
            {/* Remove */}
            {m.orgRole !== 'OWNER' && (
              <button
                onClick={() => handleRemove(m.id)}
                style={{ padding: '6px 10px', borderRadius: 8, border: 'none', background: '#fef2f2', color: '#dc2626', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}
              >
                🗑️
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Tab: Nguy hiểm ──────────────────────────────────────────────────────────

function TabDanger({ org }: { org: OrgData }) {
  const [confirming, setConfirming] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (confirmText !== org.name) return
    setDeleting(true)
    try {
      await fetch(`/api/admin/organizations/${org.id}`, { method: 'DELETE' })
      window.location.href = '/admin/organizations'
    } catch { setDeleting(false) }
  }

  return (
    <div style={{ ...sectionStyle, border: '1.5px solid #fca5a5' }}>
      <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 4, color: '#dc2626' }}>
        ⚠️ Vùng nguy hiểm
      </h3>
      <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>
        Các thao tác không thể hoàn tác. Chỉ OWNER mới có thể thực hiện.
      </p>

      {!confirming ? (
        <button
          onClick={() => setConfirming(true)}
          style={{
            padding: '10px 20px', borderRadius: 10, border: '1.5px solid #dc2626',
            background: '#fff', color: '#dc2626', fontWeight: 700, cursor: 'pointer',
          }}
        >
          🗑️ Xóa tổ chức này
        </button>
      ) : (
        <div style={{ padding: 20, borderRadius: 12, background: '#fef2f2', border: '1px solid #fca5a5' }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#dc2626', marginBottom: 8 }}>
            Gõ tên tổ chức để xác nhận xóa:
          </p>
          <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>
            Gõ chính xác: <strong>{org.name}</strong>
          </p>
          <input
            style={{ ...inputStyle, borderColor: '#fca5a5', marginBottom: 12 }}
            placeholder={org.name}
            value={confirmText}
            onChange={e => setConfirmText(e.target.value)}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => { setConfirming(false); setConfirmText('') }}
              style={{ padding: '10px 16px', borderRadius: 10, border: '1.5px solid #e5e7eb', background: '#fff', fontWeight: 700, cursor: 'pointer' }}
            >
              Hủy
            </button>
            <button
              onClick={handleDelete}
              disabled={confirmText !== org.name || deleting}
              style={{
                padding: '10px 16px', borderRadius: 10, border: 'none',
                background: confirmText === org.name ? '#dc2626' : '#fca5a5',
                color: '#fff', fontWeight: 700,
                cursor: confirmText === org.name ? 'pointer' : 'not-allowed',
              }}
            >
              {deleting ? 'Đang xóa...' : '🗑️ Xác nhận xóa'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main exported component ─────────────────────────────────────────────────

const TABS = [
  { key: 'info',    label: '📝 Thông tin' },
  { key: 'modules', label: '🧩 Modules' },
  { key: 'brand',   label: '🎨 Branding' },
  { key: 'members', label: '👥 Thành viên' },
  { key: 'danger',  label: '⚠️ Nguy hiểm' },
]

export default function OrgSettingsTabs({ org }: { org: OrgData }) {
  const [activeTab, setActiveTab] = useState('info')

  return (
    <div>
      {/* Tab nav */}
      <div style={{
        display: 'flex', gap: 4, marginBottom: 24,
        background: '#fff', borderRadius: 14, padding: 6,
        border: '1px solid #f1f5f9', overflowX: 'auto',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      }}>
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '8px 16px', borderRadius: 10, border: 'none',
              background: activeTab === tab.key ? '#7c3aed' : 'transparent',
              color: activeTab === tab.key ? '#fff' : '#6b7280',
              fontWeight: 700, fontSize: 13, cursor: 'pointer',
              whiteSpace: 'nowrap', transition: 'all 0.15s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'info'    && <TabInfo     org={org} />}
      {activeTab === 'modules' && <TabModules  org={org} />}
      {activeTab === 'brand'   && <TabBranding org={org} />}
      {activeTab === 'members' && <TabMembers  org={org} />}
      {activeTab === 'danger'  && <TabDanger   org={org} />}
    </div>
  )
}

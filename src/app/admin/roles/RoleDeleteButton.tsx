'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface RoleDeleteButtonProps {
  roleId: string
  roleName: string
}

export default function RoleDeleteButton({ roleId, roleName }: RoleDeleteButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/roles/${roleId}`, { method: 'DELETE' })
      const data = await res.json()
      if (!data.success) {
        setError(data.error || 'Xóa thất bại')
        setLoading(false)
        return
      }
      setShowConfirm(false)
      router.refresh()
    } catch {
      setError('Lỗi kết nối')
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="text-xs font-semibold text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1 rounded-lg transition-all"
        title="Xóa role"
      >
        🗑️ Xóa
      </button>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <h3 className="font-black text-gray-900 text-lg mb-2">Xóa Role</h3>
            <p className="text-gray-600 text-sm mb-1">
              Bạn có chắc muốn xóa role:
            </p>
            <p className="font-bold text-red-700 text-sm mb-4">"{roleName}"</p>
            <p className="text-gray-500 text-xs mb-4">
              Tất cả quyền và user gán vào role này sẽ bị xóa theo. Hành động này không thể hoàn tác.
            </p>
            {error && (
              <p className="text-red-600 text-xs mb-3 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => { setShowConfirm(false); setError(null) }}
                disabled={loading}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 rounded-xl text-sm transition-all"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-xl text-sm transition-all disabled:opacity-60"
              >
                {loading ? 'Đang xóa...' : '🗑️ Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

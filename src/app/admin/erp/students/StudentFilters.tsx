'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

interface Props {
  total: number
}

const FILTER_OPTIONS = [
  { value: 'all',      label: 'Tất cả' },
  { value: 'active',   label: 'Đang học' },
  { value: 'inactive', label: 'Chưa có lớp' },
  { value: 'new',      label: 'Mới (7 ngày)' },
]

const SORT_OPTIONS = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'name',   label: 'Tên A-Z' },
  { value: 'active', label: 'Hoạt động nhiều nhất' },
]

export default function StudentFilters({ total }: Props) {
  const router   = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentFilter = searchParams.get('filter') ?? 'all'
  const currentSort   = searchParams.get('sort')   ?? 'newest'
  const currentSearch = searchParams.get('search') ?? ''

  const [searchValue, setSearchValue] = useState(currentSearch)

  // Debounce search → push URL
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (searchValue) params.set('search', searchValue)
      else params.delete('search')
      router.replace(`${pathname}?${params.toString()}`)
    }, 350)
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue])

  function setFilter(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all') params.delete('filter')
    else params.set('filter', value)
    router.push(`${pathname}?${params.toString()}`)
  }

  function setSort(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'newest') params.delete('sort')
    else params.set('sort', value)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm mb-5">
      <div className="flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="flex-1 min-w-52">
          <input
            type="text"
            placeholder="🔍 Tìm theo tên, SĐT..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 flex-wrap">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className="px-3 py-2 rounded-xl text-xs font-bold transition-colors"
              style={
                currentFilter === opt.value
                  ? { background: '#0f766e', color: '#fff' }
                  : { background: '#f3f4f6', color: '#6b7280' }
              }
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select
          value={currentSort}
          onChange={(e) => setSort(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {/* Count badge */}
        <div
          className="text-xs font-bold px-3 py-2 rounded-xl"
          style={{ background: '#f0fdfa', color: '#0f766e' }}
        >
          {total} học sinh
        </div>
      </div>
    </div>
  )
}

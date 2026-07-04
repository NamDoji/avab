'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'

interface Campus {
  id: string
  name: string
  code: string | null
}

interface Props {
  campuses: Campus[]
}

export default function CampusFilter({ campuses }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentCampusId = searchParams.get('campusId') ?? ''

  if (campuses.length === 0) return null

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set('campusId', value)
    } else {
      params.delete('campusId')
    }
    params.delete('page') // reset page on filter change
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <select
      value={currentCampusId}
      onChange={(e) => handleChange(e.target.value)}
      className="border border-gray-200 rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white min-w-[140px]"
      aria-label="Lọc theo cơ sở"
    >
      <option value="">🏢 Tất cả cơ sở</option>
      {campuses.map(campus => (
        <option key={campus.id} value={campus.id}>
          {campus.code ? `[${campus.code}] ` : ''}{campus.name}
        </option>
      ))}
    </select>
  )
}

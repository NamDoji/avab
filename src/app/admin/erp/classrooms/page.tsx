import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ClassroomActions, AddClassroomModal } from './ClassroomActions'

export const metadata = { title: 'Phòng học — School ERP' }

const typeIcon: Record<string, string> = {
  standard: '🏫',
  lab: '🔬',
  computer: '💻',
  music: '🎵',
  gym: '🏋️',
}

const typeLabel: Record<string, string> = {
  standard: 'Phòng thường',
  lab: 'Phòng thí nghiệm',
  computer: 'Phòng máy tính',
  music: 'Phòng âm nhạc',
  gym: 'Phòng thể dục',
}

export default async function ClassroomsPage() {
  const session = await auth()
  if (!session || !['ADMIN','SUPER_ADMIN'].includes((session.user as { role?: string })?.role ?? '')) redirect('/dang-nhap')

  const classrooms = await prisma.classRoom.findMany({
    orderBy: [{ building: 'asc' }, { floor: 'asc' }, { name: 'asc' }],
  })

  const totalCapacity = classrooms.reduce((sum, c) => sum + c.capacity, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div
        className="relative overflow-hidden text-white py-10"
        style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)' }}
      >
        <div
          className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'rgba(255,255,255,0.08)', transform: 'translate(25%, -50%)' }}
        />
        <div className="container-custom relative">
          <div className="flex items-center gap-2 text-cherry-200 text-sm mb-1">
            <Link href="/admin/erp" className="hover:text-white transition-colors">School ERP</Link>
            <span>/</span>
            <span>Phòng học</span>
          </div>
          <h1 className="text-3xl font-black mb-1">🏛️ Phòng học</h1>
          <div className="flex gap-6 mt-4">
            <div>
              <div className="text-2xl font-black text-white">{classrooms.length}</div>
              <div className="text-xs text-cherry-200">Tổng phòng</div>
            </div>
            <div>
              <div className="text-2xl font-black text-white">{totalCapacity}</div>
              <div className="text-xs text-cherry-200">Tổng chỗ ngồi</div>
            </div>
            <div>
              <div className="text-2xl font-black text-white">{classrooms.filter(c => c.isActive).length}</div>
              <div className="text-xs text-cherry-200">Đang hoạt động</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-6">
        {/* Action bar */}
        <div className="flex justify-end mb-5">
          <AddClassroomModal />
        </div>

        {classrooms.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <div className="text-4xl mb-3">🏛️</div>
            <p className="text-gray-500 font-semibold">Chưa có phòng học nào</p>
            <p className="text-gray-400 text-sm mt-1">Bắt đầu thêm phòng học đầu tiên</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {classrooms.map((room) => (
              <div
                key={room.id}
                className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
                style={{ border: room.isActive ? '1px solid #e0e7ff' : '1px solid #f3f4f6' }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{ background: '#eef2ff' }}
                  >
                    {typeIcon[room.type] ?? '🏫'}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {!room.isActive && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: '#f3f4f6', color: '#9ca3af' }}
                      >
                        Không hđ
                      </span>
                    )}
                    <ClassroomActions classroom={room} />
                  </div>
                </div>
                <h3 className="font-black text-gray-900 text-base mb-0.5">{room.name}</h3>
                <p className="text-xs text-gray-500 mb-2">{typeLabel[room.type] ?? room.type}</p>
                <div className="flex gap-3 text-xs text-gray-500">
                  <span>👥 {room.capacity} chỗ</span>
                  {room.floor !== null && <span>📍 Tầng {room.floor}</span>}
                  {room.building && <span>🏢 {room.building}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

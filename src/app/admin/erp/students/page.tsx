import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const metadata = { title: 'Học sinh — School ERP' }

export default async function StudentsPage() {
  const session = await auth()
  if (!session || (session.user as { role?: string })?.role !== 'ADMIN') redirect('/dang-nhap')

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="text-6xl mb-4">👥</div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">Học sinh</h1>
        <p className="text-gray-500 mb-6">
          Module đang được phát triển theo kiến trúc Multi-Campus của AvaB EOS.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            href="/admin/erp"
            className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-700 transition-colors"
          >
            ← ERP Hub
          </Link>
          <Link
            href="/admin/data-migration"
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-500 transition-colors"
          >
            📥 Import từ Excel
          </Link>
        </div>
      </div>
    </div>
  )
}

import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import Link from 'next/link'

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== 'TEACHER') {
    redirect('/dang-nhap')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-100 flex flex-col fixed left-0 top-0 h-full z-30 shadow-sm">
        {/* Logo */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-teal-500 rounded-xl flex items-center justify-center text-white font-black text-sm">A</div>
            <div>
              <p className="font-black text-gray-900 text-sm leading-tight">AvaB</p>
              <p className="text-xs text-teal-600 font-semibold">Giáo viên</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          <Link
            href="/giao-vien"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition"
          >
            <span className="text-base">📊</span> Dashboard
          </Link>
          <Link
            href="/giao-vien/buoi-hoc"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition"
          >
            <span className="text-base">📚</span> Buổi học của tôi
          </Link>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-700 truncate">{(session.user as any).name}</p>
          <p className="text-xs text-gray-400 truncate">{(session.user as any).phone}</p>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 ml-60">{children}</div>
    </div>
  )
}

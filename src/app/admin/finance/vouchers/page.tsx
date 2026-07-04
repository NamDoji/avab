import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import VouchersClient from './VouchersClient'

export const metadata = { title: 'Vouchers — AvaB Finance' }

export default async function VouchersPage() {
  const session = await auth()
  if (!session || (session.user as any)?.role !== 'ADMIN') redirect('/dang-nhap')

  const vouchers = await prisma.voucher.findMany({
    orderBy: { createdAt: 'desc' },
  })

  const activeCount = vouchers.filter(v => {
    const now = new Date()
    const expired = v.validTo && new Date(v.validTo) < now
    const maxed = v.maxUses !== null && v.usedCount >= v.maxUses
    return v.isActive && !expired && !maxed
  }).length

  const totalUsed = vouchers.reduce((sum, v) => sum + v.usedCount, 0)

  return (
    <main className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <div
        className="px-6 py-8"
        style={{ background: 'linear-gradient(135deg, #065f46 0%, #059669 100%)' }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/finance"
                className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition"
              >
                <ArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="text-2xl font-black text-white">🎫 Voucher Giảm Giá</h1>
                <p className="text-emerald-200 text-sm mt-0.5">
                  Quản lý mã khuyến mãi học phí
                </p>
              </div>
            </div>
            {/* Stats mini */}
            <div className="hidden sm:flex gap-4">
              <div className="bg-white/10 rounded-2xl px-4 py-2 text-center">
                <p className="text-emerald-200 text-xs font-semibold">Đang hoạt động</p>
                <p className="text-white font-black text-xl">{activeCount}</p>
              </div>
              <div className="bg-white/10 rounded-2xl px-4 py-2 text-center">
                <p className="text-emerald-200 text-xs font-semibold">Tổng lần dùng</p>
                <p className="text-white font-black text-xl">{totalUsed}</p>
              </div>
              <div className="bg-white/10 rounded-2xl px-4 py-2 text-center">
                <p className="text-emerald-200 text-xs font-semibold">Tổng voucher</p>
                <p className="text-white font-black text-xl">{vouchers.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <VouchersClient initialVouchers={vouchers} />
    </main>
  )
}

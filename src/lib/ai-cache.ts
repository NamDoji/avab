import { prisma } from '@/lib/prisma'

export const AI_REFRESH_DAYS = 14 // 2 tuần

export type AnalysisType = 'diagnose' | 'predict' | 'intervene' | 'recommend'

/**
 * Đọc cache cho 1 loại phân tích.
 * Trả về { cached: true, data, refreshedAt } hoặc { cached: false }
 */
export async function getAICache(userId: string, type: AnalysisType) {
  const cache = await prisma.aIAnalysisCache.findUnique({
    where: { userId_analysisType: { userId, analysisType: type } },
  })
  if (!cache) return { cached: false as const }
  return { cached: true as const, data: cache.data, refreshedAt: cache.refreshedAt }
}

const TOTAL_TABS = 4 // diagnose | predict | intervene | recommend

/**
 * Kiểm tra xem user có được phép refresh không.
 * - Nếu chưa có đủ 4 tab cache (đang khởi tạo lần đầu) → luôn cho phép
 * - Sau khi đủ 4 tab: kiểm tra 14 ngày
 */
export async function canRefresh(userId: string): Promise<
  { allowed: true } | { allowed: false; nextAt: Date; daysLeft: number }
> {
  // Cho phép nếu chưa khởi tạo đủ 4 tab
  const cacheCount = await prisma.aIAnalysisCache.count({ where: { userId } })
  if (cacheCount < TOTAL_TABS) return { allowed: true }

  // Đủ 4 tab: kiểm tra 14 ngày
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { aiRefreshedAt: true },
  })
  if (!user?.aiRefreshedAt) return { allowed: true }

  const msSince = Date.now() - user.aiRefreshedAt.getTime()
  const msWindow = AI_REFRESH_DAYS * 24 * 60 * 60 * 1000

  if (msSince >= msWindow) return { allowed: true }

  const nextAt = new Date(user.aiRefreshedAt.getTime() + msWindow)
  const daysLeft = Math.ceil((nextAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  return { allowed: false, nextAt, daysLeft }
}

/**
 * Lưu kết quả phân tích vào cache và cập nhật aiRefreshedAt trên user.
 */
export async function saveAICache(userId: string, type: AnalysisType, data: unknown) {
  const now = new Date()
  await Promise.all([
    prisma.aIAnalysisCache.upsert({
      where: { userId_analysisType: { userId, analysisType: type } },
      update: { data: data as any, refreshedAt: now },
      create: { userId, analysisType: type, data: data as any, refreshedAt: now },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { aiRefreshedAt: now },
    }),
  ])
}

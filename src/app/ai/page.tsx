import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AIPageContent } from '@/components/ai/AIPageContent'

export const metadata = {
  title: 'AI Học Tập — AvaB',
  description: 'AI cá nhân hoá lộ trình học, phân tích lỗi và đánh giá khả năng đỗ học bổng lớp 1.',
}

export default async function AIPage() {
  const session = await auth()
  if (!session) redirect('/dang-nhap')

  const userId = (session.user as any).id
  const userName = session.user?.name ?? 'bạn'

  return <AIPageContent userId={userId} userName={userName} />
}

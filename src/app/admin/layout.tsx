import { GlobalAIChat } from '@/components/admin/GlobalAIChat'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <GlobalAIChat />
    </>
  )
}

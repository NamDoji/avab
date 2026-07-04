import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getOrganizationContext } from '@/lib/organization'
import ApiPlatformClient from './ApiPlatformClient'

export const metadata = { title: '🔑 API Platform — AvaB Admin' }

export default async function ApiPlatformPage() {
  const session = await auth()
  if (!session || !['ADMIN','SUPER_ADMIN'].includes((session.user as { role?: string })?.role ?? '')) {
    redirect('/dang-nhap')
  }

  const userId = (session.user as { id?: string })?.id ?? ''
  const orgCtx = await getOrganizationContext(userId)

  const apiKeys = await prisma.apiKey.findMany({
    where: { organizationId: orgCtx?.id ?? 'none', isActive: true },
    orderBy: { createdAt: 'desc' },
  })

  // Serialise dates for client component
  const keys = apiKeys.map((k) => ({
    id: k.id,
    name: k.name,
    key: k.key,
    permissions: Array.isArray(k.permissions) ? (k.permissions as string[]) : [],
    lastUsedAt: k.lastUsedAt?.toISOString() ?? null,
    expiresAt: k.expiresAt?.toISOString() ?? null,
    createdAt: k.createdAt.toISOString(),
  }))

  return <ApiPlatformClient apiKeys={keys} orgId={orgCtx?.id ?? ''} />
}

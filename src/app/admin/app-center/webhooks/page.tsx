import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getOrganizationContext } from '@/lib/organization'
import WebhooksClient from './WebhooksClient'

export const metadata = { title: '🔗 Webhooks — AvaB Admin' }

export default async function WebhooksPage() {
  const session = await auth()
  if (!session || (session.user as { role?: string })?.role !== 'ADMIN') {
    redirect('/dang-nhap')
  }

  const userId = (session.user as { id?: string })?.id ?? ''
  const orgCtx = await getOrganizationContext(userId)

  const webhooks = await prisma.webhookEndpoint.findMany({
    where: { organizationId: orgCtx?.id ?? 'none' },
    orderBy: { createdAt: 'desc' },
  })

  const serialised = webhooks.map((w) => ({
    id: w.id,
    url: w.url,
    events: Array.isArray(w.events) ? (w.events as string[]) : [],
    isActive: w.isActive,
    lastDeliveredAt: w.lastDeliveredAt?.toISOString() ?? null,
    createdAt: w.createdAt.toISOString(),
  }))

  return <WebhooksClient webhooks={serialised} orgId={orgCtx?.id ?? ''} />
}

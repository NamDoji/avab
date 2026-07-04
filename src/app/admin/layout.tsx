import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { GlobalAIChat } from '@/components/admin/GlobalAIChat'
import { OrgSwitcher } from '@/components/admin/OrgSwitcher'
import { QuickActionDial } from '@/components/admin/QuickActionDial'
import NotificationBell from '@/components/admin/NotificationBell'
import { cookies } from 'next/headers'
import { CURRENT_ORG_COOKIE } from '@/lib/current-org'
import { getOrgTheme } from '@/lib/org-theme'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // ── Fetch user's orgs server-side ─────────────────────────────────────────
  const session = await auth()
  const userId = (session?.user as { id?: string })?.id ?? ''

  let allOrgs: { id: string; name: string; slug: string; type: string }[] = []
  let currentOrg: { id: string; name: string; slug: string; settings?: Record<string, unknown> } | null = null

  if (userId) {
    // Fetch OrganizationUser rows and join organizations separately
    const orgUsers = await prisma.organizationUser.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { joinedAt: 'asc' }],
    })

    if (orgUsers.length > 0) {
      const orgIds = orgUsers.map(ou => ou.organizationId)
      const orgs = await prisma.organization.findMany({
        where: { id: { in: orgIds }, isActive: true, deletedAt: null },
        select: { id: true, name: true, slug: true, type: true, settings: true },
      })

      // Preserve order from orgUsers (default first)
      const orgMap = new Map(orgs.map(o => [o.id, o]))
      allOrgs = orgUsers
        .map(ou => orgMap.get(ou.organizationId))
        .filter((o): o is typeof orgs[number] => o !== undefined)

      // Determine active org from cookie, falling back to first (default) org
      const cookieStore = await cookies()
      const cookieOrgId = cookieStore.get(CURRENT_ORG_COOKIE)?.value ?? null
      const cookieOrg = cookieOrgId ? allOrgs.find(o => o.id === cookieOrgId) : undefined
      currentOrg = cookieOrg ?? allOrgs[0] ?? null
    }
  }

  const orgSettings = (currentOrg?.settings && typeof currentOrg.settings === 'object' && !Array.isArray(currentOrg.settings))
    ? (currentOrg.settings as Record<string, unknown>)
    : {}
  const orgTheme = getOrgTheme(orgSettings)

  // ── Notification count for bell ────────────────────────────────────────
  const overdueThreshold = new Date(Date.now() - 30 * 86_400_000)
  const [pendingEnrollCount, newContactCount, overdueCount] = await Promise.all([
    prisma.enrollment.count({ where: { status: 'PENDING' } }),
    prisma.registration.count({ where: { status: 'NEW' } }),
    prisma.tuitionPayment.count({
      where: { isPaid: false, isFree: false, createdAt: { lt: overdueThreshold } },
    }),
  ])
  const notifCount = pendingEnrollCount + newContactCount + Math.min(overdueCount, 99)

  return (
    <div
      style={{
        '--org-primary': orgTheme.primaryColor,
        '--org-primary-rgb': `${parseInt(orgTheme.primaryColor.replace('#','').slice(0,2),16)}, ${parseInt(orgTheme.primaryColor.replace('#','').slice(2,4),16)}, ${parseInt(orgTheme.primaryColor.replace('#','').slice(4,6),16)}`,
      } as React.CSSProperties}
    >
      {/* ── Top-right bar: Notification bell + Org switcher ─────────── */}
      <div
        style={{
          position: 'fixed',
          top: 12,
          right: 16,
          zIndex: 500,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <NotificationBell initialCount={notifCount} />
        {allOrgs.length > 0 && (
          <OrgSwitcher currentOrg={currentOrg} allOrgs={allOrgs} />
        )}
      </div>

      {children}
      <QuickActionDial />
      <GlobalAIChat />
    </div>
  )
}

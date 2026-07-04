import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { GlobalAIChat } from '@/components/admin/GlobalAIChat'
import { OrgSwitcher } from '@/components/admin/OrgSwitcher'
import { cookies } from 'next/headers'
import { CURRENT_ORG_COOKIE } from '@/lib/current-org'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // ── Fetch user's orgs server-side ─────────────────────────────────────────
  const session = await auth()
  const userId = (session?.user as { id?: string })?.id ?? ''

  let allOrgs: { id: string; name: string; slug: string; type: string }[] = []
  let currentOrg: { id: string; name: string; slug: string } | null = null

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
        select: { id: true, name: true, slug: true, type: true },
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

  return (
    <>
      {/* ── Org switcher bar ────────────────────────────────────────────── */}
      {allOrgs.length > 0 && (
        <div
          style={{
            position: 'fixed',
            top: 12,
            right: 16,
            zIndex: 500,
          }}
        >
          <OrgSwitcher currentOrg={currentOrg} allOrgs={allOrgs} />
        </div>
      )}

      {children}
      <GlobalAIChat />
    </>
  )
}

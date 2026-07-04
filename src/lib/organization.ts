/**
 * Organization Context Helper
 * Central utility for multi-tenant data scoping.
 *
 * Usage in API routes / Server Components:
 *   const org = await getOrganizationContext(userId)
 *   const where = { ...org.filter }  // { organizationId: org.id }
 */

import { prisma } from './prisma'

export interface OrganizationContext {
  id: string
  name: string
  slug: string
  type: string
  modules: string[]
  settings: Record<string, unknown>
  /** Prisma where-clause filter — add to every org-scoped query */
  filter: { organizationId: string }
  /** Campus IDs the user belongs to */
  campusIds: string[]
  /** User's role within the org */
  orgRole: string
}

/**
 * Get organization context for the current authenticated user.
 * Returns null if user has no organization (platform super-admin or new user).
 */
export async function getOrganizationContext(
  userId: string,
): Promise<OrganizationContext | null> {
  const orgUser = await prisma.organizationUser.findFirst({
    where:   { userId, isDefault: true },
    include: { organization: true },
  })

  if (!orgUser) return null

  const campusUsers = await prisma.campusUser.findMany({
    where:  { userId },
    select: { campusId: true },
  })

  const org = orgUser.organization
  const modules = Array.isArray(org.modules) ? (org.modules as string[]) : []
  const settings = (org.settings && typeof org.settings === 'object' && !Array.isArray(org.settings))
    ? (org.settings as Record<string, unknown>)
    : {}

  return {
    id:        org.id,
    name:      org.name,
    slug:      org.slug,
    type:      org.type,
    modules,
    settings,
    filter:    { organizationId: org.id },
    campusIds: campusUsers.map(c => c.campusId),
    orgRole:   orgUser.orgRole,
  }
}

/**
 * Get organization from subdomain slug (for workspace routing).
 * e.g., "ob-school.avab.vn" → slug = "ob-school"
 */
export async function getOrganizationBySlug(
  slug: string,
): Promise<{ id: string; name: string; slug: string; settings: Record<string, unknown> } | null> {
  const org = await prisma.organization.findUnique({
    where:  { slug },
    select: { id: true, name: true, slug: true, settings: true, isActive: true, deletedAt: true },
  })

  if (!org || !org.isActive || org.deletedAt) return null

  return {
    id:       org.id,
    name:     org.name,
    slug:     org.slug,
    settings: (org.settings && typeof org.settings === 'object' && !Array.isArray(org.settings))
      ? (org.settings as Record<string, unknown>)
      : {},
  }
}

/**
 * Get organization from custom domain.
 * e.g., "newton.edu.vn" → lookup by Organization.domain
 */
export async function getOrganizationByDomain(
  domain: string,
): Promise<{ id: string; slug: string } | null> {
  const org = await prisma.organization.findFirst({
    where:  { domain, isActive: true, deletedAt: null },
    select: { id: true, slug: true },
  })
  return org
}

/**
 * Check if user has access to an organization.
 */
export async function userBelongsToOrg(
  userId: string,
  organizationId: string,
): Promise<boolean> {
  const count = await prisma.organizationUser.count({
    where: { userId, organizationId },
  })
  return count > 0
}

/**
 * Check if user has access to a campus.
 */
export async function userBelongsToCampus(
  userId: string,
  campusId: string,
): Promise<boolean> {
  const count = await prisma.campusUser.count({
    where: { userId, campusId },
  })
  return count > 0
}

/**
 * Scoping helpers — use in Prisma where clauses.
 * Returns org filter + optional campus filter.
 */
export function orgScope(organizationId: string) {
  return { organizationId }
}

export function campusScope(campusId: string) {
  return { campusId }
}

export function orgOrPublicScope(organizationId: string) {
  return {
    OR: [
      { organizationId },
      { organizationId: null },
    ],
  }
}

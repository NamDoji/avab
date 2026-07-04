// ── org-theme.ts ─────────────────────────────────────────────────────────────
// Read org branding from Organization.settings and provide typed helpers.

export interface OrgTheme {
  primaryColor: string
  logo: string | null
  welcomeMessage: string | null
  customDomain: string | null
  theme: 'light' | 'dark' | 'system'
  faviconUrl: string | null
}

export function getOrgTheme(settings: Record<string, unknown>): OrgTheme {
  return {
    primaryColor:   (settings.primaryColor  as string)  ?? '#7c3aed',
    logo:           (settings.logo          as string)  ?? null,
    welcomeMessage: (settings.welcomeMessage as string) ?? null,
    customDomain:   (settings.customDomain  as string)  ?? null,
    theme:          (['light','dark','system'].includes(settings.theme as string)
                      ? settings.theme as OrgTheme['theme']
                      : 'system'),
    faviconUrl:     (settings.faviconUrl    as string)  ?? null,
  }
}

/**
 * Convert a hex color to CSS rgb() triplet for use in rgba() expressions.
 * Returns "124, 58, 237" for "#7c3aed".
 */
export function hexToRgbTriplet(hex: string): string {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.slice(0, 2), 16)
  const g = parseInt(clean.slice(2, 4), 16)
  const b = parseInt(clean.slice(4, 6), 16)
  if (isNaN(r) || isNaN(g) || isNaN(b)) return '124, 58, 237'
  return `${r}, ${g}, ${b}`
}

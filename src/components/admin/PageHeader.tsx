import Link from 'next/link'
import React from 'react'

export interface BreadcrumbItem {
  label: string
  href: string
}

export interface PageHeaderProps {
  title: string
  subtitle?: string
  breadcrumb?: BreadcrumbItem[]
  actions?: React.ReactNode
  /** CSS gradient string, e.g. 'linear-gradient(135deg, #7c2d12 0%, #c2410c 100%)' */
  gradient?: string
  /** Emoji icon displayed before title */
  icon?: string
}

/**
 * Consistent page header used across all admin pages.
 * Server component — no client-side state needed.
 */
export default function PageHeader({
  title,
  subtitle,
  breadcrumb,
  actions,
  gradient = 'linear-gradient(135deg, #1e1b4b 0%, #3730a3 100%)',
  icon,
}: PageHeaderProps) {
  return (
    <div
      className="relative overflow-hidden text-white pt-20 pb-10"
      style={{ background: gradient }}
    >
      {/* Decorative blobs */}
      <div
        className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: 'rgba(255,255,255,0.06)', transform: 'translate(30%, -50%)' }}
      />
      <div
        className="absolute bottom-0 left-0 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: 'rgba(255,255,255,0.04)', transform: 'translate(-25%, 50%)' }}
      />

      <div className="container-custom relative">
        {/* Breadcrumb */}
        {breadcrumb && breadcrumb.length > 0 && (
          <nav className="flex items-center gap-1.5 text-white/60 text-sm mb-3 flex-wrap">
            {breadcrumb.map((crumb, i) => (
              <React.Fragment key={crumb.href}>
                {i > 0 && <span className="text-white/40">/</span>}
                <Link
                  href={crumb.href}
                  className="hover:text-white transition-colors font-semibold"
                >
                  {crumb.label}
                </Link>
              </React.Fragment>
            ))}
            <span className="text-white/40">/</span>
            <span className="text-white font-bold">{title}</span>
          </nav>
        )}

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black leading-tight">
              {icon && <span className="mr-2">{icon}</span>}
              {title}
            </h1>
            {subtitle && (
              <p className="text-white/70 text-sm mt-1 leading-relaxed">{subtitle}</p>
            )}
          </div>

          {actions && (
            <div className="flex items-center gap-2 flex-wrap shrink-0">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

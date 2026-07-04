import React from 'react'

export interface LoadingSkeletonProps {
  rows?: number
  type?: 'table' | 'card' | 'list'
  className?: string
}

/**
 * Reusable skeleton loading component for admin pages.
 * Adapts appearance based on the `type` prop to match the expected content.
 */
export default function LoadingSkeleton({
  rows = 5,
  type = 'list',
  className = '',
}: LoadingSkeletonProps) {
  if (type === 'card') {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="rounded-3xl bg-gray-200 animate-pulse"
            style={{ height: 120, animationDelay: `${i * 80}ms` }}
          />
        ))}
      </div>
    )
  }

  if (type === 'table') {
    return (
      <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden ${className}`}>
        {/* Table header skeleton */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex gap-4">
          {[40, 20, 15, 25].map((w, i) => (
            <div
              key={i}
              className="h-3 bg-gray-200 rounded-full animate-pulse"
              style={{ width: `${w}%`, animationDelay: `${i * 60}ms` }}
            />
          ))}
        </div>
        {/* Table rows skeleton */}
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="px-6 py-4 border-b border-gray-50 flex gap-4 items-center"
          >
            <div
              className="h-3 bg-gray-100 rounded-full animate-pulse"
              style={{ width: '40%', animationDelay: `${i * 80}ms` }}
            />
            <div
              className="h-3 bg-gray-100 rounded-full animate-pulse"
              style={{ width: '20%', animationDelay: `${i * 80 + 30}ms` }}
            />
            <div
              className="h-3 bg-gray-100 rounded-full animate-pulse"
              style={{ width: '15%', animationDelay: `${i * 80 + 60}ms` }}
            />
            <div
              className="h-3 bg-gray-100 rounded-full animate-pulse ml-auto"
              style={{ width: '12%', animationDelay: `${i * 80 + 90}ms` }}
            />
          </div>
        ))}
      </div>
    )
  }

  // Default: list type
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3"
        >
          <div
            className="w-10 h-10 rounded-xl bg-gray-200 animate-pulse shrink-0"
            style={{ animationDelay: `${i * 80}ms` }}
          />
          <div className="flex-1 space-y-1.5">
            <div
              className="h-3 bg-gray-200 rounded-full animate-pulse"
              style={{ width: `${60 + (i % 3) * 15}%`, animationDelay: `${i * 80 + 30}ms` }}
            />
            <div
              className="h-2.5 bg-gray-100 rounded-full animate-pulse"
              style={{ width: `${40 + (i % 4) * 10}%`, animationDelay: `${i * 80 + 60}ms` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

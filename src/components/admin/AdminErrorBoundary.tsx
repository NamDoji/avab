'use client'

import React from 'react'
import Link from 'next/link'

interface Props {
  children: React.ReactNode
}

interface State {
  hasError: boolean
  errorMessage: string
  errorId: string
}

/**
 * AdminErrorBoundary — catches unhandled React render errors in the admin area.
 * Displays a friendly fallback UI with error details and recovery options.
 */
export default class AdminErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      errorMessage: '',
      errorId: '',
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMessage: error?.message ?? 'Unknown error',
      errorId: `err-${Date.now().toString(36)}`,
    }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log to console for debugging; in production connect to Sentry / logging service
    console.error('[AdminErrorBoundary] Caught error:', error, info.componentStack)
  }

  handleReset = () => {
    this.setState({ hasError: false, errorMessage: '', errorId: '' })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen pt-20 bg-gray-50 flex items-start justify-center p-6">
          <div className="max-w-lg w-full">
            <div className="bg-white rounded-3xl shadow-xl border border-red-100 overflow-hidden">
              {/* Red accent bar */}
              <div
                className="h-2 w-full"
                style={{ background: 'linear-gradient(90deg, #dc2626, #f97316)' }}
              />

              <div className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center text-2xl">
                    ⚠️
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-gray-900">Đã xảy ra lỗi</h2>
                    <p className="text-sm text-gray-500">Trang không thể hiển thị</p>
                  </div>
                </div>

                <div className="bg-red-50 rounded-2xl p-4 mb-6">
                  <p className="text-sm font-mono text-red-700 break-words leading-relaxed">
                    {this.state.errorMessage}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">ID: {this.state.errorId}</p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={this.handleReset}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition-colors"
                  >
                    🔄 Thử lại
                  </button>
                  <Link
                    href="/admin"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 transition-colors"
                  >
                    🏠 Về Dashboard
                  </Link>
                  <button
                    onClick={() => window.location.reload()}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 transition-colors"
                  >
                    ↺ Tải lại trang
                  </button>
                </div>

                <p className="text-xs text-gray-400 mt-5 leading-relaxed">
                  Nếu lỗi vẫn tiếp diễn, hãy liên hệ đội kỹ thuật AvaB và cung cấp Error ID: {' '}
                  <span className="font-mono font-bold">{this.state.errorId}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

'use client'

import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-[200px] p-8">
          <div className="text-center max-w-md">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-lg font-semibold text-slate-800 mb-2">页面出错了</h2>
            <p className="text-sm text-slate-500 mb-4">
              {this.state.error?.message || '发生未知错误'}
            </p>
            <button
              className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700"
              onClick={() => {
                this.setState({ hasError: false, error: null })
                window.location.reload()
              }}
            >
              重新加载
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

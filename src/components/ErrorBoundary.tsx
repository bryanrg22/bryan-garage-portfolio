import { Component } from 'react'
import type { ReactNode, ErrorInfo } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('3D scene error:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex h-screen w-screen flex-col items-center justify-center bg-garage-dark text-center">
            <h2 className="font-serif text-2xl text-golden">
              Garage is warming up...
            </h2>
            <p className="mt-3 max-w-sm text-sm text-stone">
              Your browser couldn't load the 3D scene. Try refreshing, or use a
              browser with WebGL support (Chrome, Firefox, Edge).
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 rounded-full border border-golden/30 px-6 py-2 text-sm text-golden transition-colors hover:border-golden hover:bg-golden/10"
            >
              Refresh
            </button>
          </div>
        )
      )
    }

    return this.props.children
  }
}

import { Component, Suspense, type ReactNode } from 'react'

class AssetErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: unknown) {
    console.warn('[scene] a 3D asset failed to load and was skipped:', error)
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}

/**
 * Suspense + an error boundary scoped to ONE asset (model, texture, SVG).
 * Without it, a single 404 or network blip on any decorative model propagated
 * to the top-level ErrorBoundary and replaced the entire garage with the
 * "couldn't load the 3D scene" fallback (verified with a deliberately deleted
 * model). Now the failed asset just doesn't render and the rest of the scene
 * — and the loading screen, since three's LoadingManager still ends the item —
 * carries on. The top-level boundary still handles real WebGL failures.
 */
export default function AssetSuspense({ children }: { children: ReactNode }) {
  return (
    <AssetErrorBoundary>
      <Suspense fallback={null}>{children}</Suspense>
    </AssetErrorBoundary>
  )
}

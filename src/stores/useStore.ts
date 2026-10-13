import { create } from 'zustand'
import type { PortfolioItem } from '../data/portfolio'
import type { QualityConfig } from '../lib/gpuTier'
import { defaultQuality, detectionPromise, IS_MOBILE } from '../lib/gpuTier'
import { trackEvent, setUserProps } from '../lib/analytics'

interface GarageStore {
  activeItem: PortfolioItem | null
  hasInteracted: boolean
  /** WebGL context created (Canvas onCreated fired). */
  isLoaded: boolean
  /** Every shader in the fully-loaded scene is compiled — safe to reveal. */
  isCompiled: boolean
  isMusicPlaying: boolean
  isMobileNavOpen: boolean
  isBottomSheetExpanded: boolean
  qualityConfig: QualityConfig
  /** Final tier known — the Canvas waits for this so it mounts exactly once. */
  qualityResolved: boolean
  isRoomDirty: boolean
  setRoomDirty: (dirty: boolean) => void
  setActiveItem: (item: PortfolioItem | null, source?: 'mobile_tab' | '3d_click') => void
  setHasInteracted: () => void
  setIsLoaded: () => void
  setIsCompiled: () => void
  setMusicPlaying: (playing: boolean) => void
  setMobileNavOpen: (open: boolean) => void
  setBottomSheetExpanded: (expanded: boolean) => void
}

export const useStore = create<GarageStore>((set, get) => ({
  activeItem: null,
  hasInteracted: false,
  isLoaded: false,
  isCompiled: false,
  isMusicPlaying: false,
  isMobileNavOpen: false,
  isBottomSheetExpanded: false,
  qualityConfig: defaultQuality,
  // Mobile picks its tier synchronously; desktop waits on detect-gpu.
  qualityResolved: IS_MOBILE,
  isRoomDirty: false,
  setRoomDirty: (dirty) => set({ isRoomDirty: dirty }),
  setActiveItem: (item, source) => {
    const prev = get().activeItem
    if (item) {
      trackEvent('portfolio_item_viewed', {
        item_id: item.id,
        item_title: item.title,
        source: source ?? '3d_click',
      })
    } else if (prev) {
      trackEvent('portfolio_item_closed', {
        item_id: prev.id,
        item_title: prev.title,
      })
    }
    set({ activeItem: item })
  },
  setHasInteracted: () => set({ hasInteracted: true }),
  setIsLoaded: () => set({ isLoaded: true }),
  setIsCompiled: () => set({ isCompiled: true }),
  setMusicPlaying: (playing) => set({ isMusicPlaying: playing }),
  setMobileNavOpen: (open) => set({ isMobileNavOpen: open }),
  setBottomSheetExpanded: (expanded) => set({ isBottomSheetExpanded: expanded }),
}))

detectionPromise.then((config) => {
  useStore.setState({ qualityConfig: config, qualityResolved: true })
  setUserProps({ gpu_tier: config.tier })
})

// Dev-only: expose the store for debugging/manual testing in the console
if (import.meta.env.DEV) {
  ;(window as Window & { __store?: typeof useStore }).__store = useStore
  import('@react-three/drei').then((m) => {
    ;(window as Window & { __progress?: unknown }).__progress = m.useProgress
  })
}

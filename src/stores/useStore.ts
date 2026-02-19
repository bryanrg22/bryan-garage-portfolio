import { create } from 'zustand'
import type { PortfolioItem } from '../data/portfolio'
import type { QualityConfig } from '../lib/gpuTier'
import { defaultQuality, detectionPromise } from '../lib/gpuTier'
import { trackEvent, setUserProps } from '../lib/analytics'

interface GarageStore {
  activeItem: PortfolioItem | null
  hasInteracted: boolean
  isLoaded: boolean
  isMusicPlaying: boolean
  isMobileNavOpen: boolean
  isBottomSheetExpanded: boolean
  qualityConfig: QualityConfig
  setActiveItem: (item: PortfolioItem | null, source?: 'mobile_tab' | '3d_click') => void
  setHasInteracted: () => void
  setIsLoaded: () => void
  setMusicPlaying: (playing: boolean) => void
  setMobileNavOpen: (open: boolean) => void
  setBottomSheetExpanded: (expanded: boolean) => void
}

export const useStore = create<GarageStore>((set, get) => ({
  activeItem: null,
  hasInteracted: false,
  isLoaded: false,
  isMusicPlaying: false,
  isMobileNavOpen: false,
  isBottomSheetExpanded: false,
  qualityConfig: defaultQuality,
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
  setMusicPlaying: (playing) => set({ isMusicPlaying: playing }),
  setMobileNavOpen: (open) => set({ isMobileNavOpen: open }),
  setBottomSheetExpanded: (expanded) => set({ isBottomSheetExpanded: expanded }),
}))

detectionPromise.then((config) => {
  useStore.setState({ qualityConfig: config })
  setUserProps({ gpu_tier: config.tier })
})

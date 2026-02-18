import { create } from 'zustand'
import type { PortfolioItem } from '../data/portfolio'
import type { QualityConfig } from '../lib/gpuTier'
import { defaultQuality, detectionPromise } from '../lib/gpuTier'

interface GarageStore {
  activeItem: PortfolioItem | null
  hasInteracted: boolean
  isLoaded: boolean
  isMusicPlaying: boolean
  isMobileNavOpen: boolean
  isBottomSheetExpanded: boolean
  qualityConfig: QualityConfig
  setActiveItem: (item: PortfolioItem | null) => void
  setHasInteracted: () => void
  setIsLoaded: () => void
  setMusicPlaying: (playing: boolean) => void
  setMobileNavOpen: (open: boolean) => void
  setBottomSheetExpanded: (expanded: boolean) => void
}

export const useStore = create<GarageStore>((set) => ({
  activeItem: null,
  hasInteracted: false,
  isLoaded: false,
  isMusicPlaying: false,
  isMobileNavOpen: false,
  isBottomSheetExpanded: false,
  qualityConfig: defaultQuality,
  setActiveItem: (item) => set({ activeItem: item }),
  setHasInteracted: () => set({ hasInteracted: true }),
  setIsLoaded: () => set({ isLoaded: true }),
  setMusicPlaying: (playing) => set({ isMusicPlaying: playing }),
  setMobileNavOpen: (open) => set({ isMobileNavOpen: open }),
  setBottomSheetExpanded: (expanded) => set({ isBottomSheetExpanded: expanded }),
}))

detectionPromise.then((config) => {
  useStore.setState({ qualityConfig: config })
})

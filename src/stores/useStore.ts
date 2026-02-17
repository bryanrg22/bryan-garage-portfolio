import { create } from 'zustand'
import type { PortfolioItem } from '../data/portfolio'

interface GarageStore {
  activeItem: PortfolioItem | null
  hasInteracted: boolean
  isLoaded: boolean
  isMusicPlaying: boolean
  isMobileNavOpen: boolean
  setActiveItem: (item: PortfolioItem | null) => void
  setHasInteracted: () => void
  setIsLoaded: () => void
  setMusicPlaying: (playing: boolean) => void
  setMobileNavOpen: (open: boolean) => void
}

export const useStore = create<GarageStore>((set) => ({
  activeItem: null,
  hasInteracted: false,
  isLoaded: false,
  isMusicPlaying: false,
  isMobileNavOpen: false,
  setActiveItem: (item) => set({ activeItem: item }),
  setHasInteracted: () => set({ hasInteracted: true }),
  setIsLoaded: () => set({ isLoaded: true }),
  setMusicPlaying: (playing) => set({ isMusicPlaying: playing }),
  setMobileNavOpen: (open) => set({ isMobileNavOpen: open }),
}))

import { useSyncExternalStore } from 'react'
import { useStore } from '../../stores/useStore'
import { useIsMobile } from '../../hooks/useIsMobile'
import { portfolioItems } from '../../data/portfolio'

// Portrait-only check: hide tab bar in landscape
const portraitQuery = '(orientation: portrait)'
function subscribePortrait(cb: () => void) {
  const mql = window.matchMedia(portraitQuery)
  mql.addEventListener('change', cb)
  return () => mql.removeEventListener('change', cb)
}
function getPortrait() { return window.matchMedia(portraitQuery).matches }
function getPortraitServer() { return true }

function useIsPortrait() {
  return useSyncExternalStore(subscribePortrait, getPortrait, getPortraitServer)
}

const tabs = [
  { id: '_home', label: 'Home', icon: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M3 10l7-7 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 8.5V16a1 1 0 001 1h8a1 1 0 001-1V8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) },
  { id: 'projects', label: 'Projects', icon: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="4" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 17h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M10 14v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ) },
  { id: 'education', label: 'Edu', icon: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 2L1 7l9 5 9-5-9-5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M4 9v5c0 1.7 2.7 3 6 3s6-1.3 6-3V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) },
  { id: 'skills', label: 'Skills', icon: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M14.5 6.5L17 4M17 4l-1-3M17 4l3-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.5 10.5l-7 7a1.4 1.4 0 002 2l7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.5 8.5l-2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ) },
  { id: 'experience', label: 'Work', icon: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="6" width="16" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 6V4.5A1.5 1.5 0 018.5 3h3A1.5 1.5 0 0113 4.5V6" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ) },
  { id: 'awards', label: 'Awards', icon: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 11.5L6 18l4-2 4 2-1-6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) },
  { id: 'hackathons', label: 'Hacks', icon: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M6 3v4l-3 4h14l-3-4V3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 14v3h12v-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) },
  { id: 'about', label: 'About', icon: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 9v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="10" cy="6.5" r="0.75" fill="currentColor" />
    </svg>
  ) },
  { id: 'cultura', label: 'Cultura', icon: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="5" width="14" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <line x1="7.7" y1="5" x2="7.7" y2="15" stroke="currentColor" strokeWidth="1.5" />
      <line x1="12.3" y1="5" x2="12.3" y2="15" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ) },
  { id: 'soccer', label: 'Soccer', icon: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 2.5v3l3 2 3-1M10 2.5l-3 4.5-1 3.5M17 9l-4 .5-2 3M13 7.5l-2 5M6 7l4.5 0M5 10.5l5 2M6.5 17l.5-3.5 3 0M13.5 12.5l1 4.5M10 17v-4.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
    </svg>
  ) },
  { id: 'boombox', label: 'Music', icon: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M7 17V6l10-3v11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="5" cy="17" r="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="15" cy="14" r="2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ) },
]

export default function MobileTabBar() {
  const isMobile = useIsMobile()
  const isPortrait = useIsPortrait()
  const activeItem = useStore((s) => s.activeItem)
  const setActiveItem = useStore((s) => s.setActiveItem)
  const setHasInteracted = useStore((s) => s.setHasInteracted)

  // Only show in mobile portrait
  if (!isMobile || !isPortrait) return null

  return (
    <nav className="pointer-events-auto fixed bottom-0 left-0 right-0 z-[46] border-t border-golden/10 bg-garage-dark/95 backdrop-blur-xl">
      <div className="relative">
        <div className="scrollbar-hide flex overflow-x-auto" style={{ height: 72 }}>
          {tabs.map((tab) => {
            const isHome = tab.id === '_home'
            const isActive = isHome ? activeItem === null : activeItem?.id === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (isHome) {
                    // Home tab resets camera to default
                    setActiveItem(null)
                  } else if (isActive) {
                    setActiveItem(null)
                  } else {
                    const item = portfolioItems.find((p) => p.id === tab.id)
                    if (item) {
                      setActiveItem(item)
                      setHasInteracted()
                    }
                  }
                }}
                className={`flex min-w-[64px] flex-1 flex-col items-center justify-center gap-1 px-1.5 transition-colors ${
                  isActive ? 'text-golden' : 'text-stone/60'
                }`}
              >
                {tab.icon}
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            )
          })}
        </div>
        {/* Right fade gradient to hint at scrollability */}
        <div className="pointer-events-none absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-garage-dark/95 to-transparent" />
      </div>
      {/* Safe area spacer for iPhone home indicator */}
      <div className="bg-garage-dark/95" style={{ height: 'env(safe-area-inset-bottom, 0px)' }} />
    </nav>
  )
}

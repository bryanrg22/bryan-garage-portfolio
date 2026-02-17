import { useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useStore } from '../../stores/useStore'
import { useIsMobile } from '../../hooks/useIsMobile'
import { portfolioItems } from '../../data/portfolio'

const boomboxItem = portfolioItems.find((item) => item.id === 'boombox')!

export default function SpotifyPlayer() {
  const activeItem = useStore((s) => s.activeItem)
  const setActiveItem = useStore((s) => s.setActiveItem)
  const isMusicPlaying = useStore((s) => s.isMusicPlaying)
  const setMusicPlaying = useStore((s) => s.setMusicPlaying)
  const isMobile = useIsMobile()

  const isBoomboxActive = activeItem?.id === 'boombox'

  // Auto-activate music when boombox panel opens
  useEffect(() => {
    if (isBoomboxActive) {
      setMusicPlaying(true)
    }
  }, [isBoomboxActive, setMusicPlaying])

  if (!isMusicPlaying) return null

  return (
    <>
      {/* Single persistent iframe — never remounts so audio keeps playing.
           Wrapper is pointer-events:none so the InfoPanel close button stays clickable. */}
      <div
        style={
          isBoomboxActive
            ? isMobile
              ? {
                  position: 'fixed',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '60vh',
                  zIndex: 50,
                  pointerEvents: 'none',
                  overflow: 'hidden',
                }
              : {
                  position: 'fixed',
                  top: 0,
                  right: 0,
                  width: '420px',
                  height: '100%',
                  zIndex: 50,
                  pointerEvents: 'none',
                }
            : {
                position: 'fixed',
                left: '-9999px',
                width: '1px',
                height: '1px',
                overflow: 'hidden',
              }
        }
      >
        <iframe
          src="https://open.spotify.com/embed/playlist/2P01xzxu2aDgDdCZeQLQf1?theme=0"
          width="100%"
          height="100%"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          style={
            isBoomboxActive
              ? isMobile
                ? {
                    position: 'absolute',
                    top: '80px',
                    left: '0',
                    right: '0',
                    bottom: '0',
                    borderRadius: '12px 12px 0 0',
                    pointerEvents: 'auto',
                  }
                : {
                    position: 'absolute',
                    top: '160px',
                    left: '32px',
                    right: '32px',
                    bottom: '32px',
                    width: 'calc(100% - 64px)',
                    height: 'calc(100% - 192px)',
                    borderRadius: '12px',
                    pointerEvents: 'auto',
                  }
              : undefined
          }
        />
      </div>

      {/* Now Playing pill — visible when music plays but boombox panel is closed */}
      <AnimatePresence>
        {isMusicPlaying && !isBoomboxActive && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`pointer-events-auto fixed z-50 flex items-center gap-2 rounded-full border border-golden/20 bg-garage-dark/95 px-4 py-2.5 shadow-lg backdrop-blur-sm ${
              isMobile ? 'bottom-20 left-4' : 'bottom-6 left-6'
            }`}
          >
            <button
              onClick={() => setActiveItem(boomboxItem)}
              className="flex items-center gap-2 text-sm text-golden transition-colors hover:text-golden-deep"
            >
              <span className="text-base">♫</span>
              <span className="font-sans text-xs font-medium">Now Playing</span>
            </button>
            <button
              onClick={() => setMusicPlaying(false)}
              className="ml-1 flex h-5 w-5 items-center justify-center rounded-full text-stone transition-colors hover:bg-cream/10 hover:text-cream"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 2l6 6M8 2L2 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

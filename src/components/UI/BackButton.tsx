import { AnimatePresence, motion } from 'motion/react'
import { useStore } from '../../stores/useStore'
import { useIsMobile } from '../../hooks/useIsMobile'

export default function BackButton() {
  const activeItem = useStore((s) => s.activeItem)
  const setActiveItem = useStore((s) => s.setActiveItem)
  const isMobile = useIsMobile()

  if (isMobile) return null

  return (
    <AnimatePresence>
      {activeItem && (
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          onClick={() => setActiveItem(null)}
          className="pointer-events-auto fixed top-16 left-6 z-40 flex items-center gap-2 rounded-full border border-golden/20 bg-garage-dark/80 px-4 py-2 text-sm text-golden backdrop-blur-sm transition-colors hover:border-golden/50 hover:bg-garage-dark"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M9 2L4 7l5 5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back to Garage
        </motion.button>
      )}
    </AnimatePresence>
  )
}

import { AnimatePresence, motion } from 'motion/react'
import { useStore } from '../../stores/useStore'
import { useIsMobile } from '../../hooks/useIsMobile'
import { useIsPortrait } from '../../hooks/useIsPortrait'

export default function HintText() {
  const activeItem = useStore((s) => s.activeItem)
  const hasInteracted = useStore((s) => s.hasInteracted)
  const isMobile = useIsMobile()
  const isPortrait = useIsPortrait()
  // Hide in landscape — tab bar is also hidden there
  const showHint = activeItem === null && !(isMobile && !isPortrait)

  return (
    <AnimatePresence>
      {showHint && (
        <motion.div
          key="hint"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.5, delay: hasInteracted ? 0.5 : 1.5 }}
          className={`pointer-events-none fixed left-1/2 z-30 -translate-x-1/2 ${isMobile ? 'bottom-24' : 'bottom-8'}`}
        >
          <p className="text-sm tracking-wide text-stone/70">
            {isMobile ? 'Tap on objects to explore' : 'Click on objects to explore'}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

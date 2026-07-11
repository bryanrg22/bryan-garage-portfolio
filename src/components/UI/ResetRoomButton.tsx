import { AnimatePresence, motion } from 'motion/react'
import { useStore } from '../../stores/useStore'
import { resetRoom } from '../../lib/ballWorld'
import { trackEvent } from '../../lib/analytics'

/**
 * Appears once the soccer ball (or anything it knocked over) is out of
 * place. One click and the ghost mechanic tidies everything back up.
 */
export default function ResetRoomButton() {
  const dirty = useStore((s) => s.isRoomDirty)

  return (
    <AnimatePresence>
      {dirty && (
        <motion.button
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.25 }}
          onClick={() => {
            trackEvent('room_reset')
            resetRoom()
          }}
          className="pointer-events-auto fixed bottom-24 right-4 z-[46] flex items-center gap-2 rounded-full border border-golden/30 bg-garage-dark/90 px-4 py-2 text-sm text-golden shadow-lg backdrop-blur-md transition-colors hover:bg-golden/10 md:right-6"
        >
          <span aria-hidden="true">🧹</span> Tidy up the shop
        </motion.button>
      )}
    </AnimatePresence>
  )
}

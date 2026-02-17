import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { useStore } from '../../stores/useStore'

export default function LoadingScreen() {
  const isLoaded = useStore((s) => s.isLoaded)
  const [show, setShow] = useState(true)
  const [fakeProgress, setFakeProgress] = useState(0)

  // Animate progress bar while waiting for actual scene render
  useEffect(() => {
    if (isLoaded) {
      // Scene confirmed rendering — fill to 100% then dismiss
      setFakeProgress(100)
      const timer = setTimeout(() => setShow(false), 800)
      return () => clearTimeout(timer)
    }

    // Slow fake progress to ~90% while loading
    const interval = setInterval(() => {
      setFakeProgress((p) => {
        if (p >= 90) return 90
        return p + (90 - p) * 0.08
      })
    }, 100)
    return () => clearInterval(interval)
  }, [isLoaded])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-garage-dark"
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-serif text-2xl text-golden"
          >
            Opening the garage door...
          </motion.h2>

          <div className="mt-6 h-0.5 w-48 overflow-hidden rounded-full bg-garage-mid">
            <motion.div
              className="h-full rounded-full bg-golden"
              animate={{ width: `${fakeProgress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ delay: 0.5 }}
            className="mt-3 text-xs text-stone"
          >
            {Math.round(fakeProgress)}%
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

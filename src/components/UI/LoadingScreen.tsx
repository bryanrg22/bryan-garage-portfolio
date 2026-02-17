import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { useProgress } from '@react-three/drei'
import { useStore } from '../../stores/useStore'

export default function LoadingScreen() {
  const isLoaded = useStore((s) => s.isLoaded)
  const progress = useProgress((s) => s.progress)
  const [show, setShow] = useState(true)

  // Dismiss when assets are loaded AND WebGL context is ready
  useEffect(() => {
    if (progress >= 100 && isLoaded) {
      const timer = setTimeout(() => setShow(false), 800)
      return () => clearTimeout(timer)
    }
  }, [progress, isLoaded])

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
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ delay: 0.5 }}
            className="mt-3 text-xs text-stone"
          >
            {Math.round(progress)}%
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

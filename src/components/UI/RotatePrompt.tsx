import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'motion/react'

const STORAGE_KEY = 'rotatePromptDismissed'

function useShowRotatePrompt() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY)) return

    const mql = window.matchMedia('(orientation: portrait) and (max-width: 767px)')
    if (mql.matches) setShow(true)

    const onChange = (e: MediaQueryListEvent) => {
      if (!e.matches) setShow(false)
    }
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return [show, setShow] as const
}

export default function RotatePrompt() {
  const [show, setShow] = useShowRotatePrompt()

  const dismiss = useCallback(() => {
    setShow(false)
    sessionStorage.setItem(STORAGE_KEY, 'true')
  }, [setShow])

  // Auto-dismiss after 4s
  useEffect(() => {
    if (!show) return
    const timer = setTimeout(dismiss, 4000)
    return () => clearTimeout(timer)
  }, [show, dismiss])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={dismiss}
          className="pointer-events-auto fixed inset-0 z-[110] flex flex-col items-center justify-center gap-6 bg-garage-dark/95 backdrop-blur-md"
        >
          {/* Rotating phone icon */}
          <div className="relative h-20 w-20">
            <svg
              viewBox="0 0 80 80"
              fill="none"
              className="h-full w-full"
              style={{ animation: 'rotatePhone 2s ease-in-out infinite' }}
            >
              <rect x="24" y="8" width="32" height="56" rx="4" stroke="#F4C963" strokeWidth="2.5" />
              <circle cx="40" cy="56" r="2" fill="#F4C963" />
              <line x1="34" y1="12" x2="46" y2="12" stroke="#F4C963" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>

          <div className="flex flex-col items-center gap-2 px-8 text-center">
            <p className="font-serif text-lg text-golden">Rotate your phone</p>
            <p className="text-sm text-stone">for a better experience</p>
            <p className="mt-2 text-xs text-stone/60">
              Explore on desktop for the best experience
            </p>
          </div>

          <p className="mt-4 text-xs text-stone/40">Tap anywhere to dismiss</p>

          <style>{`
            @keyframes rotatePhone {
              0%, 100% { transform: rotate(0deg); }
              50% { transform: rotate(90deg); }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

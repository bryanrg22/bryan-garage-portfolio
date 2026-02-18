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
          {/* Phone → Desktop icon */}
          <div className="flex items-center gap-3">
            {/* Phone (small, faded) */}
            <svg width="32" height="52" viewBox="0 0 32 52" fill="none" className="opacity-40">
              <rect x="2" y="2" width="28" height="48" rx="4" stroke="#F4C963" strokeWidth="2" />
              <circle cx="16" cy="44" r="2" fill="#F4C963" />
              <line x1="11" y1="6" x2="21" y2="6" stroke="#F4C963" strokeWidth="1.5" strokeLinecap="round" />
            </svg>

            {/* Arrow */}
            <svg width="28" height="16" viewBox="0 0 28 16" fill="none" style={{ animation: 'arrowPulse 1.5s ease-in-out infinite' }}>
              <path d="M2 8h20M18 3l5 5-5 5" stroke="#F4C963" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>

            {/* Desktop monitor */}
            <svg width="56" height="52" viewBox="0 0 56 52" fill="none">
              <rect x="2" y="2" width="52" height="36" rx="3" stroke="#F4C963" strokeWidth="2" />
              <line x1="20" y1="38" x2="36" y2="38" stroke="#F4C963" strokeWidth="2" strokeLinecap="round" />
              <line x1="28" y1="38" x2="28" y2="46" stroke="#F4C963" strokeWidth="2" strokeLinecap="round" />
              <line x1="18" y1="46" x2="38" y2="46" stroke="#F4C963" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>

          <div className="flex flex-col items-center gap-2 px-8 text-center">
            <p className="font-serif text-lg text-golden">Explore on desktop</p>
            <p className="text-sm text-stone">for the best experience</p>
          </div>

          <p className="mt-4 text-xs text-stone/40">Tap anywhere to dismiss</p>

          <style>{`
            @keyframes arrowPulse {
              0%, 100% { opacity: 0.5; transform: translateX(0); }
              50% { opacity: 1; transform: translateX(4px); }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

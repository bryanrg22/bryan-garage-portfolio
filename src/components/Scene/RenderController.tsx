import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { useIsMobile } from '../../hooks/useIsMobile'

/**
 * Drives rendering in demand mode:
 * - Page Visibility API: invalidates once when tab becomes visible
 * - Mobile: continuous rAF loop keeps pulse animations running (pauses when tab hidden)
 */
export default function RenderController() {
  const invalidate = useThree((s) => s.invalidate)
  const isMobile = useIsMobile()

  // Page Visibility API — refresh scene when tab becomes visible
  useEffect(() => {
    const onVisibilityChange = () => {
      if (!document.hidden) {
        invalidate()
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [invalidate])

  // Mobile: 30fps invalidation for pulse animations (pauses when hidden)
  useEffect(() => {
    if (!isMobile) return

    const FRAME_INTERVAL = 1000 / 30 // 30fps — sine pulse looks identical, half the GPU work
    let rafId: number
    let lastTime = 0
    const loop = (time: number) => {
      if (!document.hidden && time - lastTime >= FRAME_INTERVAL) {
        lastTime = time
        invalidate()
      }
      rafId = requestAnimationFrame(loop)
    }
    rafId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafId)
  }, [isMobile, invalidate])

  return null
}

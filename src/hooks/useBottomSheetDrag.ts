import { useRef, useCallback, useState } from 'react'

type SnapState = 'full' | 'half' | 'dismissed'

interface UseBottomSheetDragOptions {
  onDismiss: () => void
  /** vh heights for each snap point */
  fullHeight?: number
  halfHeight?: number
  /** Minimum drag distance (px) to trigger a snap transition */
  snapThreshold?: number
  /** Minimum velocity (px/ms) for a fast swipe to trigger snap */
  velocityThreshold?: number
}

export function useBottomSheetDrag({
  onDismiss,
  fullHeight = 92,
  halfHeight = 70,
  snapThreshold = 60,
  velocityThreshold = 0.4,
}: UseBottomSheetDragOptions) {
  const [snapState, setSnapState] = useState<SnapState>('half')
  const [translateY, setTranslateY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const startY = useRef(0)
  const lastY = useRef(0)
  const lastTime = useRef(0)
  const velocity = useRef(0)
  const snapAtDragStart = useRef<SnapState>('half')

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    setIsDragging(true)
    startY.current = e.clientY
    lastY.current = e.clientY
    lastTime.current = Date.now()
    velocity.current = 0
    snapAtDragStart.current = snapState === 'dismissed' ? 'half' : snapState
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }, [snapState])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return
    const now = Date.now()
    const dt = now - lastTime.current
    if (dt > 0) {
      velocity.current = (e.clientY - lastY.current) / dt
    }
    lastY.current = e.clientY
    lastTime.current = now

    const delta = e.clientY - startY.current

    if (snapAtDragStart.current === 'full') {
      // From full: only allow dragging down (positive delta)
      setTranslateY(Math.max(0, delta))
    } else {
      // From half: allow both directions
      // Dragging up (negative delta) — add rubber-band resistance past the full-screen height difference
      const maxUpPx = (window.innerHeight * (fullHeight - halfHeight)) / 100
      if (delta < -maxUpPx) {
        const over = -delta - maxUpPx
        setTranslateY(-maxUpPx - over * 0.3)
      } else {
        setTranslateY(delta)
      }
    }
  }, [isDragging, fullHeight, halfHeight])

  const onPointerUp = useCallback(() => {
    if (!isDragging) return
    setIsDragging(false)

    const delta = lastY.current - startY.current
    const vel = velocity.current // positive = dragging down
    const fastDown = vel > velocityThreshold
    const fastUp = vel < -velocityThreshold

    if (snapAtDragStart.current === 'full') {
      // From full screen
      if (delta > snapThreshold || fastDown) {
        // Dragged down → snap to half
        setSnapState('half')
      }
      // else snap back to full
    } else {
      // From half screen
      if (delta < -snapThreshold || fastUp) {
        // Dragged up → snap to full
        setSnapState('full')
      } else if (delta > snapThreshold || fastDown) {
        // Dragged down → dismiss
        setSnapState('dismissed')
        onDismiss()
      }
      // else snap back to half
    }

    setTranslateY(0)
  }, [isDragging, snapThreshold, velocityThreshold, onDismiss])

  const reset = useCallback(() => {
    setTranslateY(0)
    setSnapState('half')
    setIsDragging(false)
  }, [])

  /** Current target height in vh based on snap state */
  const heightVh = snapState === 'full' ? fullHeight : halfHeight

  return {
    translateY,
    isDragging,
    snapState,
    heightVh,
    handleProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
    },
    reset,
  }
}

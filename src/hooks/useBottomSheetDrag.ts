import { useRef, useCallback, useState } from 'react'

interface UseBottomSheetDragOptions {
  onDismiss: () => void
  onExpand?: () => void
  dismissThreshold?: number
  expandThreshold?: number
}

export function useBottomSheetDrag({
  onDismiss,
  onExpand,
  dismissThreshold = 100,
  expandThreshold = 80,
}: UseBottomSheetDragOptions) {
  const [translateY, setTranslateY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const handleRef = useRef<HTMLDivElement>(null)
  const startY = useRef(0)
  const lastY = useRef(0)
  const lastTime = useRef(0)
  const velocity = useRef(0)

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    setIsDragging(true)
    startY.current = e.clientY
    lastY.current = e.clientY
    lastTime.current = Date.now()
    velocity.current = 0
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }, [])

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
    // Allow dragging down freely, limit upward drag
    if (isExpanded) {
      // When expanded, only allow dragging down
      setTranslateY(Math.max(0, delta))
    } else {
      setTranslateY(delta)
    }
  }, [isDragging, isExpanded])

  const onPointerUp = useCallback(() => {
    if (!isDragging) return
    setIsDragging(false)
    const delta = lastY.current - startY.current
    const fastSwipe = velocity.current > 0.5

    if (delta > dismissThreshold || fastSwipe) {
      // Dragged down enough or fast swipe down → dismiss
      onDismiss()
      setTranslateY(0)
      setIsExpanded(false)
    } else if (delta < -expandThreshold && !isExpanded) {
      // Dragged up enough → expand
      setIsExpanded(true)
      setTranslateY(0)
      onExpand?.()
    } else {
      // Snap back
      setTranslateY(0)
    }
  }, [isDragging, dismissThreshold, expandThreshold, isExpanded, onDismiss, onExpand])

  const reset = useCallback(() => {
    setTranslateY(0)
    setIsExpanded(false)
    setIsDragging(false)
  }, [])

  return {
    translateY,
    isDragging,
    isExpanded,
    handleRef,
    handleProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
    },
    reset,
  }
}

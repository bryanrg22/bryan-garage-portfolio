import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import { useStore } from '../../stores/useStore'
import { DEFAULT_CAMERA_POSITION, DEFAULT_CAMERA_TARGET } from '../../data/portfolio'
import { useIsMobile } from '../../hooks/useIsMobile'
import { useIsPortrait } from '../../hooks/useIsPortrait'

type CameraMode = 'idle' | 'animating' | 'focused'

// Mobile gets a pulled-back camera so more of the garage is visible in portrait
const MOBILE_CAMERA_POSITION: [number, number, number] = [
  DEFAULT_CAMERA_POSITION[0],
  DEFAULT_CAMERA_POSITION[1],
  DEFAULT_CAMERA_POSITION[2] + 2.5,
]

export default function CameraController() {
  const { camera } = useThree()
  const mode = useRef<CameraMode>('idle')
  const mouse = useRef({ x: 0, y: 0 })
  const smoothMouse = useRef({ x: 0, y: 0 })
  const velocity = useRef({ x: 0, y: 0 })
  const lastTouch = useRef({ x: 0, y: 0 })
  const lookAtTarget = useRef(new THREE.Vector3(...DEFAULT_CAMERA_TARGET))
  const basePosition = useRef(new THREE.Vector3(...DEFAULT_CAMERA_POSITION))
  const tweenRef = useRef<gsap.core.Timeline | null>(null)
  const isMobile = useIsMobile()

  const isPortrait = useIsPortrait()
  const activeItem = useStore((s) => s.activeItem)

  // Effective default position based on device — only zoom out in portrait
  const defaultPos = (isMobile && isPortrait) ? MOBILE_CAMERA_POSITION : DEFAULT_CAMERA_POSITION

  // Track mouse/touch position for parallax
  useEffect(() => {
    if (isMobile) {
      let tracking = false

      const onTouchStart = (e: TouchEvent) => {
        if (e.touches.length !== 1) return
        tracking = true
        const touch = e.touches[0]
        lastTouch.current.x = touch.clientX
        lastTouch.current.y = touch.clientY
        // Kill momentum when finger touches down
        velocity.current.x = 0
        velocity.current.y = 0
      }

      const onTouchMove = (e: TouchEvent) => {
        if (!tracking || e.touches.length !== 1) return
        const touch = e.touches[0]
        const dx = (touch.clientX - lastTouch.current.x) / window.innerWidth
        const dy = (touch.clientY - lastTouch.current.y) / window.innerHeight

        // Accumulate position (scaled for ~35deg horizontal, ~18deg vertical)
        mouse.current.x = Math.max(-1, Math.min(1, mouse.current.x - dx * 2.5))
        mouse.current.y = Math.max(-1, Math.min(1, mouse.current.y - dy * 2.5))

        // Track velocity for momentum
        velocity.current.x = -dx * 2.5
        velocity.current.y = -dy * 2.5

        lastTouch.current.x = touch.clientX
        lastTouch.current.y = touch.clientY
      }

      const onTouchEnd = () => {
        tracking = false
        // velocity is preserved — useFrame will apply inertia decay
      }

      window.addEventListener('touchstart', onTouchStart, { passive: true })
      window.addEventListener('touchmove', onTouchMove, { passive: true })
      window.addEventListener('touchend', onTouchEnd, { passive: true })
      return () => {
        window.removeEventListener('touchstart', onTouchStart)
        window.removeEventListener('touchmove', onTouchMove)
        window.removeEventListener('touchend', onTouchEnd)
      }
    } else {
      const onMouseMove = (e: MouseEvent) => {
        mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2
        mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2
      }
      window.addEventListener('mousemove', onMouseMove)
      return () => window.removeEventListener('mousemove', onMouseMove)
    }
  }, [isMobile])

  // Set initial camera position
  useEffect(() => {
    camera.position.set(...defaultPos)
    camera.lookAt(...DEFAULT_CAMERA_TARGET)
  }, [camera, defaultPos])

  // Animate camera when active item changes
  useEffect(() => {
    // Kill ALL running tweens on camera & lookAt to prevent conflicts
    if (tweenRef.current) {
      tweenRef.current.kill()
      tweenRef.current = null
    }
    gsap.killTweensOf(camera.position)
    gsap.killTweensOf(lookAtTarget.current)

    if (activeItem) {
      const camPos = (isMobile && isPortrait && activeItem.mobileCameraPosition)
        ? activeItem.mobileCameraPosition
        : activeItem.cameraPosition
      mode.current = 'animating'
      const tl = gsap.timeline({
        onComplete: () => {
          mode.current = 'focused'
        },
      })

      tl.to(
        camera.position,
        {
          x: camPos[0],
          y: camPos[1],
          z: camPos[2],
          duration: 1.2,
          ease: 'power3.inOut',
        },
        0,
      )

      tl.to(
        lookAtTarget.current,
        {
          x: activeItem.cameraTarget[0],
          y: activeItem.cameraTarget[1],
          z: activeItem.cameraTarget[2],
          duration: 1.2,
          ease: 'power3.inOut',
        },
        0,
      )

      tweenRef.current = tl
    } else {
      mode.current = 'animating'
      const tl = gsap.timeline({
        onComplete: () => {
          // Force-set final positions to guarantee reset even if tween was imprecise
          camera.position.set(...defaultPos)
          lookAtTarget.current.set(...DEFAULT_CAMERA_TARGET)
          basePosition.current.set(...defaultPos)
          mode.current = 'idle'
        },
      })

      tl.to(
        camera.position,
        {
          x: defaultPos[0],
          y: defaultPos[1],
          z: defaultPos[2],
          duration: 1.2,
          ease: 'power3.inOut',
        },
        0,
      )

      tl.to(
        lookAtTarget.current,
        {
          x: DEFAULT_CAMERA_TARGET[0],
          y: DEFAULT_CAMERA_TARGET[1],
          z: DEFAULT_CAMERA_TARGET[2],
          duration: 1.2,
          ease: 'power3.inOut',
        },
        0,
      )

      tweenRef.current = tl
    }
  }, [activeItem, camera, defaultPos, isMobile, isPortrait])

  // Parallax multipliers: larger on mobile for swipe-to-look (~35deg H, ~18deg V)
  const parallaxX = isMobile ? 1.2 : 0.3
  const parallaxY = isMobile ? 0.6 : 0.15

  useFrame(() => {
    if (mode.current === 'idle') {
      if (isMobile) {
        // Apply momentum/inertia: decay velocity and accumulate into position
        const friction = 0.92
        velocity.current.x *= friction
        velocity.current.y *= friction
        mouse.current.x = Math.max(-1, Math.min(1, mouse.current.x + velocity.current.x))
        mouse.current.y = Math.max(-1, Math.min(1, mouse.current.y + velocity.current.y))

        // Smooth follow
        smoothMouse.current.x += (mouse.current.x - smoothMouse.current.x) * 0.08
        smoothMouse.current.y += (mouse.current.y - smoothMouse.current.y) * 0.08
      } else {
        // Desktop: direct smooth follow
        smoothMouse.current.x += (mouse.current.x - smoothMouse.current.x) * 0.05
        smoothMouse.current.y += (mouse.current.y - smoothMouse.current.y) * 0.05
      }

      camera.position.x = defaultPos[0] + smoothMouse.current.x * parallaxX
      camera.position.y = defaultPos[1] - smoothMouse.current.y * parallaxY
    }

    // Always look at the target (during idle + animating + focused)
    camera.lookAt(lookAtTarget.current)
  })

  return null
}

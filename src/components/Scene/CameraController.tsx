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

// Default yaw/pitch for mobile portrait idle (camera faces center of room)
const defaultTarget = new THREE.Vector3(...DEFAULT_CAMERA_TARGET)
const mobileDefaultPos = new THREE.Vector3(...MOBILE_CAMERA_POSITION)
const defaultDirection = new THREE.Vector3().subVectors(defaultTarget, mobileDefaultPos)
const DEFAULT_YAW = Math.atan2(defaultDirection.x, defaultDirection.z)
const DEFAULT_PITCH = Math.atan2(defaultDirection.y, Math.sqrt(defaultDirection.x ** 2 + defaultDirection.z ** 2))

// Rotation limits for mobile portrait swipe-to-look
const YAW_RANGE = (25 / 180) * Math.PI    // ±12.5 degrees from center
const PITCH_RANGE = (20 / 180) * Math.PI  // ±10 degrees from center
const LOOK_DISTANCE = defaultDirection.length()

export default function CameraController() {
  const camera = useThree((s) => s.camera)
  const invalidate = useThree((s) => s.invalidate)
  const invalidateRef = useRef(invalidate)
  invalidateRef.current = invalidate
  const mode = useRef<CameraMode>('idle')
  const mouse = useRef({ x: 0, y: 0 })
  const smoothMouse = useRef({ x: 0, y: 0 })
  const velocity = useRef({ x: 0, y: 0 })
  const lastTouch = useRef({ x: 0, y: 0 })
  const lookAtTarget = useRef(new THREE.Vector3(...DEFAULT_CAMERA_TARGET))
  const basePosition = useRef(new THREE.Vector3(...DEFAULT_CAMERA_POSITION))
  const tweenRef = useRef<gsap.core.Timeline | null>(null)
  const isMobile = useIsMobile()

  // Mobile portrait rotation state (yaw/pitch as normalized -1..1)
  const rotation = useRef({ yaw: 0, pitch: 0 })
  const smoothRotation = useRef({ yaw: 0, pitch: 0 })
  const rotVelocity = useRef({ yaw: 0, pitch: 0 })
  const isTouching = useRef(false)

  const isPortrait = useIsPortrait()
  const activeItem = useStore((s) => s.activeItem)

  const isMobilePortrait = isMobile && isPortrait

  // Effective default position based on device — only zoom out in portrait
  const defaultPos = isMobilePortrait ? MOBILE_CAMERA_POSITION : DEFAULT_CAMERA_POSITION

  // Track mouse/touch position for parallax / rotation
  useEffect(() => {
    if (isMobile) {
      let tracking = false

      const onTouchStart = (e: TouchEvent) => {
        if (e.touches.length !== 1) return
        // Ignore touches that start on UI overlays (tab bar, panels, buttons)
        const target = e.target as HTMLElement
        if (target.closest('nav, button, [class*="InfoPanel"], [class*="TopBar"]')) return
        tracking = true
        isTouching.current = true
        const touch = e.touches[0]
        lastTouch.current.x = touch.clientX
        lastTouch.current.y = touch.clientY
        // Kill momentum when finger touches down
        velocity.current.x = 0
        velocity.current.y = 0
        rotVelocity.current.yaw = 0
        rotVelocity.current.pitch = 0
      }

      const onTouchMove = (e: TouchEvent) => {
        if (!tracking || e.touches.length !== 1) return
        const touch = e.touches[0]
        const dx = (touch.clientX - lastTouch.current.x) / window.innerWidth
        const dy = (touch.clientY - lastTouch.current.y) / window.innerHeight

        if (isPortrait) {
          // Mobile portrait: accumulate rotation (swipe right → look left, like dragging the world)
          const yawDelta = dx * 1.2
          const pitchDelta = dy * 0.6
          rotation.current.yaw = Math.max(-1, Math.min(1, rotation.current.yaw + yawDelta))
          rotation.current.pitch = Math.max(-1, Math.min(1, rotation.current.pitch + pitchDelta))
          rotVelocity.current.yaw = yawDelta
          rotVelocity.current.pitch = pitchDelta
        } else {
          // Mobile landscape: position-based parallax (existing behavior)
          mouse.current.x = Math.max(-1, Math.min(1, mouse.current.x - dx * 2.5))
          mouse.current.y = Math.max(-1, Math.min(1, mouse.current.y - dy * 2.5))
          velocity.current.x = -dx * 2.5
          velocity.current.y = -dy * 2.5
        }

        lastTouch.current.x = touch.clientX
        lastTouch.current.y = touch.clientY
        if (mode.current === 'idle') invalidate()
      }

      const onTouchEnd = () => {
        tracking = false
        isTouching.current = false
        // velocity is preserved — useFrame will apply inertia decay
        if (mode.current === 'idle') invalidate()
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
        // Only trigger rendering when parallax is active (idle mode)
        // Avoids wasting frames while viewing panels or during GSAP animations
        if (mode.current === 'idle') invalidate()
      }
      window.addEventListener('mousemove', onMouseMove)
      return () => window.removeEventListener('mousemove', onMouseMove)
    }
  }, [isMobile, isPortrait, invalidate])

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
      const camPos = (isMobilePortrait && activeItem.mobileCameraPosition)
        ? activeItem.mobileCameraPosition
        : activeItem.cameraPosition
      mode.current = 'animating'
      const tl = gsap.timeline({
        onUpdate: () => invalidateRef.current(),
        onComplete: () => {
          mode.current = 'focused'
          invalidateRef.current()
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

      // Reset rotation state when returning home
      rotation.current.yaw = 0
      rotation.current.pitch = 0
      smoothRotation.current.yaw = 0
      smoothRotation.current.pitch = 0
      rotVelocity.current.yaw = 0
      rotVelocity.current.pitch = 0

      const tl = gsap.timeline({
        onUpdate: () => invalidateRef.current(),
        onComplete: () => {
          // Force-set final positions to guarantee reset even if tween was imprecise
          camera.position.set(...defaultPos)
          lookAtTarget.current.set(...DEFAULT_CAMERA_TARGET)
          basePosition.current.set(...defaultPos)
          mode.current = 'idle'
          invalidateRef.current()
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
  // eslint-disable-next-line react-hooks/exhaustive-deps -- invalidate accessed via ref to avoid effect re-runs
  }, [activeItem, camera, defaultPos, isMobilePortrait])

  // Desktop parallax multipliers
  const parallaxX = 0.3
  const parallaxY = 0.15

  // Mobile landscape parallax multipliers
  const mLandscapeX = 1.2
  const mLandscapeY = 0.6

  useFrame((_, rawDelta) => {
    // Cap delta to prevent overshoot after long idle gaps (e.g. tab switch)
    const delta = Math.min(rawDelta, 0.1)
    // Normalize per-frame factors to behave consistently at any framerate
    // e.g. 0.92 friction at 60fps → Math.pow(0.92, delta * 60) at any fps
    const dt60 = delta * 60

    if (mode.current === 'idle') {
      if (isMobilePortrait) {
        // Mobile portrait: rotation-based swipe-to-look (Street View style)
        const friction = Math.pow(0.92, dt60)
        if (!isTouching.current) {
          rotVelocity.current.yaw *= friction
          rotVelocity.current.pitch *= friction
          rotation.current.yaw = Math.max(-1, Math.min(1, rotation.current.yaw + rotVelocity.current.yaw))
          rotation.current.pitch = Math.max(-1, Math.min(1, rotation.current.pitch + rotVelocity.current.pitch))
        }

        // Smooth interpolation (time-based)
        const rotLerp = 1 - Math.pow(1 - 0.1, dt60)
        smoothRotation.current.yaw += (rotation.current.yaw - smoothRotation.current.yaw) * rotLerp
        smoothRotation.current.pitch += (rotation.current.pitch - smoothRotation.current.pitch) * rotLerp

        // Convert normalized rotation to yaw/pitch angles
        const yaw = DEFAULT_YAW + smoothRotation.current.yaw * YAW_RANGE
        const pitch = DEFAULT_PITCH + smoothRotation.current.pitch * PITCH_RANGE

        // Compute look-at target from yaw/pitch
        const lookX = defaultPos[0] + Math.sin(yaw) * Math.cos(pitch) * LOOK_DISTANCE
        const lookY = defaultPos[1] + Math.sin(pitch) * LOOK_DISTANCE
        const lookZ = defaultPos[2] + Math.cos(yaw) * Math.cos(pitch) * LOOK_DISTANCE

        lookAtTarget.current.set(lookX, lookY, lookZ)
        camera.position.set(...defaultPos)
      } else if (isMobile) {
        // Mobile landscape: position-based parallax (existing behavior)
        const friction = Math.pow(0.92, dt60)
        velocity.current.x *= friction
        velocity.current.y *= friction
        mouse.current.x = Math.max(-1, Math.min(1, mouse.current.x + velocity.current.x))
        mouse.current.y = Math.max(-1, Math.min(1, mouse.current.y + velocity.current.y))

        const landscapeLerp = 1 - Math.pow(1 - 0.08, dt60)
        smoothMouse.current.x += (mouse.current.x - smoothMouse.current.x) * landscapeLerp
        smoothMouse.current.y += (mouse.current.y - smoothMouse.current.y) * landscapeLerp

        camera.position.x = defaultPos[0] + smoothMouse.current.x * mLandscapeX
        camera.position.y = defaultPos[1] - smoothMouse.current.y * mLandscapeY
      } else {
        // Desktop: direct smooth follow (time-based lerp)
        const desktopLerp = 1 - Math.pow(1 - 0.05, dt60)
        smoothMouse.current.x += (mouse.current.x - smoothMouse.current.x) * desktopLerp
        smoothMouse.current.y += (mouse.current.y - smoothMouse.current.y) * desktopLerp

        camera.position.x = defaultPos[0] + smoothMouse.current.x * parallaxX
        camera.position.y = defaultPos[1] - smoothMouse.current.y * parallaxY

        // Keep rendering while parallax lerp hasn't settled
        const dx = Math.abs(smoothMouse.current.x - mouse.current.x)
        const dy = Math.abs(smoothMouse.current.y - mouse.current.y)
        if (dx > 0.0001 || dy > 0.0001) {
          invalidate()
        }
      }
    }

    // Always look at the target (during idle + animating + focused)
    camera.lookAt(lookAtTarget.current)
  })

  return null
}

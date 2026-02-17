import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import { useStore } from '../../stores/useStore'
import { DEFAULT_CAMERA_POSITION, DEFAULT_CAMERA_TARGET } from '../../data/portfolio'
import { useIsMobile } from '../../hooks/useIsMobile'

type CameraMode = 'idle' | 'animating' | 'focused'

export default function CameraController() {
  const { camera } = useThree()
  const mode = useRef<CameraMode>('idle')
  const mouse = useRef({ x: 0, y: 0 })
  const smoothMouse = useRef({ x: 0, y: 0 })
  const lookAtTarget = useRef(new THREE.Vector3(...DEFAULT_CAMERA_TARGET))
  const basePosition = useRef(new THREE.Vector3(...DEFAULT_CAMERA_POSITION))
  const tweenRef = useRef<gsap.core.Timeline | null>(null)
  const isMobile = useIsMobile()

  const activeItem = useStore((s) => s.activeItem)

  // Track mouse/touch position for parallax
  useEffect(() => {
    if (isMobile) {
      const onTouchMove = (e: TouchEvent) => {
        if (e.touches.length !== 1) return
        const touch = e.touches[0]
        mouse.current.x = (touch.clientX / window.innerWidth - 0.5) * 2
        mouse.current.y = (touch.clientY / window.innerHeight - 0.5) * 2
      }
      window.addEventListener('touchmove', onTouchMove, { passive: true })
      return () => window.removeEventListener('touchmove', onTouchMove)
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
    camera.position.set(...DEFAULT_CAMERA_POSITION)
    camera.lookAt(...DEFAULT_CAMERA_TARGET)
  }, [camera])

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
      mode.current = 'animating'
      const tl = gsap.timeline({
        onComplete: () => {
          mode.current = 'focused'
        },
      })

      tl.to(
        camera.position,
        {
          x: activeItem.cameraPosition[0],
          y: activeItem.cameraPosition[1],
          z: activeItem.cameraPosition[2],
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
          camera.position.set(...DEFAULT_CAMERA_POSITION)
          lookAtTarget.current.set(...DEFAULT_CAMERA_TARGET)
          basePosition.current.set(...DEFAULT_CAMERA_POSITION)
          mode.current = 'idle'
        },
      })

      tl.to(
        camera.position,
        {
          x: DEFAULT_CAMERA_POSITION[0],
          y: DEFAULT_CAMERA_POSITION[1],
          z: DEFAULT_CAMERA_POSITION[2],
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
  }, [activeItem, camera])

  // Parallax multipliers: reduced on mobile
  const parallaxX = isMobile ? 0.15 : 0.3
  const parallaxY = isMobile ? 0.08 : 0.15

  useFrame(() => {
    if (mode.current === 'idle') {
      // Subtle mouse/touch parallax
      smoothMouse.current.x += (mouse.current.x - smoothMouse.current.x) * 0.05
      smoothMouse.current.y += (mouse.current.y - smoothMouse.current.y) * 0.05

      camera.position.x = DEFAULT_CAMERA_POSITION[0] + smoothMouse.current.x * parallaxX
      camera.position.y = DEFAULT_CAMERA_POSITION[1] - smoothMouse.current.y * parallaxY
    }

    // Always look at the target (during idle + animating + focused)
    camera.lookAt(lookAtTarget.current)
  })

  return null
}

import { useRef, useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { useProgress } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import { useStore } from '../../stores/useStore'

const DOOR_WIDTH = 9.4
// Ribbed metal roll-up: many thin slats read as corrugated steel
const SLAT_HEIGHT = 0.34
const SLAT_GAP = 0.015
const SLAT_COUNT = 14
const OPEN_RISE = 5.1

// Once per page load — a WebGL-context remount (tier upgrade / context loss)
// must not replay the intro over an already-revealed scene.
let doorHasOpened = false

/**
 * Galvanized roll-up garage door across the front opening. Starts closed;
 * when asset loading completes (same condition that dismisses LoadingScreen)
 * it rolls up over ~3s. The slats park above the ceiling (out of view) while
 * the side guide rails remain as permanent door-frame scenery.
 *
 * Readiness is observed via vanilla zustand subscriptions (not React hooks):
 * a React subscription re-renders mid-load (drei's loading manager fires
 * during sibling GLB renders → setState-during-render warnings), and with
 * frameloop="demand" a useFrame poll never runs once the scene settles.
 */
export default function GarageDoor() {
  const slatsRef = useRef<THREE.Group>(null)
  const invalidate = useThree((s) => s.invalidate)

  useEffect(() => {
    if (doorHasOpened) return
    let started = false
    let tween: gsap.core.Tween | null = null

    const check = () => {
      if (started || !slatsRef.current) return
      const { progress, active } = useProgress.getState()
      if (!useStore.getState().isLoaded || active || progress < 100) return
      started = true
      tween = gsap.to(slatsRef.current.position, {
        y: OPEN_RISE,
        duration: 3.0,
        delay: 0.55,
        ease: 'power2.inOut',
        onUpdate: () => invalidate(),
        onComplete: () => {
          doorHasOpened = true
          invalidate()
        },
      })
    }

    check()
    const unsubProgress = useProgress.subscribe(check)
    const unsubStore = useStore.subscribe(check)
    return () => {
      unsubProgress()
      unsubStore()
      // Only kill a tween that hasn't finished revealing the scene
      if (tween && !doorHasOpened) tween.kill()
    }
  }, [invalidate])

  return (
    <group position={[0, 0, 5.45]}>
      {/* Side guide rails — permanent door-frame scenery */}
      {[-DOOR_WIDTH / 2 - 0.08, DOOR_WIDTH / 2 + 0.08].map((x) => (
        <mesh key={x} position={[x, 2.45, 0]}>
          <boxGeometry args={[0.12, 4.9, 0.12]} />
          <meshStandardMaterial color="#6b675f" roughness={0.5} metalness={0.7} />
        </mesh>
      ))}

      {/* Animated slat curtain */}
      <group ref={slatsRef} position={[0, doorHasOpened ? OPEN_RISE : 0, 0]}>
        {/* Galvanized-steel slats — light warm gray like a real shop roll-up */}
        {Array.from({ length: SLAT_COUNT }).map((_, i) => (
          <mesh key={i} position={[0, 0.06 + SLAT_HEIGHT / 2 + i * (SLAT_HEIGHT + SLAT_GAP), 0]}>
            <boxGeometry args={[DOOR_WIDTH, SLAT_HEIGHT, 0.06]} />
            <meshStandardMaterial color={i % 2 === 0 ? '#b3aea3' : '#a49f94'} roughness={0.38} metalness={0.75} />
          </mesh>
        ))}
        {/* Handle */}
        <mesh position={[0, 0.06 + SLAT_HEIGHT / 2, 0.05]}>
          <boxGeometry args={[0.5, 0.07, 0.04]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.4} metalness={0.7} />
        </mesh>
      </group>
    </group>
  )
}

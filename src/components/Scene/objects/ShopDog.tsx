import { useRef, useState, useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF, useAnimations, Html } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { ballWorld } from '../../../lib/ballWorld'

const WALK_SPEED = 0.55
const GALLOP_SPEED = 1.7
const TURN_LERP = 0.12

// Hand-picked open-floor spots the dog wanders between (clear of furniture,
// all within the default camera's view) — covers the whole open floor,
// front to back
const WAYPOINTS: [number, number][] = [
  [-1.6, 2.3],
  [0.3, 2.5],
  [1.5, 4.2],
  [-1.0, 4.4],
  [-2.2, 4.2],
  [2.3, 3.8],
  [-0.6, 1.3],  // mid-floor, near the extension cord
  [0.9, 0.2],   // deep center, by the soccer ball's turf
  [-2.7, 3.0],  // left side, past the trash can
  [1.0, 3.2],   // between the GitHub disc and the tool cart
]
const HOME: [number, number] = [2.3, 3.8]

const CLIP = {
  idle: 'AnimalArmature|Idle',
  sniff: 'AnimalArmature|Idle_2_HeadLow',
  eat: 'AnimalArmature|Eating',
  walk: 'AnimalArmature|Walk',
  gallop: 'AnimalArmature|Gallop',
  jump: 'AnimalArmature|Gallop_Jump',
} as const

type DogState = 'rest' | 'walk' | 'sniff' | 'scatter' | 'greet'

/**
 * The shop dog 🐕 — a Quaternius CC0 Shiba Inu that wanders the open floor.
 * Demand-frameloop friendly: it wanders/sniffs for a few legs, then RESTS —
 * while resting it schedules no frames at all, so the GPU idles exactly as
 * before. Wakes on a timer, when clicked (happy jump), or when the soccer
 * ball flies too close (gallops away — it reacts because frames are already
 * rendering while the ball moves).
 */
export default function ShopDog() {
  const { scene, animations } = useGLTF('/models/shiba_inu.glb')
  const groupRef = useRef<THREE.Group>(null)
  const { actions } = useAnimations(animations, groupRef)
  const invalidate = useThree((s) => s.invalidate)
  const [hovered, setHovered] = useState(false)

  // SkinnedMeshes moved via parent transforms mis-cull — disable culling once
  useMemo(() => {
    scene.traverse((child) => {
      if ((child as THREE.SkinnedMesh).isSkinnedMesh) child.frustumCulled = false
    })
    return null
  }, [scene])

  const dog = useRef({
    state: 'rest' as DogState,
    pos: new THREE.Vector3(HOME[0], 0, HOME[1]),
    yaw: Math.PI,
    target: new THREE.Vector2(HOME[0], HOME[1]),
    legsLeft: 0,
    stateUntil: 0,
    current: '' as string,
  })
  const wakeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const play = (name: string, fade = 0.25) => {
    const d = dog.current
    if (d.current === name) return
    const nextAction = actions[name]
    if (!nextAction) return
    const prevAction = d.current ? actions[d.current] : null
    nextAction.reset().fadeIn(fade).play()
    if (prevAction) prevAction.fadeOut(fade)
    d.current = name
  }

  const scheduleWake = (ms: number) => {
    if (wakeTimer.current) clearTimeout(wakeTimer.current)
    wakeTimer.current = setTimeout(() => {
      const d = dog.current
      d.state = 'walk'
      d.legsLeft = 1 + Math.floor(Math.random() * 3)
      d.target.set(...WAYPOINTS[Math.floor(Math.random() * WAYPOINTS.length)])
      invalidate()
    }, ms)
  }

  // Start resting; first stroll after a short delay. Clean up timer on unmount.
  useEffect(() => {
    play(CLIP.idle)
    scheduleWake(6000 + Math.random() * 6000)
    return () => { if (wakeTimer.current) clearTimeout(wakeTimer.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only setup
  }, [])

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    const d = dog.current
    if (wakeTimer.current) clearTimeout(wakeTimer.current)
    d.state = 'greet'
    d.stateUntil = performance.now() + 900
    play(CLIP.jump, 0.1)
    invalidate()
  }

  useFrame((_, rawDelta) => {
    const d = dog.current
    const dt = Math.min(rawDelta, 0.05)
    const now = performance.now()

    // Ball incoming?! (frames are already rendering while the ball moves,
    // so this check costs nothing extra)
    if (ballWorld.moving && d.state !== 'scatter') {
      const distToBall = Math.hypot(ballWorld.pos.x - d.pos.x, ballWorld.pos.z - d.pos.z)
      if (distToBall < 1.0) {
        // Run to the waypoint farthest from the ball
        let best = WAYPOINTS[0]
        let bestDist = -1
        for (const w of WAYPOINTS) {
          const dw = Math.hypot(w[0] - ballWorld.pos.x, w[1] - ballWorld.pos.z)
          if (dw > bestDist) { bestDist = dw; best = w }
        }
        d.target.set(best[0], best[1])
        d.state = 'scatter'
        d.legsLeft = 0
        play(CLIP.gallop, 0.1)
      }
    }

    if (d.state === 'rest') {
      // No invalidation — the dog costs zero frames while resting.
      return
    }

    if (d.state === 'greet') {
      if (now > d.stateUntil) {
        d.state = 'rest'
        play(CLIP.idle)
        scheduleWake(4000 + Math.random() * 8000)
      }
      invalidate()
      return
    }

    if (d.state === 'sniff') {
      if (now > d.stateUntil) {
        if (d.legsLeft > 0) {
          d.legsLeft -= 1
          d.state = 'walk'
          d.target.set(...WAYPOINTS[Math.floor(Math.random() * WAYPOINTS.length)])
          play(CLIP.walk)
        } else {
          d.state = 'rest'
          play(CLIP.idle)
          scheduleWake(15000 + Math.random() * 25000)
        }
      }
      invalidate()
    }

    if (d.state === 'walk' || d.state === 'scatter') {
      if (d.current !== CLIP.walk && d.current !== CLIP.gallop) play(d.state === 'scatter' ? CLIP.gallop : CLIP.walk)
      const dx = d.target.x - d.pos.x
      const dz = d.target.y - d.pos.z
      const dist = Math.hypot(dx, dz)
      if (dist < 0.08) {
        if (d.state === 'scatter') {
          d.state = 'rest'
          play(CLIP.idle)
          scheduleWake(10000 + Math.random() * 15000)
        } else {
          d.state = 'sniff'
          d.stateUntil = now + 2500 + Math.random() * 2500
          // Mostly sniffs around; sometimes finds something to snack on
          play(Math.random() < 0.3 ? CLIP.eat : CLIP.sniff)
        }
      } else {
        const speed = d.state === 'scatter' ? GALLOP_SPEED : WALK_SPEED
        d.pos.x += (dx / dist) * speed * dt
        d.pos.z += (dz / dist) * speed * dt
        // Smoothly face the travel direction
        const targetYaw = Math.atan2(dx, dz)
        let diff = targetYaw - d.yaw
        while (diff > Math.PI) diff -= Math.PI * 2
        while (diff < -Math.PI) diff += Math.PI * 2
        d.yaw += diff * Math.min(1, TURN_LERP * dt * 60)
      }
      invalidate()
    }

    if (groupRef.current) {
      groupRef.current.position.set(d.pos.x, 0, d.pos.z)
      groupRef.current.rotation.y = d.yaw
    }
  })

  return (
    <group ref={groupRef} position={[HOME[0], 0, HOME[1]]} rotation={[0, Math.PI, 0]}>
      <primitive object={scene} scale={0.23} />
      {/* Invisible hitbox for petting */}
      <mesh
        visible={false}
        position={[0, 0.2, 0]}
        onClick={onClick}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; invalidate() }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; invalidate() }}
      >
        <boxGeometry args={[0.5, 0.45, 0.7]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      {hovered && (
        <Html position={[0, 0.7, 0]} center style={{ pointerEvents: 'none' }}>
          <div className="whitespace-nowrap rounded-md bg-garage-dark/90 px-3 py-1.5 font-serif text-sm text-golden shadow-lg backdrop-blur-sm">
            the shop dog 🐕
          </div>
        </Html>
      )}
    </group>
  )
}

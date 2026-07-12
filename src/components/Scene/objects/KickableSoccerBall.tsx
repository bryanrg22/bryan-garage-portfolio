import { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF, Html } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import type { PortfolioItem } from '../../../data/portfolio'
import { useStore } from '../../../stores/useStore'
import { useIsTouchDevice } from '../../../hooks/useIsTouchDevice'
import { ballDrag } from '../../../lib/ballDrag'
import { ballWorld, registerResettable, markDisplaced, clearDisplaced } from '../../../lib/ballWorld'
import { trackEvent } from '../../../lib/analytics'

const BALL_RADIUS = 0.25
const GRAVITY = 9.8
const KICK_THRESHOLD_PX = 10 // drag beyond this = kick, below = click
const KICK_FORCE = 0.009 // screen px/s → world units/s
const MAX_KICK_SPEED = 11
const MIN_KICK_SPEED = 2.2
const FLICK_WINDOW_MS = 110 // velocity is measured over this trailing window
const RETURN_DELAY_MS = 4000 // rest time away from home before rolling back

// Room bounds (ball-center limits, radius already subtracted)
const BOUND_X = 4.6
const BOUND_Z_BACK = -2.6
const BOUND_Z_FRONT = 6.6
const BOUND_Y_CEIL = 4.6

interface BoxCollider { minX: number; maxX: number; minZ: number; maxZ: number; top: number }
interface CircleCollider { x: number; z: number; r: number; top: number }

// Always-present STATIC furniture (XZ boxes; solid below `top`).
// Movable objects (trash can, drums, boombox, toolbox, tools…) are handled
// by KnockableProp — they shove the ball back themselves.
// CONVENTION: any box face sitting at/beyond a room bound is extended well
// past it — otherwise the nearest-face ejection can point into the wall and
// the ball ping-pongs forever between the wall clamp and the box push-out.
const BASE_BOXES: BoxCollider[] = [
  { minX: -6, maxX: -1.35, minZ: -1.7, maxZ: -0.3, top: 1.05 },  // left workbench (left wall)
  { minX: -0.3, maxX: 2.5, minZ: -4.5, maxZ: -2.2, top: 1.0 },   // back workbench (back wall)
]

// Always-present static round objects (tires/compressor moved to KnockableProp)
const BASE_CIRCLES: CircleCollider[] = []

const goldenColor = new THREE.Color('#F4C963')
const _up = new THREE.Vector3(0, 1, 0)
const _spinAxis = new THREE.Vector3()
const _spinQuat = new THREE.Quaternion()
const _hoverScale = new THREE.Vector3()

/**
 * The soccer ball: click/tap opens the story panel (same as every other
 * object), but drag-and-release FLICKS it — lightweight custom physics
 * (gravity, wall/floor bounces, furniture box + cylinder colliders, rolling
 * friction), no physics engine. Light props wrapped in KnockableProp get
 * knocked flying via the shared ballWorld state. Rolls itself back home
 * after a few seconds; landing it in the trash can (from above!) is a goal.
 */
export default function KickableSoccerBall({ item }: { item: PortfolioItem }) {
  const { scene } = useGLTF('/models/soccer_ball.glb')
  const groupRef = useRef<THREE.Group>(null)
  const ballRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  const setActiveItem = useStore((s) => s.setActiveItem)
  const setHasInteracted = useStore((s) => s.setHasInteracted)
  const activeItem = useStore((s) => s.activeItem)
  const quality = useStore((s) => s.qualityConfig)
  const isActive = activeItem?.id === item.id
  const isTouchDevice = useIsTouchDevice()
  const invalidate = useThree((s) => s.invalidate)
  const dotRef = useRef<THREE.Mesh>(null)

  // All mutable physics state lives in one lazily-initialized ref — mutated
  // freely from useFrame and event handlers without tripping React rules.
  const physicsRef = useRef<{ home: THREE.Vector3; pos: THREE.Vector3; vel: THREE.Vector3 } | null>(null)
  if (physicsRef.current === null) {
    physicsRef.current = {
      home: new THREE.Vector3(...item.position),
      pos: new THREE.Vector3(...item.position),
      vel: new THREE.Vector3(),
    }
  }
  const mode = useRef<'rest' | 'flying' | 'returning'>('rest')
  const grounded = useRef(true)
  const returnTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Share the ball's vectors with knockable props (they steal energy on hit)
  useEffect(() => {
    ballWorld.pos = physicsRef.current!.pos
    ballWorld.vel = physicsRef.current!.vel
    return () => { ballWorld.moving = false }
  }, [])

  // Tier-dependent static colliders (heavy models only exist on some tiers)
  const colliders = useMemo(() => {
    const boxes = [...BASE_BOXES]
    const circles = [...BASE_CIRCLES]
    if (quality.showHeavyModels) {
      // Car lift — measured from the GLB geometry (see slice notes): two tall
      // posts against the right wall with a low drive-on track between them.
      // A previous single mega-box (x 3.2–4.9, z 0.6–3.8) walled off the whole
      // corner and made the tires/bucket unreachable at ground level.
      boxes.push({ minX: 4.05, maxX: 6, minZ: -4, maxZ: -1.9, top: 3.0 })  // back post (right + back wall)
      boxes.push({ minX: 4.05, maxX: 6, minZ: 1.3, maxZ: 2.25, top: 3.0 })   // front post (right wall)
      boxes.push({ minX: 4.05, maxX: 6, minZ: -1.9, maxZ: 1.3, top: 0.35 })  // low track (right wall)
      // GTR display model on the left workbench (actual footprint + margin)
      boxes.push({ minX: -6, maxX: -3.75, minZ: -1.45, maxZ: -0.2, top: 1.35 })
    }
    return { boxes, circles }
  }, [quality])

  // Pointer-gesture state (screen space) — samples form a trailing window so
  // flick velocity reflects the whole gesture, not just the last two events
  const drag = useRef<{ startX: number; startY: number; samples: { x: number; y: number; t: number }[]; isKick: boolean } | null>(null)

  const scheduleReturn = useCallback(() => {
    const { pos, home } = physicsRef.current!
    if (returnTimer.current) clearTimeout(returnTimer.current)
    if (pos.distanceTo(home) < 0.3) return
    returnTimer.current = setTimeout(() => {
      mode.current = 'returning'
      invalidate()
    }, RETURN_DELAY_MS)
  }, [invalidate])

  useEffect(() => () => { if (returnTimer.current) clearTimeout(returnTimer.current) }, [])

  // Tidy-up support: roll home on demand
  useEffect(() => {
    return registerResettable('soccer-ball', () => {
      const { pos, home } = physicsRef.current!
      if (mode.current === 'rest' && pos.distanceTo(home) < 0.05) return
      if (returnTimer.current) clearTimeout(returnTimer.current)
      mode.current = 'returning'
      invalidate()
    })
  }, [invalidate])

  const kick = useCallback((dxPerSec: number, dyPerSec: number) => {
    const screenSpeed = Math.hypot(dxPerSec, dyPerSec)
    if (screenSpeed < 1) return
    const speed = THREE.MathUtils.clamp(screenSpeed * KICK_FORCE, MIN_KICK_SPEED, MAX_KICK_SPEED)
    // Screen right → world +x, screen down → world +z (camera looks along -z)
    const inv = 1 / screenSpeed
    // Vertical launch must be able to clear the trash-can rim (apex = vy²/2g + R)
    physicsRef.current!.vel.set(dxPerSec * inv * speed, Math.min(speed * 0.55, 4.2), dyPerSec * inv * speed)
    mode.current = 'flying'
    grounded.current = false
    ballWorld.moving = true
    markDisplaced('soccer-ball')
    if (returnTimer.current) clearTimeout(returnTimer.current)
    trackEvent('soccer_ball_kicked', { speed: Math.round(speed * 10) / 10 })
    invalidate()
  }, [invalidate])

  // Dev-only test hook: kick the ball from the console / automated checks
  useEffect(() => {
    if (!import.meta.env.DEV) return
    const w = window as Window & { __ball?: { kick: (dx: number, dy: number) => void; pos: () => number[]; mode: () => string } }
    w.__ball = { kick, pos: () => physicsRef.current!.pos.toArray(), mode: () => mode.current }
    return () => { delete w.__ball }
  }, [kick])

  const onPointerDown = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    ballDrag.active = true
    const now = performance.now()
    drag.current = { startX: e.clientX, startY: e.clientY, samples: [{ x: e.clientX, y: e.clientY, t: now }], isKick: false }

    const onMove = (ev: PointerEvent) => {
      const d = drag.current
      if (!d) return
      const t = performance.now()
      d.samples.push({ x: ev.clientX, y: ev.clientY, t })
      // Keep only the trailing flick window
      while (d.samples.length > 2 && t - d.samples[0].t > FLICK_WINDOW_MS) d.samples.shift()
      if (Math.hypot(ev.clientX - d.startX, ev.clientY - d.startY) > KICK_THRESHOLD_PX) d.isKick = true
    }
    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      ballDrag.active = false
      const d = drag.current
      drag.current = null
      if (!d) return
      if (d.isKick && d.samples.length >= 2) {
        const first = d.samples[0]
        const last = d.samples[d.samples.length - 1]
        const dt = Math.max((last.t - first.t) / 1000, 0.016)
        kick((last.x - first.x) / dt, (last.y - first.y) / dt)
      } else if (!d.isKick) {
        // Plain click/tap — open the story panel, exactly like before
        setActiveItem(item)
        setHasInteracted()
      }
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }, [kick, setActiveItem, setHasInteracted, item])

  useFrame((state, rawDelta) => {
    if (!groupRef.current) return
    const { home, pos, vel } = physicsRef.current!
    const dt = Math.min(rawDelta, 0.05)

    if (mode.current === 'flying') {
      vel.y -= GRAVITY * dt
      pos.addScaledVector(vel, dt)

      // Floor
      if (pos.y < BALL_RADIUS) {
        pos.y = BALL_RADIUS
        if (Math.abs(vel.y) < 0.6) { vel.y = 0; grounded.current = true } else { vel.y = -vel.y * 0.5 }
        vel.x *= 0.85
        vel.z *= 0.85
      }
      // Ceiling + walls
      if (pos.y > BOUND_Y_CEIL) { pos.y = BOUND_Y_CEIL; vel.y = -Math.abs(vel.y) * 0.5 }
      if (pos.x > BOUND_X) { pos.x = BOUND_X; vel.x = -Math.abs(vel.x) * 0.6 }
      if (pos.x < -BOUND_X) { pos.x = -BOUND_X; vel.x = Math.abs(vel.x) * 0.6 }
      if (pos.z < BOUND_Z_BACK) { pos.z = BOUND_Z_BACK; vel.z = Math.abs(vel.z) * 0.6 }
      if (pos.z > BOUND_Z_FRONT) { pos.z = BOUND_Z_FRONT; vel.z = -Math.abs(vel.z) * 0.6 }

      // Box colliders (only when ball is below the surface top)
      for (const c of colliders.boxes) {
        if (pos.y - BALL_RADIUS >= c.top) continue
        const inX = pos.x > c.minX - BALL_RADIUS && pos.x < c.maxX + BALL_RADIUS
        const inZ = pos.z > c.minZ - BALL_RADIUS && pos.z < c.maxZ + BALL_RADIUS
        if (!inX || !inZ) continue
        const pushLeft = pos.x - (c.minX - BALL_RADIUS)
        const pushRight = (c.maxX + BALL_RADIUS) - pos.x
        const pushBack = pos.z - (c.minZ - BALL_RADIUS)
        const pushFront = (c.maxZ + BALL_RADIUS) - pos.z
        const min = Math.min(pushLeft, pushRight, pushBack, pushFront)
        if (min === pushLeft) { pos.x = c.minX - BALL_RADIUS; vel.x = -Math.abs(vel.x) * 0.5 }
        else if (min === pushRight) { pos.x = c.maxX + BALL_RADIUS; vel.x = Math.abs(vel.x) * 0.5 }
        else if (min === pushBack) { pos.z = c.minZ - BALL_RADIUS; vel.z = -Math.abs(vel.z) * 0.5 }
        else { pos.z = c.maxZ + BALL_RADIUS; vel.z = Math.abs(vel.z) * 0.5 }
      }

      // Cylinder colliders (drums, tires, compressor)
      for (const c of colliders.circles) {
        if (pos.y - BALL_RADIUS >= c.top) continue
        const dx = pos.x - c.x
        const dz = pos.z - c.z
        const d = Math.hypot(dx, dz)
        const minD = c.r + BALL_RADIUS
        if (d >= minD || d < 1e-4) continue
        const nx = dx / d
        const nz = dz / d
        pos.x = c.x + nx * minD
        pos.z = c.z + nz * minD
        const vDotN = vel.x * nx + vel.z * nz
        if (vDotN < 0) {
          vel.x -= 1.5 * vDotN * nx
          vel.z -= 1.5 * vDotN * nz
        }
      }

      // Rolling friction once grounded — light enough that it rolls, not sticks
      if (grounded.current) {
        const f = Math.pow(0.55, dt)
        vel.x *= f
        vel.z *= f
      }

      // Spin the ball to match travel
      if (ballRef.current) {
        const hSpeed = Math.hypot(vel.x, vel.z)
        if (hSpeed > 0.01) {
          _spinAxis.set(vel.x, 0, vel.z).normalize()
          _spinAxis.crossVectors(_up, _spinAxis)
          _spinQuat.setFromAxisAngle(_spinAxis, (hSpeed * dt) / BALL_RADIUS)
          ballRef.current.quaternion.premultiply(_spinQuat)
        }
      }

      // Settled?
      if (grounded.current && vel.lengthSq() < 0.003 && mode.current === 'flying') {
        vel.set(0, 0, 0)
        mode.current = 'rest'
        scheduleReturn()
      }
      invalidate()
    } else if (mode.current === 'returning') {
      const t = 1 - Math.pow(1 - 0.06, dt * 60)
      pos.lerp(home, t)
      // Float over obstacles on the way back instead of clipping through them
      const distHome = Math.hypot(pos.x - home.x, pos.z - home.z)
      pos.y = home.y + THREE.MathUtils.clamp(distHome * 0.35, 0, 0.9)
      if (ballRef.current) {
        // Roll along the return path
        _spinAxis.subVectors(home, pos)
        const d = Math.hypot(_spinAxis.x, _spinAxis.z)
        if (d > 0.001) {
          _spinAxis.y = 0
          _spinAxis.normalize()
          _spinAxis.crossVectors(_up, _spinAxis)
          _spinQuat.setFromAxisAngle(_spinAxis, (d * t) / BALL_RADIUS)
          ballRef.current.quaternion.premultiply(_spinQuat)
        }
      }
      if (pos.distanceTo(home) < 0.02) {
        pos.copy(home)
        mode.current = 'rest'
        clearDisplaced('soccer-ball')
      }
      invalidate()
    } else if (isTouchDevice && !isActive) {
      // Mobile idle pulse (RenderController drives frames)
      const pulse = 1 + Math.sin(state.clock.elapsedTime * Math.PI) * 0.015
      groupRef.current.scale.setScalar(pulse)
    } else {
      // Desktop hover scale lerp
      const target = hovered && !isActive ? 1.05 : 1
      _hoverScale.setScalar(target)
      groupRef.current.scale.lerp(_hoverScale, dt * 8)
      if (Math.abs(groupRef.current.scale.x - target) > 0.001) invalidate()
    }

    ballWorld.moving = mode.current === 'flying'
    groupRef.current.position.copy(pos)

    // Golden dot pulse on mobile
    if (dotRef.current && isTouchDevice && !isActive) {
      const dotPulse = 0.5 + Math.sin(state.clock.elapsedTime * 2) * 0.5
      ;(dotRef.current.material as THREE.MeshStandardMaterial).opacity = dotPulse * 0.8
    }
  })

  return (
    <group ref={groupRef} position={item.position}>
      <group
        onPointerDown={onPointerDown}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'grab'; invalidate() }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; invalidate() }}
      >
        <group ref={ballRef}>
          <primitive object={scene} scale={0.25} castShadow />
        </group>
        {/* Invisible hitbox for reliable pointer events */}
        <mesh visible={false}>
          <sphereGeometry args={[0.32, 12, 12]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      </group>

      {/* Mobile: golden dot marker */}
      {isTouchDevice && !isActive && (
        <mesh ref={dotRef} position={[0, 0.75, 0]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color={goldenColor} emissive={goldenColor} emissiveIntensity={0.8} transparent opacity={0.8} />
        </mesh>
      )}

      {/* Hover label (desktop only) */}
      {!isTouchDevice && hovered && !isActive && (
        <Html position={[0, 0.6, 0]} center style={{ pointerEvents: 'none' }}>
          <div className="whitespace-nowrap rounded-md bg-garage-dark/90 px-3 py-1.5 text-center shadow-lg backdrop-blur-sm">
            <p className="font-serif text-sm text-golden">{item.title}</p>
            <p className="text-[10px] text-stone">click for story · flick to kick</p>
          </div>
        </Html>
      )}
    </group>
  )
}

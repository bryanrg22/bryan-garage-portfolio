import { useRef, useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import { ballWorld, propBodies, registerResettable, registerPropBody, markDisplaced, clearDisplaced } from '../../../lib/ballWorld'
import { getStaticBoxes, resolveCircleBox, ROOM } from '../../../lib/staticColliders'
import { useStore } from '../../../stores/useStore'

const BALL_RADIUS = 0.25
const GRAVITY = 9.8
const _up = new THREE.Vector3(0, 1, 0)

interface PropState {
  home: THREE.Vector3
  pos: THREE.Vector3
  vel: THREE.Vector3
  tipAxis: THREE.Vector3
  tipAngle: number
  moving: boolean
  displaced: boolean
  resetting: boolean
  cooldownUntil: number
}

/**
 * Wraps a decorative object so the soccer ball can knock it around.
 * On impact the prop inherits a share of the ball's velocity scaled by
 * `massFactor` (light cans fly, heavy carts barely budge), and the ball is
 * pushed back out and bounces off — nothing interpenetrates. Props slide
 * with friction and (if `tippable`) tip over as they travel. The "tidy up"
 * reset floats everything back upright to its home spot.
 */
export default function KnockableProp({
  id,
  position,
  radius = 0.16,
  height = 0.45,
  massFactor = 0.65,
  tippable = true,
  resetDelay = 0,
  children,
}: {
  id: string
  position: [number, number, number]
  radius?: number
  height?: number
  /** 0..1 — share of ball velocity the prop inherits (lower = heavier). */
  massFactor?: number
  /** Heavy/flat objects slide without tipping over. */
  tippable?: boolean
  resetDelay?: number
  children: React.ReactNode
}) {
  const groupRef = useRef<THREE.Group>(null)
  const invalidate = useThree((s) => s.invalidate)
  const quality = useStore((s) => s.qualityConfig)
  // Same measured furniture boxes the ball bounces off — a shoved drum
  // must not clip into the workbench either.
  const staticBoxes = useMemo(() => getStaticBoxes(quality.showHeavyModels), [quality])

  const stateRef = useRef<PropState | null>(null)
  if (stateRef.current === null) {
    stateRef.current = {
      home: new THREE.Vector3(...position),
      pos: new THREE.Vector3(...position),
      vel: new THREE.Vector3(),
      tipAxis: new THREE.Vector3(1, 0, 0),
      tipAngle: 0,
      moving: false,
      displaced: false,
      resetting: false,
      cooldownUntil: 0,
    }
  }

  // Register as a physics body so other moving props can shove this one
  useEffect(() => {
    return registerPropBody({
      id,
      pos: stateRef.current!.pos,
      radius,
      massFactor,
      resetting: () => stateRef.current!.resetting,
      wake: (vx, vz) => {
        const s = stateRef.current!
        if (s.resetting) return
        s.vel.x = vx
        s.vel.z = vz
        s.moving = true
        if (!s.displaced) {
          s.displaced = true
          markDisplaced(id)
        }
      },
    })
  }, [id, radius, massFactor])

  // Register with the tidy-up system
  useEffect(() => {
    return registerResettable(id, () => {
      const s = stateRef.current!
      if (!s.displaced) return
      s.moving = false
      s.resetting = true
      const fromPos = s.pos.clone()
      const fromAngle = s.tipAngle
      const t = { p: 0 }
      gsap.to(t, {
        p: 1,
        duration: 0.9,
        delay: resetDelay,
        ease: 'power2.inOut',
        onUpdate: () => {
          const st = stateRef.current!
          st.pos.lerpVectors(fromPos, st.home, t.p)
          // Small arc so the prop floats over anything in its path
          st.pos.y += Math.sin(t.p * Math.PI) * 0.35
          st.tipAngle = fromAngle * (1 - t.p)
          invalidate()
        },
        onComplete: () => {
          const st = stateRef.current!
          st.pos.copy(st.home)
          st.tipAngle = 0
          st.vel.set(0, 0, 0)
          st.displaced = false
          st.resetting = false
          clearDisplaced(id)
          invalidate()
        },
      })
    })
  }, [id, resetDelay, invalidate])

  useFrame((state, rawDelta) => {
    const s = stateRef.current!
    const dt = Math.min(rawDelta, 0.05)

    // Impact detection — only while the ball is in flight
    if (ballWorld.moving && !s.resetting) {
      const dx = ballWorld.pos.x - s.pos.x
      const dz = ballWorld.pos.z - s.pos.z
      const distXZ = Math.hypot(dx, dz)
      const ballSpeed = Math.hypot(ballWorld.vel.x, ballWorld.vel.z)
      const ballLowEnough = ballWorld.pos.y - BALL_RADIUS < s.pos.y + height
      if (distXZ > 1e-4 && distXZ < BALL_RADIUS + radius && ballLowEnough) {
        const nx = dx / distXZ
        const nz = dz / distXZ
        // The ball never enters the prop: push it out and bounce it
        ballWorld.pos.x = s.pos.x + nx * (BALL_RADIUS + radius + 0.01)
        ballWorld.pos.z = s.pos.z + nz * (BALL_RADIUS + radius + 0.01)
        const vDotN = ballWorld.vel.x * nx + ballWorld.vel.z * nz
        if (vDotN < 0) {
          ballWorld.vel.x -= 1.4 * vDotN * nx
          ballWorld.vel.z -= 1.4 * vDotN * nz
        }
        invalidate()
        // Transfer momentum into the prop (past cooldown, above a soft tap)
        if (ballSpeed > 0.7 && state.clock.elapsedTime > s.cooldownUntil) {
          s.vel.set(
            -nx * ballSpeed * massFactor,
            tippable ? Math.min(ballSpeed * 0.2 * massFactor, 1.0) : 0,
            -nz * ballSpeed * massFactor,
          )
          s.moving = true
          s.cooldownUntil = state.clock.elapsedTime + 0.35
          // Impact also costs the ball some energy
          ballWorld.vel.x *= 1 - massFactor * 0.4
          ballWorld.vel.z *= 1 - massFactor * 0.4
          if (!s.displaced) {
            s.displaced = true
            markDisplaced(id)
          }
        }
      }
    }

    if (s.moving) {
      s.vel.y -= GRAVITY * dt
      s.pos.addScaledVector(s.vel, dt)
      const baseY = s.home.y
      if (s.pos.y < baseY) {
        s.pos.y = baseY
        s.vel.y = 0
      }
      // Keep inside the room — by this prop's own radius, so fat drums
      // don't end up half-embedded in a wall
      s.pos.x = THREE.MathUtils.clamp(s.pos.x, -(ROOM.wallX - radius), ROOM.wallX - radius)
      s.pos.z = THREE.MathUtils.clamp(s.pos.z, ROOM.backZ + radius, ROOM.frontZ - radius)
      // Static furniture — slide along benches/lift instead of clipping inside
      for (const box of staticBoxes) {
        if (s.pos.y >= box.top) continue
        const hit = resolveCircleBox(s.pos, radius, box)
        if (!hit) continue
        if (hit.axis === 'x') s.vel.x = hit.dir * Math.abs(s.vel.x) * 0.4
        else s.vel.z = hit.dir * Math.abs(s.vel.z) * 0.4
      }
      // Sliding friction
      const f = Math.pow(0.12, dt)
      s.vel.x *= f
      s.vel.z *= f
      // Prop-to-prop collisions — plow other props along instead of clipping
      for (const other of propBodies.values()) {
        if (other.id === id || other.resetting()) continue
        const dx = other.pos.x - s.pos.x
        const dz = other.pos.z - s.pos.z
        const d = Math.hypot(dx, dz)
        const minD = radius + other.radius
        if (d >= minD || d < 1e-4) continue
        const nx = dx / d
        const nz = dz / d
        const overlap = minD - d
        // Separate the pair
        s.pos.x -= nx * overlap * 0.5
        s.pos.z -= nz * overlap * 0.5
        other.pos.x += nx * overlap * 0.5
        other.pos.z += nz * overlap * 0.5
        const mySpeed = Math.hypot(s.vel.x, s.vel.z)
        if (mySpeed > 0.3) {
          // Shove the other prop (lighter props fly farther)…
          other.wake(nx * mySpeed * other.massFactor, nz * mySpeed * other.massFactor)
          // …and lose energy / deflect off it
          const vDotN = s.vel.x * nx + s.vel.z * nz
          if (vDotN > 0) {
            s.vel.x -= 1.2 * vDotN * nx
            s.vel.z -= 1.2 * vDotN * nz
          }
          s.vel.x *= 0.75
          s.vel.z *= 0.75
        }
      }
      // Tip over in the direction of travel
      const hSpeed = Math.hypot(s.vel.x, s.vel.z)
      if (tippable && hSpeed > 0.05) {
        s.tipAxis.set(s.vel.x, 0, s.vel.z).normalize()
        s.tipAxis.crossVectors(_up, s.tipAxis).negate()
        s.tipAngle = Math.min(s.tipAngle + hSpeed * dt * 2.4, Math.PI / 2 * 0.9)
      }
      if (hSpeed < 0.04 && s.pos.y <= baseY + 0.001) {
        s.moving = false
        s.vel.set(0, 0, 0)
      }
      invalidate()
    }

    if (groupRef.current) {
      groupRef.current.position.copy(s.pos)
      groupRef.current.quaternion.setFromAxisAngle(s.tipAxis, s.tipAngle)
    }
  })

  return <group ref={groupRef} position={position}>{children}</group>
}

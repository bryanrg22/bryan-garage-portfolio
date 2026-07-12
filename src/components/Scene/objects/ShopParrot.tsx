import { useRef, useEffect, useCallback } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { ballWorld, displacedCount } from '../../../lib/ballWorld'
import { trackEvent } from '../../../lib/analytics'

// Flight tuning
const FLY_Y = 3.3            // cruise altitude — clears the lift posts (3.07)
const ELLIPSE = { cx: 0, cz: 1.2, rx: 3.0, rz: 2.2 } // loop inside the walls
const TAKEOFF_S = 1.1
const LOOP_S = 8.0           // two full laps
const LAND_S = 1.6
const COOLDOWN_S = 8         // min rest between flights
const HAVOC_PROPS = 3        // displaced objects (ball counts) = "a lot of havoc"

const _vec = new THREE.Vector3()

/**
 * The shop parrot — a procedural yellow-headed Amazon (green body, yellow
 * head, red wing patches) built from ~10 primitives, so it costs zero
 * download and a handful of draw calls. It perches on the back workbench
 * completely static (no frames scheduled — the demand-frameloop stays at
 * 0fps idle). It takes off and flies two laps around the garage when:
 *  - the room descends into chaos (ball flying + several props knocked over),
 *  - the ball whizzes right past its perch, or
 *  - a visitor clicks it.
 * While airborne it self-invalidates every frame, exactly like the ball.
 */
export default function ShopParrot({ position }: { position: [number, number, number] }) {
  const rootRef = useRef<THREE.Group>(null)
  const leftWingRef = useRef<THREE.Group>(null)
  const rightWingRef = useRef<THREE.Group>(null)
  const invalidate = useThree((s) => s.invalidate)

  // All flight state lives in one lazily-initialized ref (mutated in useFrame)
  const flightRef = useRef<{
    perch: THREE.Vector3
    mode: 'perch' | 'fly'
    t: number            // seconds since takeoff
    theta0: number       // ellipse entry angle (points at the perch)
    entry: THREE.Vector3 // takeoff target on the ellipse
    prev: THREE.Vector3  // previous frame position (for heading)
    cooldownUntil: number
  } | null>(null)
  if (flightRef.current === null) {
    const perch = new THREE.Vector3(...position)
    const theta0 = Math.atan2((perch.z - ELLIPSE.cz) / ELLIPSE.rz, (perch.x - ELLIPSE.cx) / ELLIPSE.rx)
    flightRef.current = {
      perch,
      mode: 'perch',
      t: 0,
      theta0,
      entry: new THREE.Vector3(
        ELLIPSE.cx + ELLIPSE.rx * Math.cos(theta0),
        FLY_Y,
        ELLIPSE.cz + ELLIPSE.rz * Math.sin(theta0),
      ),
      prev: perch.clone(),
      cooldownUntil: 0,
    }
  }

  const takeOff = useCallback((trigger: 'havoc' | 'near_miss' | 'click') => {
    const f = flightRef.current!
    if (f.mode === 'fly') return
    f.mode = 'fly'
    f.t = 0
    f.prev.copy(f.perch)
    trackEvent('parrot_flight', { trigger })
    invalidate()
  }, [invalidate])

  // Dev-only test hook
  useEffect(() => {
    if (!import.meta.env.DEV) return
    const w = window as Window & { __parrot?: { fly: () => void; mode: () => string } }
    w.__parrot = { fly: () => takeOff('click'), mode: () => flightRef.current!.mode }
    return () => { delete w.__parrot }
  }, [takeOff])

  const onPointerDown = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    takeOff('click')
  }, [takeOff])

  useFrame((state, rawDelta) => {
    const f = flightRef.current!
    const root = rootRef.current
    if (!root) return
    const now = state.clock.elapsedTime

    if (f.mode === 'perch') {
      // Free checks — these only run on frames something else already
      // scheduled (ball physics renders frames while anything interesting
      // could possibly happen). Zero frames are scheduled by the parrot.
      if (ballWorld.moving && now > f.cooldownUntil) {
        const speed = Math.hypot(ballWorld.vel.x, ballWorld.vel.z)
        if (displacedCount() >= HAVOC_PROPS && speed > 2.5) takeOff('havoc')
        else if (_vec.copy(ballWorld.pos).distanceTo(f.perch) < 1.1 && speed > 1.5) takeOff('near_miss')
      }
      return
    }

    // ---- flying ----
    const dt = Math.min(rawDelta, 0.05)
    f.t += dt
    const pos = root.position
    const smooth = (p: number) => p * p * (3 - 2 * p) // smoothstep

    if (f.t < TAKEOFF_S) {
      const p = smooth(f.t / TAKEOFF_S)
      pos.lerpVectors(f.perch, f.entry, p)
      pos.y = f.perch.y + (FLY_Y - f.perch.y) * p + Math.sin(p * Math.PI) * 0.25
    } else if (f.t < TAKEOFF_S + LOOP_S) {
      const p = (f.t - TAKEOFF_S) / LOOP_S
      const theta = f.theta0 + p * Math.PI * 4 // two laps
      pos.set(
        ELLIPSE.cx + ELLIPSE.rx * Math.cos(theta),
        FLY_Y + Math.sin(theta * 3) * 0.12,
        ELLIPSE.cz + ELLIPSE.rz * Math.sin(theta),
      )
    } else if (f.t < TAKEOFF_S + LOOP_S + LAND_S) {
      const p = smooth((f.t - TAKEOFF_S - LOOP_S) / LAND_S)
      pos.lerpVectors(f.entry, f.perch, p)
      pos.y = FLY_Y + (f.perch.y - FLY_Y) * p
    } else {
      // touched down
      pos.copy(f.perch)
      root.rotation.set(0, 0, 0)
      if (leftWingRef.current) leftWingRef.current.rotation.z = 0
      if (rightWingRef.current) rightWingRef.current.rotation.z = 0
      f.mode = 'perch'
      f.cooldownUntil = now + COOLDOWN_S
      invalidate() // one last frame to settle
      return
    }

    // Face the direction of travel (model faces +z), bank into the loop
    const dx = pos.x - f.prev.x
    const dz = pos.z - f.prev.z
    if (dx * dx + dz * dz > 1e-8) {
      root.rotation.y = Math.atan2(dx, dz)
      const inLoop = f.t > TAKEOFF_S && f.t < TAKEOFF_S + LOOP_S
      root.rotation.z = THREE.MathUtils.lerp(root.rotation.z, inLoop ? 0.25 : 0, dt * 5)
    }
    f.prev.copy(pos)

    // Wing beat — raised spread + sine flap
    const flap = 0.45 + Math.sin(f.t * 11) * 0.55
    if (leftWingRef.current) leftWingRef.current.rotation.z = flap
    if (rightWingRef.current) rightWingRef.current.rotation.z = -flap

    invalidate()
  })

  return (
    <group
      ref={rootRef}
      position={position}
      onPointerDown={onPointerDown}
      onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { document.body.style.cursor = 'default' }}
    >
      {/* Body — green, slightly upright like a perched Amazon */}
      <mesh position={[0, 0.14, 0]} scale={[0.85, 1.25, 0.95]} castShadow>
        <sphereGeometry args={[0.085, 16, 12]} />
        <meshStandardMaterial color="#4c9c3e" roughness={0.85} />
      </mesh>
      {/* Head — yellow */}
      <mesh position={[0, 0.28, 0.02]} castShadow>
        <sphereGeometry args={[0.06, 16, 12]} />
        <meshStandardMaterial color="#ecd24f" roughness={0.8} />
      </mesh>
      {/* Beak — horn colored, curved down */}
      <mesh position={[0, 0.272, 0.072]} rotation={[1.35, 0, 0]}>
        <coneGeometry args={[0.02, 0.05, 10]} />
        <meshStandardMaterial color="#cbb6a0" roughness={0.6} />
      </mesh>
      {/* Eyes */}
      <mesh position={[-0.032, 0.295, 0.045]}>
        <sphereGeometry args={[0.009, 8, 6]} />
        <meshStandardMaterial color="#2a1e14" roughness={0.4} />
      </mesh>
      <mesh position={[0.032, 0.295, 0.045]}>
        <sphereGeometry args={[0.009, 8, 6]} />
        <meshStandardMaterial color="#2a1e14" roughness={0.4} />
      </mesh>
      {/* Wings — darker green, hinged at the shoulder so they can flap */}
      <group ref={leftWingRef} position={[-0.075, 0.19, 0]}>
        <mesh position={[-0.005, -0.06, -0.01]} scale={[0.3, 1.3, 1.0]} castShadow>
          <sphereGeometry args={[0.06, 12, 10]} />
          <meshStandardMaterial color="#3d8434" roughness={0.85} />
        </mesh>
        {/* Red carpal patch */}
        <mesh position={[-0.014, -0.005, 0.02]} scale={[1, 0.7, 1.4]}>
          <sphereGeometry args={[0.014, 8, 6]} />
          <meshStandardMaterial color="#d94a38" roughness={0.8} />
        </mesh>
      </group>
      <group ref={rightWingRef} position={[0.075, 0.19, 0]}>
        <mesh position={[0.005, -0.06, -0.01]} scale={[0.3, 1.3, 1.0]} castShadow>
          <sphereGeometry args={[0.06, 12, 10]} />
          <meshStandardMaterial color="#3d8434" roughness={0.85} />
        </mesh>
        <mesh position={[0.014, -0.005, 0.02]} scale={[1, 0.7, 1.4]}>
          <sphereGeometry args={[0.014, 8, 6]} />
          <meshStandardMaterial color="#d94a38" roughness={0.8} />
        </mesh>
      </group>
      {/* Tail — short and squared, angled down behind the perch edge */}
      <mesh position={[0, 0.09, -0.095]} rotation={[0.45, 0, 0]}>
        <boxGeometry args={[0.05, 0.016, 0.15]} />
        <meshStandardMaterial color="#3d8434" roughness={0.85} />
      </mesh>
      {/* Invisible hitbox for reliable clicks (handlers live on the group) */}
      <mesh visible={false} position={[0, 0.17, 0]}>
        <sphereGeometry args={[0.28, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  )
}

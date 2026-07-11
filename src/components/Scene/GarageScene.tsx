import { Suspense, useCallback, useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import Garage from './Garage'
import CameraController from './CameraController'
import RenderController from './RenderController'
import Particles from './Particles'
import InteractiveObject from './objects/InteractiveObject'
import KickableSoccerBall from './objects/KickableSoccerBall'
import KnockableProp from './objects/KnockableProp'
import ShopDog from './objects/ShopDog'
import GarageDoor from './GarageDoor'
import Macbook from './objects/Macbook'
import JBLBoombox from './objects/JBLBoombox'
import CarLift from './objects/CarLift'
import NissanGTR from './objects/NissanGTR'
import ToolBox from './objects/ToolBox'
import { portfolioItems } from '../../data/portfolio'
import { useStore } from '../../stores/useStore'
import type { QualityConfig } from '../../lib/gpuTier'

// Draco decoder for compressed GLB models — self-hosted (copied from
// three/examples/jsm/libs/draco/gltf) so first model load skips a DNS+TLS
// round-trip to gstatic.com and works offline
useGLTF.setDecoderPath('/draco/')

// Load priority tiers — lightest first, heaviest last.
// Each tier waits for the previous to mount before loading.
const loadTiers: string[][] = [
  ['soccer', 'boombox'],              // tier 0: small models
  ['skills', 'projects'],             // tier 1: medium models (~5 MB)
  ['gtr'],                             // tier 2: heaviest model (~15 MB)
]

/** Hook that progressively unlocks GLB model tiers with delays */
function useProgressiveLoad(showHeavyModels: boolean) {
  const [allowedIds, setAllowedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    let cancelled = false
    async function loadTiersSequentially() {
      for (let i = 0; i < loadTiers.length; i++) {
        // Skip the GTR tier when heavy models are disabled
        if (loadTiers[i].includes('gtr') && !showHeavyModels) continue

        // Wait before loading each tier to let the GPU breathe
        await new Promise((r) => setTimeout(r, i === 0 ? 500 : 1500))
        if (cancelled) return
        setAllowedIds((prev) => {
          const next = new Set(prev)
          for (const id of loadTiers[i]) next.add(id)
          return next
        })
      }
    }
    loadTiersSequentially()
    return () => { cancelled = true }
  }, [showHeavyModels])

  return allowedIds
}

/** Map item id → lazy-loaded GLB component */
function GLBChild({ id }: { id: string }) {
  switch (id) {
    case 'skills':
      return <ToolBox />
    case 'boombox':
      return <JBLBoombox />
    case 'projects':
      return <Macbook />
    default:
      return undefined
  }
}

function SceneContent({ quality }: { quality: QualityConfig }) {
  const allowedIds = useProgressiveLoad(quality.showHeavyModels)

  return (
    <>
      {portfolioItems.map((item) => {
        const hasGLB = ['soccer', 'skills', 'boombox', 'projects'].includes(item.id)
        const isAllowed = allowedIds.has(item.id)
        // Soccer ball is special: click opens the story, drag-and-release kicks it
        if (item.id === 'soccer' && isAllowed) {
          return (
            <Suspense key={item.id} fallback={null}>
              <KickableSoccerBall item={item} />
            </Suspense>
          )
        }
        // Boombox gets shoved around by the ball; the heavy toolbox only
        // slides a little. Both stay fully clickable (KnockableProp wraps,
        // it doesn't intercept pointer events).
        if ((item.id === 'boombox' || item.id === 'skills') && isAllowed) {
          const knock = item.id === 'boombox'
            ? { id: 'boombox', radius: 0.55, height: 0.5, massFactor: 0.35, resetDelay: 0.1 }
            : { id: 'toolbox', radius: 0.6, height: 1.0, massFactor: 0.15, resetDelay: 0.15 }
          return (
            <KnockableProp key={item.id} {...knock} position={item.position} tippable={false}>
              <InteractiveObject item={{ ...item, position: [0, 0, 0] }}>
                <Suspense fallback={null}>
                  <GLBChild id={item.id} />
                </Suspense>
              </InteractiveObject>
            </KnockableProp>
          )
        }
        return (
          <InteractiveObject key={item.id} item={item}>
            {hasGLB && isAllowed ? (
              <Suspense fallback={null}>
                <GLBChild id={item.id} />
              </Suspense>
            ) : undefined}
          </InteractiveObject>
        )
      })}
      {/* Car lift — decorative only, not interactive. Hidden on low/mid tiers for performance. */}
      {quality.showHeavyModels && allowedIds.has('projects') && (
        <Suspense fallback={null}>
          <group position={[2.5, 0, 2.8]}>
            <CarLift />
          </group>
        </Suspense>
      )}
      {/* Nissan GTR R34 — decorative only, not interactive. Hidden on low/mid tiers for performance. */}
      {quality.showHeavyModels && allowedIds.has('gtr') && (
        <Suspense fallback={null}>
          <group position={[-4.1, 1.04, -0.82]}>
            <NissanGTR />
          </group>
        </Suspense>
      )}
    </>
  )
}

export default function GarageScene() {
  const setActiveItem = useStore((s) => s.setActiveItem)
  const setIsLoaded = useStore((s) => s.setIsLoaded)
  const quality = useStore((s) => s.qualityConfig)
  const [sceneKey, setSceneKey] = useState(0)

  const handleCreated = useCallback(
    (state: { gl: THREE.WebGLRenderer; scene: THREE.Scene; camera: THREE.Camera }) => {
      const { gl, scene, camera } = state

      // Dark background so context loss doesn't flash white
      gl.setClearColor(new THREE.Color('#14120F'), 1)

      // WebGL context-loss recovery
      const canvas = gl.domElement
      canvas.addEventListener('webglcontextlost', (e) => {
        e.preventDefault()
        console.warn('WebGL context lost — will attempt restore')
      })
      canvas.addEventListener('webglcontextrestored', () => {
        console.info('WebGL context restored — remounting scene')
        setSceneKey((k) => k + 1)
      })

      // Synchronous shader pre-compile. We deliberately do NOT use compileAsync
      // here: compileAsync polls completion via requestAnimationFrame, and the
      // Canvas is frameloop="demand" — rAF doesn't tick until invalidate(), so
      // compileAsync's Promise would never resolve and setIsLoaded would never
      // fire. Synchronous compile stalls the main thread for a beat, but it
      // happens inside the loading window where the user is already waiting.
      gl.compile(scene, camera)
      setIsLoaded()
    },
    [setIsLoaded],
  )

  return (
    <div className="absolute inset-0" style={{ background: '#14120F', touchAction: 'none' }}>
      <Canvas
        // Mobile: tier is resolved synchronously at module load (see gpuTier.ts),
        // so this key is stable and never remounts. Desktop: tier starts at LOW
        // and may upgrade once detect-gpu resolves — the remount lets gl props
        // (antialias, shadows) reflect the new tier, since those are only read
        // at context creation.
        key={`${sceneKey}-${quality.tier}`}
        frameloop="demand"
        shadows={quality.shadows}
        dpr={quality.dpr}
        gl={{
          antialias: quality.antialias,
          powerPreference: 'default',
          failIfMajorPerformanceCaveat: true,
        }}
        camera={{ fov: 50, near: 0.1, far: 100 }}
        onPointerMissed={() => setActiveItem(null)}
        onCreated={handleCreated}
      >
        <fog attach="fog" args={['#1a1408', 6, 22]} />
        {quality.showEnvironment && (
          <Suspense fallback={null}>
            {/* Self-hosted copy of drei's "warehouse" preset (empty_warehouse_01_1k.hdr) —
                avoids a runtime fetch from raw.githack.com */}
            <Environment files="/hdri/empty_warehouse_01_1k.hdr" environmentIntensity={quality.environmentIntensity} />
          </Suspense>
        )}
        <RenderController />
        <CameraController />
        <Garage />
        <GarageDoor />
        <Suspense fallback={null}>
          <ShopDog />
        </Suspense>
        {quality.showParticles && <Particles />}
        <SceneContent quality={quality} />
      </Canvas>
    </div>
  )
}

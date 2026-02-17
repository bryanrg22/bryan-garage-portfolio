import { Suspense, useCallback, useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import Garage from './Garage'
import CameraController from './CameraController'
import Particles from './Particles'
import InteractiveObject from './objects/InteractiveObject'
import SoccerBall from './objects/SoccerBall'
import Macbook from './objects/Macbook'
import JBLBoombox from './objects/JBLBoombox'
import CarLift from './objects/CarLift'
import NissanGTR from './objects/NissanGTR'
import ToolBox from './objects/ToolBox'
import { portfolioItems } from '../../data/portfolio'
import { useStore } from '../../stores/useStore'
import { useIsMobile } from '../../hooks/useIsMobile'

// Draco decoder for compressed GLB models
useGLTF.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/')

// Load priority tiers — lightest first, heaviest last.
// Each tier waits for the previous to mount before loading.
const loadTiers: string[][] = [
  ['soccer', 'boombox'],              // tier 0: small models
  ['skills', 'projects'],             // tier 1: medium models (~5 MB)
  ['gtr'],                             // tier 2: heaviest model (~15 MB)
]

/** Hook that progressively unlocks GLB model tiers with delays */
function useProgressiveLoad() {
  const [allowedIds, setAllowedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    let cancelled = false
    async function loadTiersSequentially() {
      for (let i = 0; i < loadTiers.length; i++) {
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
  }, [])

  return allowedIds
}

/** Map item id → lazy-loaded GLB component */
function GLBChild({ id }: { id: string }) {
  switch (id) {
    case 'soccer':
      return <SoccerBall />
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

function SceneContent({ isMobile }: { isMobile: boolean }) {
  const allowedIds = useProgressiveLoad()

  return (
    <>
      {portfolioItems.map((item) => {
        const hasGLB = ['soccer', 'skills', 'boombox', 'projects'].includes(item.id)
        const isAllowed = allowedIds.has(item.id)
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
      {/* Car lift — decorative only, not interactive. Hidden on mobile for performance. */}
      {!isMobile && allowedIds.has('projects') && (
        <Suspense fallback={null}>
          <group position={[2.5, 0, 2.8]}>
            <CarLift />
          </group>
        </Suspense>
      )}
      {/* Nissan GTR R34 — decorative only, not interactive. Hidden on mobile for performance. */}
      {!isMobile && allowedIds.has('gtr') && (
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
  const [sceneKey, setSceneKey] = useState(0)
  const isMobile = useIsMobile()

  const handleCreated = useCallback(
    (state: { gl: THREE.WebGLRenderer }) => {
      const { gl } = state

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

      // Signal that the scene is actually rendering
      setIsLoaded()
    },
    [setIsLoaded],
  )

  return (
    <div className="absolute inset-0" style={{ background: '#14120F', touchAction: 'none' }}>
      <Canvas
        key={sceneKey}
        shadows={!isMobile}
        dpr={isMobile ? 1 : [1, 1.25]}
        gl={{
          antialias: !isMobile,
          powerPreference: 'high-performance',
          failIfMajorPerformanceCaveat: false,
        }}
        camera={{ fov: 50, near: 0.1, far: 100 }}
        onPointerMissed={() => setActiveItem(null)}
        onCreated={handleCreated}
      >
        <fog attach="fog" args={['#1a1408', 6, 22]} />
        <Suspense fallback={null}>
          <Environment preset="warehouse" environmentIntensity={0.3} />
        </Suspense>
        <CameraController />
        <Garage />
        <Particles />
        <SceneContent isMobile={isMobile} />
      </Canvas>
    </div>
  )
}
